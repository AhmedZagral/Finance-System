// ============================================================
// api.js — API Service Layer
// WHAT IT DOES: Centralises every HTTP call to the backend in
// one file. Components import functions from here rather than
// calling fetch() directly — this means if the base URL ever
// changes, you only update ONE line of code.
// ============================================================

// The base URL of our Express backend.
// In production you'd replace this with an environment variable.
const API_BASE_URL = "/api";

// ── Helper: handleResponse ───────────────────────────────────
// WHAT IT DOES: Checks if the HTTP response was successful
// (status 200-299). If not, it reads the error message from
// the JSON body and throws it so callers can catch it.
async function handleResponse(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── fetchStats ───────────────────────────────────────────────
// WHAT IT DOES: Calls GET /api/stats and returns an object
// with totalIncome, totalExpenses, and netBalance numbers.
export async function fetchStats() {
  const res = await fetch(`${BASE_URL}/stats`);
  return handleResponse(res);
}

// ── fetchTransactions ────────────────────────────────────────
// WHAT IT DOES: Calls GET /api/transactions and returns the
// full array of transaction rows from the SQLite database.
export async function fetchTransactions() {
  const res = await fetch(`${BASE_URL}/transactions`);
  return handleResponse(res);
}

// ── addTransaction ───────────────────────────────────────────
// WHAT IT DOES: Sends a POST request with the new transaction
// data as a JSON body. Returns the saved record (with its
// auto-generated ID) so the UI can append it immediately.
export async function addTransaction(data) {
  const res = await fetch(`${BASE_URL}/transactions`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(data),
  });
  return handleResponse(res);
}

// ── deleteTransaction ────────────────────────────────────────
// WHAT IT DOES: Sends a DELETE request to /api/transactions/:id.
// Returns { success: true, deletedId } on success.
export async function deleteTransaction(id) {
  const res = await fetch(`${BASE_URL}/transactions/${id}`, {
    method: "DELETE",
  });
  return handleResponse(res);
}
