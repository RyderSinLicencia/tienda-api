import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";

const router = Router();

router.post("/login", (req, res) => {
  const { usuario, password } = req.body || {};

  if (typeof usuario !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Usuario y contraseña requeridos" });
  }

  const fila = db.prepare("SELECT * FROM usuarios WHERE usuario = ?").get(usuario);

  // Mismo mensaje en ambos casos para no revelar si el usuario existe
  if (!fila || !bcrypt.compareSync(password, fila.password_hash)) {
    return res.status(401).json({ error: "Credenciales incorrectas" });
  }

  const token = jwt.sign(
    { id: fila.id, usuario: fila.usuario },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.json({ token });
});

export default router;