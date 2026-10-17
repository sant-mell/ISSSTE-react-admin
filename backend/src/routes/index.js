// Registro de todos los modulos de la API

import { Router } from "express";
import auth from "./auth.js";
import infantes from "./infantes.js";
import catalogos from "./catalogos.js";

const router = Router();

router.use("/auth", auth);
router.use("/infantes", infantes);
router.use("/catalogos", catalogos);

export default router;
