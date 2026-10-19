import { Router } from "express";
import argon2 from "argon2";
import pool, { withTransaction } from "../db.js";
import { verificarSesion, soloRoles, MAX_INTENTOS } from "./auth.js";

const router = Router();
router.use(verificarSesion, soloRoles("Administrador"));

const ALCANCES = `
    SELECT a.id_usuario,
    GROUP_CONCAT(COALESCE(r.nombre, s.nombre, CONCAT("EBDI ", e.numero)) SEPARATOR ', ') AS alcance
    FROM Usuario_Alcance a
    LEFT JOIN Region r ON r.id_region = a.id_region
    LEFT JOIN Estado s ON s.id_estado = a.id_estado
    LEFT JOIN EBDI e ON e.id_ebdi = a.id_ebdi
    GROUP BY a.id_usuario`;

// Revisa los datos del formulario
async function validar(d, esNuevo) {
  if (!d.nombre?.trim() || !d.email?.trim() || !d.id_rol) {
    return { error: "Nombre, correo y rol son obligatorios " };
  }

  if (esNuevo && !d.password) return { error: "La contraseña es obligatoria" };
  if (d.password && d.password.length < 8)
    return { error: "La contraseña debe tener al menos 8 caracteres" };

  const [rol] = await pool.query(
    `SELECT alcance_nacional FROM Rol WHERE id_rol = ?`,
    [d.id_rol],
  );
  if (!rol) return { error: "Rol no válido" };

  const total =
    (d.regiones?.length ?? 0) +
    (d.estados?.length ?? 0) +
    (d.ebdis?.length ?? 0);
  if (!rol.alcance_nacional && total === 0)
    return { error: "Asigna al menos una región, estado o EBDI" };

  return { nacional: Boolean(rol.alcance_nacional) };
}

// Reemplaza los alcances del usuario por los del formulario
async function guardarAlcances(
  db,
  idUsuario,
  nacional,
  { regiones = [], estados = [], ebdis = [] },
) {
  await db.query(`DELETE FROM Usuario_Alcance WHERE id_usuario = ?`, [
    idUsuario,
  ]);
  // Como nacional ve todo, no necesita ningun alcance
  if (nacional) return;

  const filas = [
    ...regiones.map((id) => [idUsuario, id, null, null]),
    ...estados.map((id) => [idUsuario, null, id, null]),
    ...ebdis.map((id) => [idUsuario, null, null, id]),
  ];

  await db.batch(
    `INSERT INTO Usuario_Alcance (id_usuario, id_region, id_estado, id_ebdi) VALUES (?, ?, ?, ?)`,
    filas,
  );
}

// GET /api/usuarios
router.get("/", async (req, res) => {
  const { q, id_rol } = req.query;
  const condiciones = ["1 = 1"];
  const params = [MAX_INTENTOS];

  if (q) {
    condiciones.push("(u.nombre LIKE ? OR u.email LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }

  if (id_rol) {
    condiciones.push("u.id_rol = ?");
    params.push(id_rol);
  }

  const filas = await pool.query(
    `SELECT u.id_usuario AS id, u.nombre, u.email, u.activo, u.intentos_fallidos >= ? AS bloqueado, r.rol, r.alcance_nacional, al.alcance
    FROM Usuario u
    JOIN Rol r ON r.id_rol = u.id_rol
    LEFT JOIN (${ALCANCES}) al ON al.id_usuario = u.id_usuario
    WHERE ${condiciones.join(" AND ")}
    ORDER BY u.nombre`,
    params,
  );

  const inicio = Number(req.query._start) || 0;
  const fin = Number(req.query._end) || filas.length;
  res.set("x-total-count", String(filas.length)).json(filas.slice(inicio, fin));
});

// GET /api/usuarios/:id
router.get("/:id", async (req, res) => {
  const [usuario] = await pool.query(
    `SELECT id_usuario AS id, nombre, email, id_rol, activo, intentos_fallidos >= ? AS bloqueado
        FROM Usuario WHERE id_usuario = ?`,
    [MAX_INTENTOS, req.params.id],
  );

  if (!usuario)
    return res.status(404).json({ mensaje: "No se encontró el usuario" });

  const alcances = await pool.query(
    `SELECT id_region, id_estado, id_ebdi
    FROM Usuario_Alcance
    WHERE id_usuario = ?`,
    [req.params.id],
  );

  const ids = (campo) => alcances.map((a) => a[campo]).filter(Boolean);

  res.json({
    ...usuario,
    activo: Boolean(usuario.activo),
    bloqueado: Boolean(usuario.bloqueado),
    regiones: ids("id_region"),
    estados: ids("id_estado"),
    ebdis: ids("id_ebdi"),
  });
});

// POST /api/usuarios
router.post("/", async (req, res) => {
  const d = req.body ?? {};
  const { error, nacional } = await validar(d, true);
  if (error) return res.status(400).json({ mensaje: error });

  const id = await withTransaction(async (db) => {
    const r = await db.query(
      `INSERT INTO Usuario (id_rol, email, nombre, contrasena_hash, activo) VALUES (?, ?, ?, ?, ?)`,
      [
        d.id_rol,
        d.email.trim().toLowerCase(),
        d.nombre.trim(),
        await argon2.hash(d.password),
        d.activo === false ? 0 : 1,
      ],
    );

    await guardarAlcances(db, r.insertId, nacional, d);
    return r.insertId;
  });

  res.status(201).json({ id });
});

// PATCH /api/usuarios/:id
router.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const d = req.body ?? {};
  const { error, nacional } = await validar(d, false);
  if (error) return res.status(400).json({ mensaje: error });

  // Evita que el ADMIN se bloquee sí mismo
  if (id === req.sesion.id_usuario && (d.activo === false || !nacional)) {
    return res.status(400).json({
      mensaje: "No puedes desactivar tu cuenta ni quitarte el rol de ADMIN",
    });
  }

  await withTransaction(async (db) => {
    await db.query(
      `UPDATE Usuario SET nombre = ?, email = ?, id_rol = ?, activo = ? WHERE id_usuario = ?`,
      [
        d.nombre.trim(),
        d.email.trim().toLowerCase(),
        d.id_rol,
        d.activo === false ? 0 : 1,
        id,
      ],
    );

    if (d.password) {
      await db.query(
        `
            UPDATE Usuario SET contrasena_hash = ? WHERE id_usuario = ?`,
        [await argon2.hash(d.password), id],
      );
    }

    if (d.desbloquear) {
      await db.query(
        `UPDATE Usuario SET intentos_fallidos = 0 WHERE id_usuario = ?`,
        [id],
      );
    }
    await guardarAlcances(db, id, nacional, d);
  });
  res.json({ id });
});

export default router;
