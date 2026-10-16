import { Router } from "express";
import pool, { descifrar } from "../db.js";
import { verificarSesion } from "./auth.js";

const router = Router();

const CONSULTA = `
    SELECT i.id_infante, i.matricula, i.nombre, i.apellido_paterno, i.apellido_materno,
    i.sexo, i.fecha_nacimiento, i.estatus, e.nombre AS ebdi
    FROM Infante i
    JOIN EBDI e ON e.id_ebdi = i.id_ebdi
    JOIN Estado s ON s.id_estado = e.id_estado`;

// GET /api/infantes
router.get("/", verificarSesion, async (req, res) => {
  const { tipo, id_infante, id_usuario, nacional } = req.sesion;
  let filas;

  if (tipo === "tutor") {
    // La madre o padre solo pueden ver los datos del hijo
    filas = await pool.query(`${CONSULTA} WHERE i.id_infante = ?`, [
      id_infante,
    ]);
  } else {
    // El personal del ISSSTE pueden ver hasta lo que su alcance los permite
    // Nacional, Regional, Estado o EBDI
    filas = await pool.query(
      `${CONSULTA} WHERE ? = 1 OR EXISTS (
        SELECT 1 FROM Usuario_Alcance a
        WHERE a.id_usuario = ?
        AND (a.id_ebdi = e.id_ebdi OR a.id_estado = s.id_estado OR a.id_region = s.id_region))
        ORDER BY i.matricula`,
      [nacional, id_usuario],
    );
  }

  const infantes = filas.map((f) => ({
    id: f.id_infante,
    matricula: f.matricula,
    nombre: descifrar(f.nombre),
    apellido_paterno: descifrar(f.apellido_paterno),
    apellido_materno: descifrar(f.apellido_materno),
    sexo: f.sexo === 1 ? "Hombre" : "Mujer",
    fecha_nacimiento: f.fecha_nacimiento,
    curp: f.curp,
    estatus: f.estatus,
    ebdi: f.ebdi,
  }));

  const inicio = Number(req.query._start) || 0;
  const fin = Number(req.query._end) || infantes.length;

  res.set("x-total-count", String(infantes.length));
  res.json(infantes.slice(inicio, fin));
});

export default router;
