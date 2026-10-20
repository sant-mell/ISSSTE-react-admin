import e, { Router } from "express";
import pool, { withTransaction, cifrar, descifrar, hashCurp } from "../db.js";
import {
  verificarSesion,
  soloRoles,
  filtroAlcance,
  normalizar,
} from "./auth.js";
import { recalcularInfante } from "../crecimiento.js";
import validator from "validator";

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

const tieneNumeros = (texto) => /\d/.test(texto);

// Función para validar las entradas al generar un infante
function validarInfante({
  id_ebdi,
  matricula,
  curp,
  nombre,
  apellido_paterno,
  sexo,
  fecha_nacimiento,
  fecha_ingreso,
  talla_padre_cm,
  talla_madre_cm,
}) {
  const hoy = new Date().toISOString().slice(0, 10);
  if (!Number.isInteger(id_ebdi) || id_ebdi <= 0)
    return "No se encontró ninguna EBDI con estos datos";
  if (!Number.isInteger(matricula) || matricula <= 0)
    return "La matrícula debe cumplir el formato";
  if (!curp || !PATRON_CURP.test(curp))
    return "La CURP es obligatoria y debe tener un formato valido";
  if (!nombre?.trim() || !apellido_paterno?.trim())
    return "El nombre y apellido paterno es obligatorio";
  if (tieneNumeros(nombre) || tieneNumeros(apellido_paterno))
    return "El nombre y apellido no pueden contener números";
  if (![1, 2].includes(sexo)) return "Es obligatorio especificar el sexo";
  if (!fecha_nacimiento || fecha_nacimiento > hoy) {
    return "La fecha de nacimiento es obligatoria y no futura";
  }
  if (!fecha_ingreso || fecha_ingreso > hoy)
    return "La fecha de ingreso es obligatoria y no futura";
  if (
    talla_padre_cm != null &&
    !(
      typeof talla_padre_cm === "number" &&
      talla_padre_cm >= 100 &&
      talla_padre_cm <= 220
    )
  ) {
    return "La talla del padre debe estar entre 100 y 220 cm";
  }
  if (
    talla_madre_cm != null &&
    !(
      typeof talla_madre_cm === "number" &&
      talla_madre_cm >= 100 &&
      talla_madre_cm <= 220
    )
  ) {
    return "La talla del madre debe estar entre 100 y 220 cm";
  }
  return null;
}

// Función para validar las entradas al hacer un tutor
const PARENTESCOS = ["madre", "padre", "abuelo/abuela", "tutor", "otro"];
function validarTutor(t, i) {
  const { nombre, apellido_paterno, telefono, email, parentesco, principal } =
    t;

  if (typeof nombre !== "string" || !nombre.trim())
    return "El nombre es obligatorio";
  if (typeof apellido_paterno !== "string" || !apellido_paterno.trim())
    return "El apellido paterno es obligatorio";
  if (tieneNumeros(nombre) || tieneNumeros(apellido_paterno))
    return "El nombre y apellido no pueden contener números";
  if (typeof telefono !== "string" || !/^\d{10}$/.test(telefono))
    return "El teléfono debe tener 10 dígitos";
  if (typeof email !== "string" || !validator.isEmail(email))
    return "Correo no es válido";
  if (!PARENTESCOS.includes(parentesco)) return "El parentesco no es válido";
  if (typeof principal !== "boolean")
    return "Indica si la persona es el tutor principal";

  return null;
}

// Revisa la lista completa de personas
function validarTutores(tutores) {
  if (!Array.isArray(tutores) || tutores.length < 1 || tutores.length > 3)
    return "Registrar de 1 a 3 personas";

  for (const [i, persona] of tutores.entries()) {
    const error = validarTutor(persona, i);
    if (error) return error;
  }

  const principales = tutores.filter((p) => p.principal === true).length;
  if (principales !== 1) return "Debe haber solo un tutor principal";

  return null;
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

// POST /api/infantes
router.post(
  "/",
  soloRoles("Administrador", "Personal de estancia"),
  async (req, res) => {
    const body = req.body ?? {};
    const d = {
      ...body,
      curp:
        typeof body.curp === "string"
          ? body.curp.trim().toUpperCase()
          : body.curp,
    };

    const error = validarInfante(d) ?? validarTutores(d.tutores);
    if (error) return res.status(400).json({ mensaje: error });

    const alcance = filtroAlcance(req.sesion);
    const [ebdi] = await pool.query(
      `SELECT e.id_ebdi FROM EBDI e
      JOIN Estado s ON s.id_estado = e.id_estado
      JOIN Region r ON r.id_region = s.id_region
      WHERE e.id_ebdi = ? AND ${alcance.sql}`,
      [d.id_ebdi, ...alcance.params],
    );
    if (!ebdi)
      return res.status(400).json({ mensaje: "No tienes acceso a este EBDI" });

    const id = await withTransaction(async (db) => {
      const resInfante = await db.query(
        `INSERT INTO Infante (id_ebdi, matricula, curp, curp_hash, nombre, apellido_paterno,
        apellido_materno, sexo, fecha_nacimiento, fecha_ingreso, talla_madre_cm, talla_padre_cm, estatus)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          d.id_ebdi,
          d.matricula,
          cifrar(d.curp),
          hashCurp(d.curp),
          cifrar(d.nombre.trim()),
          cifrar(d.apellido_paterno.trim()),
          cifrar(d.apellido_materno?.trim()),
          d.sexo,
          d.fecha_nacimiento,
          d.fecha_ingreso,
          d.talla_madre_cm,
          d.talla_padre_cm,
          "activo",
        ],
      );
      const idNuevoInfante = Number(resInfante.insertId);

      // Insertar tutores
      for (const tutor of d.tutores) {
        const resTutor = await db.query(
          `INSERT INTO Tutor (nombre, apellido_paterno, apellido_materno, telefono, email)
          VALUES (?, ?, ?, ?, ?)`,
          [
            cifrar(tutor.nombre.trim()),
            cifrar(tutor.apellido_paterno.trim()),
            cifrar(tutor.apellido_materno?.trim()),
            cifrar(tutor.telefono.trim()),
            cifrar(tutor.email.trim()),
          ],
        );
        const idTutor = Number(resTutor.insertId);

        // Insertar en tabla TutorInfante
        await db.query(
          `INSERT INTO Infante_Tutor (id_infante, id_tutor, parentesco, tutor_principal)
          VALUES (?, ?, ?, ?)`,
          [idNuevoInfante, idTutor, tutor.parentesco, tutor.principal],
        );
      }
      return idNuevoInfante;
    });
    res.status(201).json({
      id,
      mensaje: "Infante y tutores registrados correctamente ",
    });
  },
);

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
