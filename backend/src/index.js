import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import pool from "./db.js"; //  Aquí va la extensión corregida

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuraciones de seguridad globales
app.use(helmet());
app.use(cors());
app.use(express.json()); // Permite recibir JSON en las peticiones

// Ruta de prueba inicial
app.get("/api/status", async (req, res) => {
  try {
    // Probamos una consulta rápida a la base de datos
    const conn = await pool.getConnection();
    const rows = await conn.query("SELECT VERSION() as version");
    conn.release(); // Liberamos la conexión de vuelta al pool

    res.json({
      status: "online",
      proyecto: "ISSSTE Padrón Infantil",
      db_version: rows[0].version,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(` Servidor corriendo con éxito en http://localhost:${PORT}`);
});
