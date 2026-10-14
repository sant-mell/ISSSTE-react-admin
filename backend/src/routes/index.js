// Registro de todos los modulos de la API

import { Router } from "express";
import auth from "./auth.js";
import infantes from "./infantes.js";

const router = Router();

router.use("/auth", auth);
router.use("/infantes", infantes);

export default router;