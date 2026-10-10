import Database from "better-sqlite3";

const db = new Database("tienda.db");
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS productos (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre    TEXT NOT NULL,
    categoria TEXT NOT NULL,
    precio    INTEGER NOT NULL CHECK (precio > 0),
    color     TEXT NOT NULL DEFAULT '#d9c5b2',
    nuevo     INTEGER NOT NULL DEFAULT 0
  )
`);

// Datos de ejemplo: solo se cargan si la tabla está vacía
const { total } = db.prepare("SELECT COUNT(*) AS total FROM productos").get();

if (total === 0) {
  const insertar = db.prepare(
    "INSERT INTO productos (nombre, categoria, precio, color, nuevo) VALUES (?, ?, ?, ?, ?)"
  );
  const semilla = [
    ["Polera Oversize", "Poleras", 19990, "#d9c5b2", 1],
    ["Jeans Slim Fit", "Pantalones", 39990, "#7a8ba3", 0],
    ["Chaqueta Denim", "Chaquetas", 54990, "#4f6a8a", 1],
    ["Vestido Lino", "Vestidos", 44990, "#e6d8c3", 0],
    ["Hoodie Básico", "Polerones", 34990, "#3a3a3a", 0],
    ["Camisa Blanca", "Camisas", 27990, "#f0ede8", 1],
  ];
  db.transaction(() => semilla.forEach((p) => insertar.run(...p)))();
}

export default db;