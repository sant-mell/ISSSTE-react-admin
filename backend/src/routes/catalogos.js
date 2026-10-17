import { Router } from "express";
import pool from "../db.js";
import { verificarSesion, soloRoles, filtroAlcance, PERSONAL } from "./auth.js";

const router = Router();
router.use(verificarSesion, soloRoles(...PERSONAL));

// GET /api/catalogos/ebdi
router.get("/ebdi", async (req, res) => {
  const alcance = filtroAlcance(req.sesion);
  const filas = await pool.query(
    `SELECT e.id_ebdi AS id, e.numero, e.nombre, e.tipo_ebdi, e.municipio, s.id_estado, s.nombre AS estado, r.id_region, r.nombre AS region
        FROM EBDI e
        JOIN Estado s ON s.id_estado = e.id_estado
        JOIN Region r ON r.id_region = s.id_region
        WHERE ${alcance.sql}
        ORDER BY e.numero`,
    alcance.params,
  );

  res.set("x-total-count", String(filas.length));
  res.json(filas);
});

// GET /api/catalogos/roles
router.get("/roles", async (req, res) => {
  const filas = await pool.query(
    `SELECT id_rol AS id, rol, alcance_nacional FROM Rol ORDER BY id_rol`,
  );

  res.set("x-total-count", String(filas.length));
  res.json(filas);
});

export default router;
