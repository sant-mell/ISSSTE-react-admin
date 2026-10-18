import { fuentePara, x_LMS } from "../crecimiento.js";
import pool from "../db.js";
import { verificarSesion } from "./auth.js";
import { Router } from "express";

const router = Router();

// GET /api/referencias/curvas?indicador=ha&sexo=2&desde=24&hasta=60[&edad=30]
// De vuelve los percentiles 5, 50 y 95
router.get("/curvas", verificarSesion, async (req, res) => {
  const { indicador, sexo, desde, hasta, edad } = req.query;

  const filas = await pool.query(
    `SELECT t.variable_X AS x, t.valor_L as L, t.valor_M as M, t.valor_S AS S, v.fuente
    FROM Tabla_Referencia t
    JOIN Version_Referencia v ON v.id_version = t.id_version
    JOIN Indicador i ON i.id_indicador = t.id_indicador
    WHERE v.vigente = 1 AND i.codigo = ? AND t.sexo = ? AND t.variable_X BETWEEN ? AND ?
    ORDER BY t.variable_X`,
    [indicador, sexo, desde, hasta],
  );

  const fuenteCorrecta = (f) =>
    f.fuente === fuentePara(indicador === "wh" ? Number(edad) : f.x);

  const redondear = (v) => Number(v.toFixed(2));
  res.json(
    filas.filter(fuenteCorrecta).map((f) => ({
      x: f.x,
      p5: redondear(x_LMS(-1.645, f)),
      p50: redondear(f.M),
      p95: redondear(x_LMS(1.645, f)),
    })),
  );
});

export default router;
