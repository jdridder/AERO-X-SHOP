import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '..', 'data', 'vault.sqlite');

let db;
try {
  db = new Database(dbPath);
  console.log('Connected to SQLite database at', dbPath);
} catch (err) {
  console.error('Database connection error:', err.message);
  process.exit(1);
}

try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      items TEXT NOT NULL,
      total_price REAL NOT NULL,
      shipping_address TEXT NOT NULL,
      is_paid INTEGER DEFAULT 0,
      status TEXT DEFAULT 'processed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  console.log('Database schema initialized');
} catch (err) {
  console.error('Schema initialization error:', err.message);
  process.exit(1);
}

export const queryAll = (sql, params = []) => {
  try {
    return db.prepare(sql).all(params);
  } catch (err) {
    throw err;
  }
};

export const queryRun = (sql, params = []) => {
  try {
    return db.prepare(sql).run(params);
  } catch (err) {
    throw err;
  }
};

export const queryGet = (sql, params = []) => {
  try {
    return db.prepare(sql).get(params);
  } catch (err) {
    throw err;
  }
};

export default db;
