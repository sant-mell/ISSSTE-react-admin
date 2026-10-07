import mariadb from "mariadb";
import dotenv from "dotenv";

dotenv.config();

// Creamos un estanque (Pool) de conexiones seguro
const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "3306"),
  connectionLimit: 5, // Límite de conexiones simultáneas
});

console.log(" Conectando a MariaDB...");

export default pool;
