// Cargar las tablas LMS de WHO y CDC en MariaDB
// y recalcula evaluaciones de crecimiento
// Ejecutar con: npm run referencias

import "dotenv/config";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import pool, { withTransaction } from "./db.js";
import { evaluacionMedicion } from "./crecimiento";

// Carpeta donde estan los CSV
const CARPETA = fileURLToPath(
  new URL("../../database/referencias/", import.meta.url),
);

const VERSIONES = {
  WHO: "OMS 2024",
  CDC: "CDC 2024",
};

const ARCHIVOS = [
  // OMS: 0 a 24 meses
  ["OMS", "wa", 1, "WHO-Boys-Weight-for-age-Percentiles.csv", true],
  ["OMS", "wa", 2, "WHO-Girls-Weight-for-age-Percentiles", true],
  ["OMS", "ha", 1, "WHO-Boys-Length-for-age-Percentiles.csv", true],
  ["OMS", "ha", 2, "WHO-Girls-Length-for-age-Percentiles.csv", true],
  ["OMS", "wh", 1, "WHO-Boys-Weight-for-length-Percentiles.csv", true],
  ["OMS", "wh", 2, "WHO-Girls-Weight-for-length-Percentiles.csv", true],
  [
    "OMS",
    "hc",
    1,
    "WHO-Boys-Head-Circumference-for-age-Percentiles.csv",
    false,
  ],
  [
    "OMS",
    "hc",
    2,
    "WHO-Girls-Head-Circumference-for-age-Percentiles.csv",
    false,
  ],

  // CDC: 2 a 20 años
  ["CDC", "wa", null, "CDC-Weight-for-age-Percentiles.csv", true],
  ["CDC", "ha", null, "CDC-Length-for-age-Percentiles", true],
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

  const encabezado = separar(lineas[0].map((c) => c.toLowerCase()));
  const iX = encabezado.findIndex((c) => COLUMNAS_X.includes(c));
  const [iSexo, iL, iM, iS] = ["sex", "l", "m", "s"].map((c) =>
    encabezado.indexOf(c),
  );

  const filas = [];
  for (const linea of linea.slice(1)) {
    const v = separar(linea);

    // Saltar lineas y encabezados repetidos
    if (!v[iX] || Number.isNaN(Number(v[iX]))) continue;
    filas.push(
      iSexo >= 0 ? Number(v[iSexo]) : sexo,
      Number(v[iX]),
      Number(v[iL]),
      Number(v[iM]),
      Number(v[iS]),
    );
  }

  return filas;
}

// Cargar las tablas de LMS
await withTransaction(async (db) => {
  const [admin] = await db.query(
    `SELECT u.id_usuario FROM Usuario u JOIN Rol r ON r.id_rol = u.id_rol
        WHERE r.alcance_nacional = 1 ORDER BY u.id_usuario LIMIT 1`,
  );
});
