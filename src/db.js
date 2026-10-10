import "dotenv/config";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";

const db = new Database("tienda.db");
db.pragma("journal_mode = WAL");

db.exec(`
 CREATE TABLE IF NOT EXISTS usuarios (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario       TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
  )
`);


// Crea el admin inicial desde el .env solo si no existe
const adminUser = process.env.ADMIN_USER;
const adminPass = process.env.ADMIN_PASSWORD;

if (adminUser && adminPass) {
  const existe = db.prepare("SELECT id FROM usuarios WHERE usuario = ?").get(adminUser);
  if (!existe) {
    db.prepare("INSERT INTO usuarios (usuario, password_hash) VALUES (?, ?)")
      .run(adminUser, bcrypt.hashSync(adminPass, 10));
  }
}

export default db;