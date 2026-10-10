import "dotenv/config";
import express from "express";
import cors from "cors";
import productosRouter from "./routes/productos.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/productos", productosRouter);

app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada" }));

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});