// ============================================================
// server.js — Updated to serve Frontend + Backend on one port
// ============================================================

const express = require("express");
const cors    = require("cors");
const path    = require("path"); // NEW: Required to handle file paths
const db      = require("./db");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors()); // Keep CORS for development flexibility
app.use(express.json());

// ── NEW: Serve Static Files ──────────────────────────────────
// WHAT THIS DOES: Tells Express to look into the 'dist' folder 
// for the HTML, CSS, and JS files created by Vite.
app.use(express.static(path.join(__dirname, "dist")));

// ── API Routes ───────────────────────────────────────────────
// (Keep all your existing API routes exactly as they were)

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Finance API is running" });
});

app.get("/api/transactions", (req, res) => {
  try {
    const rows = db.query("SELECT * FROM transactions ORDER BY date DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/stats", (req, res) => {
  try {
    const row = db.getOne(`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS totalIncome,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS totalExpenses
      FROM transactions
    `);
    res.json({
      totalIncome: row.totalIncome,
      totalExpenses: row.totalExpenses,
      netBalance: row.totalIncome - row.totalExpenses,
    });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/transactions", (req, res) => {
  const { description, amount, type, category, date } = req.body;
  if (!description || !amount || !type || !category || !date) {
    return res.status(400).json({ error: "All fields are required." });
  }
  try {
    const lastId = db.run(
      "INSERT INTO transactions (description, amount, type, category, date) VALUES (?, ?, ?, ?, ?)",
      [description, parseFloat(amount), type, category, date]
    );
    const newRow = db.getOne("SELECT * FROM transactions WHERE id = ?", [lastId]);
    res.status(201).json(newRow);
  } catch (err) {
    res.status(500).json({ error: "Could not add transaction." });
  }
});

app.delete("/api/transactions/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    db.run("DELETE FROM transactions WHERE id = ?", [id]);
    res.json({ success: true, deletedId: id });
  } catch (err) {
    res.status(500).json({ error: "Could not delete transaction." });
  }
});

// ── NEW: Catch-all Route ──────────────────────────────────────
// WHAT THIS DOES: If a user refreshes the page or goes to a URL 
// that isn't an API, send them the 'index.html'. This is crucial
// for React Router to work.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// ── Bootstrap ─────────────────────────────────────────────────
db.init().then(() => {
  app.listen(PORT, () => {
    console.log(`Finance system live at http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error("Failed to initialise database:", err);
  process.exit(1);
});