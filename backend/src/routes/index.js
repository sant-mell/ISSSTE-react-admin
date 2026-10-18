// Registro de todos los modulos de la API

import { Router } from "express";
import auth from "./auth.js";
import infantes from "./infantes.js";
import catalogos from "./catalogos.js";
import mediciones from "./mediciones.js";
import referencias from "./referencias.js";
import usuarios from "./usuarios.js";

const router = Router();

router.use("/auth", auth);
router.use("/infantes", infantes);
router.use("/catalogos", catalogos);
router.use("/mediciones", mediciones);
router.use("/referencias", referencias);
router.use("/usuarios", usuarios);

export default router;
