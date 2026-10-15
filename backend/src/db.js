import mariadb from "mariadb";
import dotenv from "dotenv";
import crypto from "node:crypto";

dotenv.config(); 

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  collation: "utf8mb4_unicode_ci",
  connectionLimit: 10,
  decimalAsNumber: true,
  bigIntAsNumber: true,
  insertIdAsNumber: true,
  dateStrings: true,
});

console.log("Conectando a MariaDB...");
export default pool;

// Operaciones de varios pasos, función que debe fallar
// En caso de que uno de los pasos falle 
export async function withTransaction(fn) {
  const conexion = await pool.getConnection();

  try {
    await conexion.beginTransaction();
    const resultado = await fn(conexion);
    await conexion.commit();
    return resultado; 
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  } 
}

// Cifrado de datos personales (AES-256-GCM)
const CLAVE_CIFRADO = Buffer.from(process.env.CLAVE_CIFRADO ?? "", "hex");

export function cifrar(texto) {
  const iv = crypto.randomBytes(12);
  const cifrador = crypto.createCipheriv("aes-256-gcm", CLAVE_CIFRADO, iv);
  const datos = Buffer.concat([cifrador.update(String(texto), "utf8"), cifrador.final()]);

  return Buffer.concat([iv, cifrador.getAuthTag(), datos]);
}

// Descifrar datos
export function descifrar(buffer) {
  if (buffer == null) return null;
  const iv = buffer.subarray(0, 12);
  const tag = buffer.subarray(12, 28);
  const datos = buffer.subarray(28);

  const descifrador = crypto.createDecipheriv("aes-256-gcm", CLAVE_CIFRADO, iv);
  descifrador.setAuthTag(tag);

  return Buffer.concat([descifrador.update(datos), descifrador.final()]).toString("utf8");
}
