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
      name TEXT,
      shipping_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id INTEGER,
      items TEXT NOT NULL,
      total_price REAL NOT NULL,
      shipping_address TEXT NOT NULL,
      is_paid INTEGER DEFAULT 0,
      status TEXT DEFAULT 'processed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Add columns if they don't exist (migration for existing databases)
  try {
    db.exec('ALTER TABLE users ADD COLUMN name TEXT');
  } catch (e) { /* Column already exists */ }

  try {
    db.exec('ALTER TABLE users ADD COLUMN shipping_address TEXT');
  } catch (e) { /* Column already exists */ }

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
