import { Router } from "express";
import { filtroAlcance, soloRoles, verificarSesion } from "./auth.js";
import { infanteVisible } from "./infantes.js";
import pool, { withTransaction } from "../db.js";
import { edadEnMeses, evaluarMedicion, imc } from "../crecimiento.js";

const router = Router();
router.use(verificarSesion);

// Revisa que los datos tengan sentido
function validarMedicion(
  { fecha, peso_kg, talla_cm, perimetro_cefalico_cm },
  infante,
) {
  const hoy = new Date().toISOString().slice(0, 10);
  if (!fecha || fecha > hoy)
    return "La fecha es obligatoria y no puede ser futura";
  if (fecha < infante.fecha_nacimiento) return "Debe ser una fecha valída";
  if (!(peso_kg >= 0.1 && peso_kg <= 80))
    return "El peso debe estar entre 0.1 y 80kg";
  if (!(talla_cm >= 1 && talla_cm <= 200))
    return "La talla debe estar entew 1 y 200 cm";
  if (
    perimetro_cefalico_cm &&
    !(perimetro_cefalico_cm >= 20 && perimetro_cefalico_cm <= 70)
  ) {
    return "El perímetro cefálico debe estar entre 20 y 70 cm";
  }
  return null;
}

// GET /api/mediciones?id_infante=1
router.get("/", async (req, res) => {
  const infante = await infanteVisible(req.sesion, req.query.id_infante);
  if (!infante)
    return res.status(404).json({ mensaje: "No se encontró el registro" });

  const mediciones = await pool.query(
    `SELECT id_medicion AS id, fecha, peso_kg, talla_cm, perimetro_cefalico_cm, observaciones
    FROM Medicion_Infante WHERE id_infante = ? ORDER BY fecha DESC`,
    [infante.id_infante],
  );

  const evaluaciones = await pool.query(
    `SELECT ev.id_medicion, ind.codigo, ev.z_score, ev.percentil, ev.flag_biv, c.etiqueta, c.nivel_riesgo
    FROM Evaluacion_Nutricional ev
    JOIN Medicion_Infante m ON m.id_medicion = ev.id_medicion
    JOIN Indicador ind ON ind.id_indicador = ev.id_indicador
    JOIN Categoria_Nutricional c ON c.id_categoria = ev.id_categoria
    WHERE m.id_infante = ?`,
    [infante.id_infante],
  );

  const respuesta = mediciones.map((m) => ({
    ...m,
    edad_meses: Number(
      edadEnMeses(infante.fecha_nacimiento, m.fecha).toFixed(2),
    ),
    imc: Number(imc(m.peso_kg, m.talla_cm).toFixed(1)),
    evaluaciones: Object.fromEntries(
      evaluaciones
        .filter((ev) => ev.id_medicion === m.id)
        .map((ev) => [
          ev.codigo,
          {
            z: ev.z_score,
            percentil: ev.percentil,
            categoria: ev.etiqueta,
            nivel: ev.nivel_riesgo,
            biv: ev.flag_biv,
          },
        ]),
    ),
  }));

  res.set("x-total-count", String(respuesta.length)).json(respuesta);
});

// GET /api/mediciones:id
router.get("/:id", async (req, res) => {
  const alcance = filtroAlcance(req.sesion);
  const [medicion] = await pool.query(
    `SELECT m.id_medicion AS id, m.id_infante, m.fecha, m.peso_kg, m.talla_cm,
    m.perimetro_cefalico_cm, m.observaciones
    FROM Medicion_Infante m
    JOIN Infante i ON i.id_infante = m.id_infante
    JOIN EBDI e ON e.id_ebdi = i.id_ebdi
    JOIN Estado s ON s.id_estado = e.id_estado
    WHERE m.id_medicion = ? AND ${alcance.sql}`,
    [req.params.id, ...alcance.params],
  );

  if (!medicion)
    return res.status(404).json({ mensaje: "No se encontró el registro" });
  res.json(medicion);
});

// POST /api/mediciones
router.post(
  "/",
  soloRoles("Personal de estancia", "Administrador"),
  async (req, res) => {
    const d = req.body ?? {};
    const infante = await infanteVisible(req.sesion, d.id_infante);
    if (!infante)
      return res.status(404).json({ mensaje: "No se encontró el registro" });

    const error = validarMedicion(d, infante);
    if (error) return res.status(400).json({ mensaje: error });

    const id = await withTransaction(async (db) => {
      const r = await db.query(
        `INSERT INTO Medicion_Infante (id_infante, id_ebdi, id_usuario, fecha, peso_kg, talla_cm, perimetro_cefalico_cm, observaciones)
            VALUES(?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          infante.id_infante,
          infante.id_ebdi,
          req.sesion.id_usuario,
          d.fecha,
          d.peso_kg,
          d.talla_cm,
          d.perimetro_cefalico_cm || null,
          d.observaciones?.trim() || null,
        ],
      );

      // Las tallas de los padres se guardan en el expediente
      if (d.talla_madre_cm || d.talla_padre_cm) {
        await db.query(
          `UPDATE Infante SET talla_madre_cm = COALESCE(?, talla_madre_cm),
          talla_padre_cm = COALESCE(?, talla_padre_cm)
          WHERE id_infante = ?`,
          [
            d.talla_madre_cm || null,
            d.talla_padre_cm || null,
            infante.id_infante,
          ],
        );
      }

      await evaluarMedicion(db, r.insertId);
      return r.insertId;
    });

    res.status(201).json({ id, id_infante: infante.id_infante });
  },
);

// PATCH /api/mediciones/:id
router.patch("/:id", soloRoles("Administrador"), async (req, res) => {
  const d = req.body ?? {};
  const [actual] = await pool.query(
    `SELECT id_infante FROM Medicion_Infante WHERE id_medicion = ?`,
    [req.params.id],
  );

  if (!actual)
    return res.status(404).json({ mensaje: "No se encontró el registro" });

  const infante = await infanteVisible(req.sesion, actual.id_infante);
  const error = validarMedicion(d, infante);
  if (error) return res.status(400).json({ mensaje: error });

  await withTransaction(async (db) => {
    await db.query(
      `UPDATE Medicion_Infante
        SET fecha = ?, peso_kg = ?, talla_cm = ?, perimetro_cefalico_cm = ?, observaciones = ? WHERE id_medicion = ?`,
      [
        d.fecha,
        d.peso_kg,
        d.talla_cm,
        d.perimetro_cefalico_cm || null,
        d.observaciones?.trim() || null,
        req.params.id,
      ],
    );
    await evaluarMedicion(db, req.params.id);
  });

  res.json({ id: Number(req.params.id) });
});

export default router;
