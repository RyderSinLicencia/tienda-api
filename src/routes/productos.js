import { Router } from "express";
import db from "../db.js";
import { requireAuth } from "../auth.js";
import { upload, borrarImagen } from "../upload.js";

const router = Router();

const aProducto = (fila) => ({ ...fila, nuevo: Boolean(fila.nuevo) });

function validar(body = {}) {
  const nombre = typeof body.nombre === "string" ? body.nombre.trim() : "";
  const categoria = typeof body.categoria === "string" ? body.categoria.trim() : "";
  const precio = Number(body.precio);
  const color = typeof body.color === "string" ? body.color : "#d9c5b2";
  // Con multipart los valores llegan como texto ("true"/"false")
  const nuevo = body.nuevo === true || body.nuevo === "true" || body.nuevo === "1";

  if (nombre.length < 3 || nombre.length > 80) return { error: "Nombre: entre 3 y 80 caracteres" };
  if (!categoria || categoria.length > 40) return { error: "Categoría requerida (máx. 40 caracteres)" };
  if (!Number.isInteger(precio) || precio <= 0) return { error: "Precio: debe ser un entero mayor a 0" };
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) return { error: "Color: formato #RRGGBB" };

  return { datos: { nombre, categoria, precio, color, nuevo: nuevo ? 1 : 0 } };
}

router.get("/", (req, res) => {
  const filas = db.prepare("SELECT * FROM productos ORDER BY id").all();
  res.json(filas.map(aProducto));
});

router.post("/", requireAuth, upload.single("imagen"), (req, res) => {
  const { error, datos } = validar(req.body);
  if (error) {
    borrarImagen(req.file?.filename); // no dejar archivos huérfanos
    return res.status(400).json({ error });
  }

  const info = db
    .prepare(
      "INSERT INTO productos (nombre, categoria, precio, color, nuevo, imagen) VALUES (@nombre, @categoria, @precio, @color, @nuevo, @imagen)"
    )
    .run({ ...datos, imagen: req.file?.filename ?? null });

  const creado = db.prepare("SELECT * FROM productos WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(aProducto(creado));
});

router.put("/:id", requireAuth, upload.single("imagen"), (req, res) => {
  const id = Number(req.params.id);
  const actual = db.prepare("SELECT * FROM productos WHERE id = ?").get(id);
  if (!actual) {
    borrarImagen(req.file?.filename);
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  const { error, datos } = validar(req.body);
  if (error) {
    borrarImagen(req.file?.filename);
    return res.status(400).json({ error });
  }

  let imagen = actual.imagen;
  if (req.file) {
    borrarImagen(actual.imagen);
    imagen = req.file.filename;
  } else if (req.body.quitarImagen === "true") {
    borrarImagen(actual.imagen);
    imagen = null;
  }

  db.prepare(
    "UPDATE productos SET nombre=@nombre, categoria=@categoria, precio=@precio, color=@color, nuevo=@nuevo, imagen=@imagen WHERE id=@id"
  ).run({ ...datos, imagen, id });

  const actualizado = db.prepare("SELECT * FROM productos WHERE id = ?").get(id);
  res.json(aProducto(actualizado));
});

router.delete("/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const fila = db.prepare("SELECT imagen FROM productos WHERE id = ?").get(id);
  if (!fila) return res.status(404).json({ error: "Producto no encontrado" });

  db.prepare("DELETE FROM productos WHERE id = ?").run(id);
  borrarImagen(fila.imagen);
  res.status(204).end();
});

export default router;