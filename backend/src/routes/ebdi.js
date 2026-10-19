import { Router } from "express";
import pool from "../db.js";
import { verificarSesion, soloRoles, PERSONAL } from "./auth.js";

const router = Router();
router.use(verificarSesion, soloRoles(...PERSONAL));

const TIPOS = ["Propias", "Contratadas", "OSC"];

// GET /api/ebdi
router.get("/", async (req, res) => {
  const { tipo_ebdi, id_region, id_estado, q } = req.query;
  const condiciones = ["1 = 1"];
  const params = [];

  if (tipo_ebdi) {
    condiciones.push("e.tipo_ebdi = ?");
    params.push(tipo_ebdi);
  }

  if (id_region) {
    condiciones.push("s.id_region = ?");
    params.push(id_region);
  }

  if (id_estado) {
    condiciones.push("e.id_estado = ?");
    params.push(id_estado);
  }

  if (q) {
    condiciones.push(
      "(e.nombre LIKE ? OR e.numero LIKE ? OR e.municipio LIKE ?)",
    );
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  const filas = await pool.query(
    `SELECT e.id_ebdi AS id, e.numero, e.nombre, e.tipo_ebdi, e.municipio, e.activo, s.nombre AS estado, r.nombre AS region,
    (SELECT COUNT(*) FROM Infante i
    WHERE i.id_ebdi = e.id_ebdi AND i.estatus = "activo") AS infantes_activos
    FROM EBDI e
    JOIN Estado s ON s.id_estado = e.id_estado
    JOIN Region r ON r.id_region = s.id_region
    WHERE ${condiciones.join(" AND ")}
    ORDER BY e.numero`,
    params,
  );

  const inicio = Number(req.query._start) || 0;
  const fin = Number(req.query._end) || filas.length;
  res.set("x-total-count", String(filas.length)).json(filas.slice(inicio, fin));
});

// GET /api/ebdi/:id
router.get("/:id", async (req, res) => {
  const [ebdi] = await pool.query(
    `SELECT id_ebdi AS id, id_estado, numero, nombre, municipio, tipo_ebdi, activo
        FROM EBDI where id_ebdi = ?`,
    [req.params.id],
  );

  if (!ebdi) return res.status(404).json({ mensaje: "No se encontró la EBDI" });
  res.json({ ...ebdi, activo: Boolean(ebdi.activo) });
});

// PATCH /api/ebdi/:id
router.patch("/:id", soloRoles("Administrador"), async (req, res) => {
  const d = req.body ?? {};
  if (
    !d.nombre?.trim() ||
    !d.municipio?.trim() ||
    !TIPOS.includes(d.tipo_ebdi)
  ) {
    return res
      .status(400)
      .json({ mensaje: "Nombre, municipio y tipo son obligatorios" });
  }

  const r = await pool.query(
    `UPDATE EBDI SET nombre = ?, municipio = ?, tipo_ebdi = ?, activo = ?
    WHERE  id_ebdi = ?`,
    [
      d.nombre.trim(),
      d.municipio.trim(),
      d.tipo_ebdi,
      d.activo === false ? 0 : 1,
      req.params.id,
    ],
  );

  if (!r.affectedRows)
    return res.status(404).json({ mensaje: "No se encontró la EBDI" });
  res.json({ id: Number(req.params.id) });
});

export default router;
