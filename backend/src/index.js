import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import pool from "./db.js";
import rutas from "./routes/index.js";
import fs from "node:fs";
import https from "node:https";

const app = express();
app.set("trust proxy", 1);

const PORT = process.env.PORT || 3000;

// Middlewares y seguridad
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

// Confirmar que DB y servidor responden
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT 1 AS ok");
    res.json({
      estado: "ok",
      db: "conectado",
    });
  } catch (error) {
    console.error("Error en la conexión a la DB", error);
    res.status(500).json({
      estado: "error",
      db: "desconectado",
      mensaje: "No se pudo conectar a la base de datos",
    });
  }
});

// Rutas de la API
app.use("/api", rutas);

// Control de errores
app.use((error, req, res, next) => {
  const estado = error.status || 500;
  if (estado === 500) console.error(error);

  res.status(estado).json({
    mensaje:
      estado === 500 ? "Error interno del servidor" : "Solicitud invalida",
  });
});

// Arranque
const HOST = process.env.HOST || "127.0.0.1";

const options = {
  key: fs.readFileSync("./mi_llave.key"),
  cert: fs.readFileSync("./mi_certificado.crt"),
};

https.createServer(options, app).listen(PORT, HOST, () => {
  console.log(`API corriendo con HTTPS en https://${HOST}:${PORT}`);
});

export default app;
