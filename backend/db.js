// ============================================================
// db.js — Database Module (using sql.js — pure JavaScript SQLite)
// WHAT IT DOES: Loads the SQLite engine from a WebAssembly
// binary (sql.js), then opens or creates a finance.db file
// on disk. Exports helper functions so server.js can run
// SQL queries without worrying about file I/O.
// ============================================================

const initSqlJs = require("sql.js");
const fs        = require("fs");
const path      = require("path");

const DB_PATH = path.join(__dirname, "finance.db");

let db = null;

// ── init() ───────────────────────────────────────────────────
// WHAT IT DOES: Asynchronously loads the WASM SQLite engine,
// reads finance.db from disk if it exists, otherwise creates
// a fresh database and the transactions table.
async function init() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log("Connected to existing database:", DB_PATH);
  } else {
    db = new SQL.Database();
    console.log("Created new database:", DB_PATH);
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT    NOT NULL,
      amount      REAL    NOT NULL,
      type        TEXT    NOT NULL,
      category    TEXT    NOT NULL,
      date        TEXT    NOT NULL,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  save();
  return db;
}

// ── save() ───────────────────────────────────────────────────
// WHAT IT DOES: Persists the in-memory SQLite database to disk
// so data is not lost when the server restarts.
function save() {
  const data   = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

// ── query() ──────────────────────────────────────────────────
// WHAT IT DOES: Runs a SELECT and returns all matching rows
// as plain JavaScript objects (column name -> value).
function query(sql, params = []) {
  const stmt    = db.prepare(sql);
  const results = [];
  stmt.bind(params);
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

// ── run() ────────────────────────────────────────────────────
// WHAT IT DOES: Executes INSERT/UPDATE/DELETE and saves to disk.
// Returns the auto-incremented ID of the last inserted row.
function run(sql, params = []) {
  db.run(sql, params);
  const lastId = db.exec("SELECT last_insert_rowid() AS id")[0]?.values[0][0];
  save();
  return lastId;
}

// ── getOne() ─────────────────────────────────────────────────
// WHAT IT DOES: Returns only the first row of a SELECT query,
// or null if no rows matched.
function getOne(sql, params = []) {
  const rows = query(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

module.exports = { init, query, run, getOne, save };
