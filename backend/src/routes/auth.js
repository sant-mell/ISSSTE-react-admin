import { Router } from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import pool, { descifrar, hashCurp } from "../db.js";

const router = Router();

const MINUTOS_SESION = 15;
export const MAX_INTENTOS = 5;

// Roles del personal del ISSSTE
export const PERSONAL = [
  "Administrador",
  "Coordinador regional",
  "Personal de estancia",
];

const opcionesCookie = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  path: "/",
};

// Maximo 10 intentos fallidos por IP cada 15 minutos
const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: {
    mensaje: "Demasiados intentos. Espera 15 minutos para reintentar",
  },
});

// Firmar un JWT y guardarlo en una cookie
function crearSesion(res, datos) {
  const token = jwt.sign(datos, process.env.JWT_SECRET, {
    expiresIn: `${MINUTOS_SESION}m`,
  });

  res.cookie("sesion", token, {
    ...opcionesCookie,
    maxAge: MINUTOS_SESION * 60 * 1000,
  });
}

// Normalizar textos (acentos, espacios, mayúsculas, etc)
export function normalizar(texto) {
  return (texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

export async function verificarSesion(req, res, next) {
  const token = req.cookies.sesion;
  if (!token) return res.status(401).json({ mensaje: "Sesión no iniciada" });

  let datos;
  try {
    const { iat, exp, ...resto } = jwt.verify(token, process.env.JWT_SECRET);
    datos = resto;
  } catch {
    res.clearCookie("sesion", opcionesCookie);
    return res.status(401).json({ mensaje: "La sesión expiró" });
  }

  // El rol, alcance y estado se leen en cada petición
  // Un cambio hecho por el admin se aplica inmediatamente
  if (datos.tipo === "personal") {
    const [usuario] = await pool.query(
      `SELECT u.activo, r.rol, r.alcance_nacional
      FROM Usuario u JOIN Rol r ON r.id_rol = u.id_rol
      WHERE u.id_usuario = ?`,
      [datos.id_usuario],
    );

    if (!usuario?.activo) {
      res.clearCookie("sesion", opcionesCookie);
      return res.status(401).json({ mensaje: "Tu cuenta fue desactivada" });
    }
    datos.rol = usuario.rol;
    datos.nacional = usuario.alcance_nacional;
  }

  req.sesion = datos;
  crearSesion(res, datos);
  next();
}

// Solo pueden acceder los roles indicados a las paginas permitadas
export function soloRoles(...roles) {
  return (req, res, next) =>
    roles.includes(req.sesion.rol)
      ? next()
      : res.status(403).json({ mensaje: "No tienes permiso para esta acción" });
}

export function filtroAlcance({ tipo, id_infante, id_usuario, nacional }) {
  if (tipo === "tutor")
    return { sql: "i.id_infante = ?", params: [id_infante] };
  if (nacional) return { sql: "1 = 1", params: [] };
  return {
    sql: `EXISTS (
      SELECT 1 FROM Usuario_Alcance a
      WHERE a.id_usuario = ?
      AND (a.id_ebdi = e.id_ebdi OR a.id_estado = s.id_estado OR a.id_region = s.id_region))`,
    params: [id_usuario],
  };
}

// POST /api/auth/login --> Personal ISSSTE (correo + contraseña)
router.post("/login", limiteLogin, async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res
      .status(400)
      .json({ mensaje: "Correo y contraseña obligatorios" });
  }

  const [usuario] = await pool.query(
    `SELECT u.id_usuario, u.contrasena_hash, u.activo, u.intentos_fallidos,
        r.rol, r.alcance_nacional
    FROM Usuario u JOIN Rol r ON r.id_rol = u.id_rol
    WHERE u.email = ?`,
    [email.trim().toLowerCase()],
  );

  const valida =
    usuario && (await argon2.verify(usuario.contrasena_hash, password));

  if (!valida) {
    if (usuario) {
      await pool.query(
        `UPDATE Usuario SET intentos_fallidos = intentos_fallidos + 1
            WHERE id_usuario = ? AND intentos_fallidos < ?`,
        [usuario.id_usuario, MAX_INTENTOS],
      );
    }
    return res.status(401).json({ mensaje: "Correo o contraseña incorrectos" });
  }

  if (!usuario.activo || usuario.intentos_fallidos >= MAX_INTENTOS) {
    return res.status(403).json({ mensaje: "Cuenta inactiva o bloqueada" });
  }

  await pool.query(
    `UPDATE Usuario SET intentos_fallidos = 0 WHERE id_usuario = ?`,
    [usuario.id_usuario],
  );

  crearSesion(res, {
    tipo: "personal",
    id_usuario: usuario.id_usuario,
    rol: usuario.rol,
    nacional: usuario.alcance_nacional,
  });
  res.json({ mensaje: "Sesión iniciada" });
});

// POST /api/auth/login-tutor
router.post("/login-tutor", limiteLogin, async (req, res) => {
  const { matricula, curp, apellidoPaterno, apellidoMaterno } = req.body ?? {};
  if (!matricula || !curp || !apellidoPaterno) {
    return res.status(400).json({ mensaje: "Completa todos los campos" });
  }

  const [infante] = await pool.query(
    `SELECT id_infante, apellido_paterno, apellido_materno
    FROM Infante
    WHERE matricula = ? AND curp_hash = ? AND estatus = 'activo'`,
    [matricula, hashCurp(curp)],
  );

  const valida =
    infante &&
    normalizar(descifrar(infante.apellido_paterno)) ===
      normalizar(apellidoPaterno) &&
    normalizar(descifrar(infante.apellido_materno)) ===
      normalizar(apellidoMaterno);

  if (!valida) {
    return res
      .status(401)
      .json({ mensaje: "Los datos no coinciden con ningún registro" });
  }

  crearSesion(res, { tipo: "tutor", id_infante: infante.id_infante });
  res.json({ mensaje: "Sesión iniciada" });
});

// GET /api/auth/me
router.get("/me", verificarSesion, async (req, res) => {
  const { tipo, id_usuario, id_infante, rol } = req.sesion;

  if (tipo === "tutor") {
    const [infante] = await pool.query(
      "SELECT nombre FROM Infante WHERE id_infante = ?",
      [id_infante],
    );

    return res.json({
      id: `tutor-${id_infante}`,
      id_infante,
      tipo,
      rol: "Madre, padre o tutor",
      nombre: `Familia de ${descifrar(infante.nombre)}`,
    });
  }

  const [usuario] = await pool.query(
    "SELECT nombre FROM Usuario WHERE id_usuario = ?",
    [id_usuario],
  );

  res.json({ id: id_usuario, tipo, rol, nombre: usuario.nombre });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.clearCookie("sesion", opcionesCookie);
  res.json({ mensaje: "Sesión cerrada" });
});

export default router;
