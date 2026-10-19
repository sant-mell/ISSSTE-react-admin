// Calculo de crecimiento con LMS
// Datos otorgados por la CDC y WHO

const LIMITES_BIV = {
  wa: [-6, 5],
  ha: [-6, 6],
  wh: [-5, 5],
  bmi: [-5, 5],
  hc: [-5, 5],
};

const redondear = (valor, decimales) => Number(valor.toFixed(decimales));

// Transformar la edad en meses, el programa CDC lo calcula así: dias / 30.4375
export function edadEnMeses(fechaNacimiento, fecha) {
  const dias = (new Date(fecha) - new Date(fechaNacimiento)) / 86400000;
  return dias / 30.4375;
}

// Menores de 24 meses usan OMS
// Mayores de 24 meses usan CDC
export const fuentePara = (edadMeses) => (edadMeses < 24 ? "OMS" : "CDC");

export const imc = (pesoKg, tallaCm) => pesoKg / (tallaCm / 100) ** 2;

// CALCULOS
export function z_LMS(x, { L, M, S }) {
  return L === 0 ? Math.log(x / M) / S : ((x / M) ** L - 1) / (L * S);
}

export function x_LMS(z, { L, M, S }) {
  return L === 0 ? M * Math.exp(S * z) : M * (1 + L * S * z) ** (1 / L);
}

// Obtener el percentil de un z-score
// Aproximación de Abramowitz y Stegun
export function percentil_z(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const densidad = 0.3989422804 * Math.exp((-z * z) / 2);
  const cola =
    densidad *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return 100 * (z > 0 ? 1 - cola : cola);
}

// Buscar L, M, S para un valor de x (talla, edad)
// Se interpola entre las 2 filas cercanas
export async function buscarLMS(db, fuente, codigo, sexo, x) {
  const base = `SELECT t.id_referencia, t.variable_X AS x, t.valor_L AS L, t.valor_M AS M, t.valor_S AS S
        FROM Tabla_Referencia t
        JOIN Version_Referencia v ON v.id_version = t.id_version
        JOIN Indicador i ON i.id_indicador = t.id_indicador
        WHERE v.fuente = ? AND v.vigente = 1 AND i.codigo = ? AND t.sexo = ?`;

  const filas = await db.query(
    `(${base} AND t.variable_X <= ? ORDER BY t.variable_X DESC LIMIT 1)
    UNION ALL
    (${base} AND t.variable_X >= ? ORDER BY t.variable_X ASC LIMIT 1)`,
    [fuente, codigo, sexo, x, fuente, codigo, sexo, x],
  );

  if (filas.length < 2) return null;

  const [abajo, arriba] = filas;
  if (abajo.x == arriba.x) return abajo;

  const f = (x - abajo.x) / (arriba.x - abajo.x);
  return {
    id_referencia: abajo.id_referencia,
    L: abajo.L + f * (arriba.L - abajo.L),
    M: abajo.M + f * (arriba.M - abajo.M),
    S: abajo.S + f * (arriba.S - abajo.S),
  };
}

// Calcular las mediciones
export async function evaluarMedicion(db, idMedicion) {
  const [m] = await db.query(
    `SELECT m.fecha, m.peso_kg, m.talla_cm, m.perimetro_cefalico_cm, i.sexo, i.fecha_nacimiento
        FROM Medicion_Infante m
        JOIN Infante i ON i.id_infante = m.id_infante
        WHERE m.id_medicion = ?`,
    [idMedicion],
  );

  const edad = edadEnMeses(m.fecha_nacimiento, m.fecha);
  const fuente = fuentePara(edad);

  const valores = {
    wa: { x: edad, y: m.peso_kg },
    ha: { x: edad, y: m.talla_cm },
    wh: { x: m.talla_cm, y: m.peso_kg },
    bmi: { x: edad, y: imc(m.peso_kg, m.talla_cm) },
    hc: { x: edad, y: m.perimetro_cefalico_cm },
  };

  await db.query("DELETE FROM Evaluacion_Nutricional WHERE id_medicion = ?", [
    idMedicion,
  ]);

  for (const [codigo, { x, y }] of Object.entries(valores)) {
    if (y === null) continue; // Sin dato
    const lms = await buscarLMS(db, fuente, codigo, m.sexo, x);
    if (!lms) continue;

    const z = redondear(z_LMS(y, lms), 3);
    const percentil = redondear(percentil_z(z), 2);
    const [min, max] = LIMITES_BIV[codigo];
    const biv = z < min ? -1 : z > max ? 1 : 0;

    await db.query(
      `INSERT INTO Evaluacion_Nutricional (id_medicion, id_indicador, id_referencia, id_categoria, z_score, percentil, flag_biv)
        SELECT ?, c.id_indicador, ?, c.id_categoria, ?, ?, ?
        FROM Categoria_Nutricional c
        JOIN Indicador i ON i.id_indicador = c.id_indicador
        WHERE i.codigo = ?
        AND (c.z_min IS NULL OR ? >= c.z_min)
        AND (c.z_max IS NULL OR ? < c.z_max)
        LIMIT 1`,
      [idMedicion, lms.id_referencia, z, percentil, biv, codigo, z, z],
    );
  }
}

export async function recalcularInfante(db, idInfante) {
  const mediciones = await db.query(
    `SELECT id_medicion FROM Medicion_Infante WHERE id_infante = ?`,
    [idInfante],
  );

  for (const { id_medicion } of mediciones) {
    await evaluarMedicion(db, id_medicion);
  }
}
