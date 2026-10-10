import { Router } from "express";
import db from "../db.js";

const router = Router();

// SQLite guarda booleanos como 0/1; la API los devuelve como true/false
const aProducto = (fila) => ({ ...fila, nuevo: Boolean(fila.nuevo) });

router.get("/", (req, res) => {
  const filas = db.prepare("SELECT * FROM productos ORDER BY id").all();
  res.json(filas.map(aProducto));
});

export default router;