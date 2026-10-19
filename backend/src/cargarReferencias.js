// Cargar las tablas LMS de WHO y CDC en MariaDB
// y recalcula evaluaciones de crecimiento
// Ejecutar con: npm run referencias

import "dotenv/config";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import pool, { withTransaction } from "./db.js";
import { evaluarMedicion } from "./crecimiento.js";

// Carpeta donde estan los CSV
const CARPETA = fileURLToPath(
  new URL("../../database/referencias/", import.meta.url),
);

const VERSIONES = {
  OMS: "OMS 2024",
  CDC: "CDC 2024",
};

const ARCHIVOS = [
  // OMS: 0 a 24 meses
  ["OMS", "wa", 1, "WHO-Boys-Weight-for-age-Percentiles.csv", true],
  ["OMS", "wa", 2, "WHO-Girls-Weight-for-age-Percentiles.csv", true],
  ["OMS", "ha", 1, "WHO-Boys-Length-for-age-Percentiles.csv", true],
  ["OMS", "ha", 2, "WHO-Girls-Length-for-age-Percentiles.csv", true],
  ["OMS", "wh", 1, "WHO-Boys-Weight-for-length-Percentiles.csv", true],
  ["OMS", "wh", 2, "WHO-Girls-Weight-for-length-Percentiles.csv", true],
  ["OMS", "hc", 1, "WHO-Boys-Head-Circumference-for-age-Percentiles.csv", true],
  [
    "OMS",
    "hc",
    2,
    "WHO-Girls-Head-Circumference-for-age-Percentiles.csv",
    true,
  ],

  // CDC: 2 a 20 años
  ["CDC", "wa", null, "CDC-Weight-for-age-Percentiles.csv", true],
  ["CDC", "ha", null, "CDC-Length-for-age-Percentiles.csv", true],
  ["CDC", "bmi", null, "CDC-IMC-for-age-Percentiles.csv", true],
  ["CDC", "wh", null, "CDC-Weight-for-length-Percentiles.csv", true],
];

const COLUMNAS_X = ["agemos", "month", "length", "height"];

// LECTURA DE CSV
function leerCSV(archivo, sexo) {
  const ruta = CARPETA + archivo;

  const lineas = fs
    .readFileSync(ruta, "utf8")
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/);

  const separar = (linea) =>
    linea.split(",").map((c) => c.trim().replace(/"/g, ""));

  const encabezado = separar(lineas[0]).map((c) => c.toLowerCase());
  const iX = encabezado.findIndex((c) => COLUMNAS_X.includes(c));
  const [iSexo, iL, iM, iS] = ["sex", "l", "m", "s"].map((c) =>
    encabezado.indexOf(c),
  );

  const filas = [];
  for (const linea of lineas.slice(1)) {
    if (!linea) continue;
    const v = separar(linea);

    // Saltar lineas y encabezados repetidos
    if (!v[iX] || Number.isNaN(Number(v[iX]))) continue;
    filas.push([
      iSexo >= 0 ? Number(v[iSexo]) : sexo,
      Number(v[iX]),
      Number(v[iL]),
      Number(v[iM]),
      Number(v[iS]),
    ]);
  }

  return filas;
}

// Cargar las tablas de LMS
await withTransaction(async (db) => {
  const [admin] = await db.query(
    `SELECT u.id_usuario FROM Usuario u JOIN Rol r ON r.id_rol = u.id_rol
        WHERE r.alcance_nacional = 1 ORDER BY u.id_usuario LIMIT 1`,
  );

  // Solo una versión vigente
  const idVersion = {};
  for (const [fuente, nombre] of Object.entries(VERSIONES)) {
    await db.query(
      `INSERT INTO Version_Referencia (fuente, nombre, vigente, id_usuario_carga)
      VALUES (?, ?, 1, ?) ON DUPLICATE KEY UPDATE vigente = 1`,
      [fuente, nombre, admin.id_usuario],
    );

    await db.query(
      `UPDATE Version_Referencia SET vigente = 0 WHERE fuente = ? AND nombre <> ?`,
      [fuente, nombre],
    );

    const [v] = await db.query(
      `SELECT id_version FROM Version_Referencia WHERE fuente = ? AND nombre = ?`,
      [fuente, nombre],
    );
    idVersion[fuente] = v.id_version;
  }

  // Filas del LMS en cada archivo
  for (const [fuente, codigo, sexo, archivo, cargar] of ARCHIVOS) {
    if (!cargar) continue;

    const [indicador] = await db.query(
      `SELECT id_indicador FROM Indicador WHERE codigo = ?`,
      [codigo],
    );
    if (!indicador) {
      throw new Error(
        `No existe el indicador '${codigo}' en la tabla Indicador`,
      );
    }

    const filas = leerCSV(archivo, sexo).map((f) => [
      idVersion[fuente],
      indicador.id_indicador,
      ...f,
    ]);

    await db.batch(
      `INSERT INTO Tabla_Referencia (id_version, id_indicador, sexo, variable_X, valor_L, valor_M, valor_S)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE valor_L = VALUES(valor_L), valor_M = VALUES(valor_M),
      valor_S = VALUES(valor_S)`,
      filas,
    );

    console.log(`${archivo}: ${filas.length} filas`);
  }

  const mediciones = await db.query("SELECT id_medicion FROM Medicion_Infante");
  for (const { id_medicion } of mediciones)
    await evaluarMedicion(db, id_medicion);
  console.log(`${mediciones.length} mediciones evaluadas`);
});

await pool.end();
