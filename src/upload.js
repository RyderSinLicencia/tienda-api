import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

export const UPLOADS_DIR = path.resolve("uploads");
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const EXTENSIONES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
};

export const upload = multer({
    storage: multer.diskStorage({
        destination: UPLOADS_DIR,
        // Nombre aleatorio: evita colisiones y nombres maliciosos
        filename: (req, file, cb) => cb(null, crypto.randomUUID() + EXTENSIONES[file.mimetype]),
    }),
    limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
    fileFilter: (req, file, cb) =>
        EXTENSIONES[file.mimetype]
            ? cb(null, true)
            : cb(new Error("Solo se permiten imágenes JPG, PNG o WEBP")),
});

export function borrarImagen(nombre) {
    if (!nombre) return;
    fs.unlink(path.join(UPLOADS_DIR, path.basename(nombre)), () => { });
}