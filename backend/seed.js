// ============================================================
// seed.js — Database Seeder
// WHAT IT DOES: Creates the transactions table and inserts
// 15 realistic sample rows so the dashboard is pre-populated.
// Run ONCE with: node seed.js
// ============================================================

const db = require("./db");

const sampleTransactions = [
  { description: "Monthly Salary",          amount: 85000, type: "income",  category: "Salary",      date: "2024-06-01" },
  { description: "Freelance Web Project",   amount: 22000, type: "income",  category: "Freelance",   date: "2024-06-05" },
  { description: "Office Rent",             amount: 18000, type: "expense", category: "Rent",         date: "2024-06-03" },
  { description: "Cloud Server (AWS)",      amount: 4200,  type: "expense", category: "Technology",   date: "2024-06-04" },
  { description: "Team Lunch",              amount: 3500,  type: "expense", category: "Food",         date: "2024-06-07" },
  { description: "Client Retainer Fee",     amount: 35000, type: "income",  category: "Freelance",   date: "2024-06-10" },
  { description: "Software Subscriptions",  amount: 2800,  type: "expense", category: "Technology",   date: "2024-06-10" },
  { description: "Electricity Bill",        amount: 1200,  type: "expense", category: "Utilities",    date: "2024-06-12" },
  { description: "Dividend Income",         amount: 9500,  type: "income",  category: "Investment",  date: "2024-06-15" },
  { description: "Marketing Campaign",      amount: 12000, type: "expense", category: "Marketing",    date: "2024-06-16" },
  { description: "Internet Bill",           amount: 1499,  type: "expense", category: "Utilities",    date: "2024-06-18" },
  { description: "Consulting Fee",          amount: 15000, type: "income",  category: "Consulting",  date: "2024-06-20" },
  { description: "Office Supplies",         amount: 3200,  type: "expense", category: "Operations",   date: "2024-06-22" },
  { description: "Travel Reimbursement",    amount: 6800,  type: "income",  category: "Other",       date: "2024-06-24" },
  { description: "Miscellaneous Expenses",  amount: 2100,  type: "expense", category: "Operations",   date: "2024-06-28" },
];

// ── Seed flow ─────────────────────────────────────────────────
// WHAT THIS DOES: Initialises the database, wipes old data,
// and inserts fresh sample rows — making the seed idempotent
// (safe to run multiple times without duplicating data).
db.init().then(() => {
  console.log("Seeding database...");

  db.run("DELETE FROM transactions");
  console.log("Cleared existing data.");

  sampleTransactions.forEach((t) => {
    db.run(
      "INSERT INTO transactions (description, amount, type, category, date) VALUES (?, ?, ?, ?, ?)",
      [t.description, t.amount, t.type, t.category, t.date]
    );
  });

  console.log(`Seeded ${sampleTransactions.length} transactions successfully!`);
  process.exit(0);
}).catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
