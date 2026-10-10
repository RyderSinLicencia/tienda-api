import "dotenv/config";
import express from "express";
import cors from "cors";
import productosRouter from "./routes/productos.js";
import authRouter from "./routes/auth.js";
import { UPLOADS_DIR } from "./upload.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

app.use("/uploads", express.static(UPLOADS_DIR));
app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", authRouter);
app.use("/api/productos", productosRouter);

//app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada" }));
app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "La imagen no puede pesar más de 2 MB" });
  }
  if (err.message?.startsWith("Solo se permiten")) {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});