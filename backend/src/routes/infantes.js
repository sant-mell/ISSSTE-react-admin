import { Router } from "express";
import pool, { withTransaction, cifrar, descifrar, hashCurp } from "../db.js";
import {
  verificarSesion,
  soloRoles,
  filtroAlcance,
  normalizar,
} from "./auth.js";
import { recalcularInfante } from "../crecimiento.js";

const router = Router();
router.use(verificarSesion);

const PATRON_CURP = /^[A-Z]{4}\d{6}[HMX][A-Z]{5}[A-Z0-9]\d$/;

const DESDE = `
  FROM Infante i
  JOIN EBDI e ON e.id_ebdi = i.id_ebdi
  JOIN Estado s ON s.id_estado = e.id_estado
  JOIN Region r ON r.id_region = s.id_region`;

const COLUMNAS = `
  i.id_infante, i.matricula, i.curp, i.nombre, i.apellido_paterno, i.apellido_materno,
  i.sexo, i.fecha_nacimiento, i.fecha_ingreso, i.talla_madre_cm, i.talla_padre_cm, i.estatus,
  e.id_ebdi, e.numero AS ebdi_numero, e.nombre AS ebdi, e.tipo_ebdi, e.municipio,
  s.id_estado, s.nombre AS estado, r.id_region, r.nombre AS region`;

function aRespuesta(f) {
  const nombre = descifrar(f.nombre);
  const paterno = descifrar(f.apellido_paterno);
  const materno = descifrar(f.apellido_materno);
  return {
    id: f.id_infante,
    matricula: f.matricula,
    curp: descifrar(f.curp),
    nombre,
    apellido_paterno: paterno,
    apellido_materno: materno,
    nombre_completo: [nombre, paterno, materno].filter(Boolean).join(" "),
    sexo: f.sexo,
    sexo_texto: f.sexo === 1 ? "Masculino" : "Femenino",
    fecha_nacimiento: f.fecha_nacimiento,
    fecha_ingreso: f.fecha_ingreso,
    talla_madre_cm: f.talla_madre_cm,
    talla_padre_cm: f.talla_padre_cm,
    estatus: f.estatus,
    id_ebdi: f.id_ebdi,
    ebdi: f.ebdi,
    ebdi_numero: f.ebdi_numero,
    tipo_ebdi: f.tipo_ebdi,
    municipio: f.municipio,
    id_estado: f.id_estado,
    estado: f.estado,
    id_region: f.id_region,
    region: f.region,
  };
}

// Función para saber si esta cuenta puede ver al infante
export async function infanteVisible(sesion, idInfante) {
  const alcance = filtroAlcance(sesion);
  const [fila] = await pool.query(
    `SELECT i.id_infante, i.id_ebdi, i.sexo, i.fecha_nacimiento ${DESDE}
    WHERE i.id_infante = ? AND ${alcance.sql}`,
    [idInfante, ...alcance.params],
  );
  return fila;
}

// GET /api/infantes
router.get("/", async (req, res) => {
  const { id_region, id_estado, id_ebdi, q } = req.query;
  const alcance = filtroAlcance(req.sesion);
  const condiciones = [alcance.sql];
  const params = [...alcance.params];

  if (id_region) {
    condiciones.push("r.id_region = ?");
    params.push(id_region);
  }
  if (id_estado) {
    condiciones.push("s.id_estado = ?");
    params.push(id_estado);
  }
  if (id_ebdi) {
    condiciones.push("e.id_ebdi = ?");
    params.push(id_ebdi);
  }

  const sql = `SELECT ${COLUMNAS} ${DESDE} WHERE ${condiciones.join(" AND ")}`;
  const filas = await pool.query(sql, params);

  // Datos cifrados, se cifran y se ordenan aquí
  let infantes = filas.map(aRespuesta);
  if (q) {
    const buscado = normalizar(q);
    infantes = infantes.filter(
      (n) =>
        normalizar(n.nombre_completo).includes(buscado) ||
        String(n.matricula).includes(buscado),
    );
  }
  infantes.sort((a, b) =>
    `${a.nombre} ${a.apellido_paterno}`.localeCompare(
      `${b.nombre} ${b.apellido_paterno}`,
    ),
  );

  const inicio = Number(req.query._start) || 0;
  const fin = Number(req.query._end) || infantes.length;
  res.set("x-total-count", String(infantes.length));
  res.json(infantes.slice(inicio, fin));
});

// GET /api/infantes/:id
router.get("/:id", async (req, res) => {
  const alcance = filtroAlcance(req.sesion);
  const [fila] = await pool.query(
    `SELECT ${COLUMNAS} ${DESDE} WHERE i.id_infante = ? AND ${alcance.sql}`,
    [req.params.id, ...alcance.params],
  );
  if (!fila)
    return res.status(404).json({ mensaje: "No se encontró el registro" });

  const [tutor] = await pool.query(
    `SELECT t.nombre, t.apellido_paterno, t.apellido_materno, t.telefono, it.parentesco
    FROM Infante_Tutor it JOIN Tutor t ON t.id_tutor = it.id_tutor
    WHERE it.id_infante = ? AND it.tutor_principal = 1`,
    [fila.id_infante],
  );

  const historial = await pool.query(
    `SELECT id_historial AS id, fecha, antecedente, diagnostico, observaciones
    FROM Historial_Clinico WHERE id_infante = ? ORDER BY fecha DESC`,
    [fila.id_infante],
  );

  res.json({
    ...aRespuesta(fila),
    tutor: tutor && {
      nombre: [tutor.nombre, tutor.apellido_paterno, tutor.apellido_materno]
        .map(descifrar)
        .filter(Boolean)
        .join(" "),
      telefono: descifrar(tutor.telefono),
      parentesco: tutor.parentesco,
    },
    historial,
  });
});

// PATCH /api/infantes/:id
// Corrección de datos personales, solo puede modificar el ADMIN
router.patch("/:id", soloRoles("Administrador"), async (req, res) => {
  const d = req.body ?? {};
  const curp = d.curp?.trim().toUpperCase() || null;

  if (
    !d.nombre?.trim() ||
    !d.apellido_paterno?.trim() ||
    !d.fecha_nacimiento ||
    ![1, 2].includes(Number(d.sexo))
  ) {
    return res.status(400).json({
      mensaje:
        "Nombre, apellido paterno, sexo y fecha de nacimiento son obligatorios",
    });
  }

  if (curp && !PATRON_CURP.test(curp)) {
    return res
      .status(400)
      .json({ mensaje: "La CURP no tiene un formato válido" });
  }

  const encontrado = await withTransaction(async (db) => {
    const [actual] = await db.query(
      `SELECT sexo, fecha_nacimiento FROM Infante WHERE id_infante = ?`,
      [req.params.id],
    );
    if (!actual) return false;

    await db.query(
      `UPDATE Infante
      SET nombre = ?, apellido_paterno = ?, apellido_materno = ?, curp = ?, curp_hash = ?,
      sexo = ?, fecha_nacimiento = ?, talla_madre_cm = ?, talla_padre_cm = ?, estatus = ?
      WHERE id_infante = ?`,
      [
        cifrar(d.nombre.trim()),
        cifrar(d.apellido_paterno.trim()),
        cifrar(d.apellido_materno?.trim()),
        cifrar(curp),
        curp && hashCurp(curp),
        Number(d.sexo),
        d.fecha_nacimiento,
        d.talla_madre_cm || null,
        d.talla_padre_cm || null,
        d.estatus ?? "activo",
        req.params.id,
      ],
    );

    // Si cambia el sexo o la edad, las evaluaciones se recalculan
    if (
      Number(d.sexo) !== actual.sexo ||
      d.fecha_nacimiento !== actual.fecha_nacimiento
    ) {
      await recalcularInfante(db, req.params.id);
    }
    return true;
  });

  if (!encontrado)
    return res.status(404).json({ mensaje: "No se encontró el registro" });

  res.json({ id: Number(req.params.id) });
});

export default router;
