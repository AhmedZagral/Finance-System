// ============================================================
// TransactionsTable.jsx — Data Table
// WHAT IT DOES: Renders the list of all transactions as a
// styled table. Admins see a Delete button per row; Analysts
// are blocked from this view entirely (handled in App.jsx).
// The delete action calls the API and notifies the parent
// via onDelete so the list stays in sync without re-fetching.
// ============================================================

import { useState } from "react";
import { Trash2, ArrowUpCircle, ArrowDownCircle, Loader2, Table2 } from "lucide-react";
import { deleteTransaction } from "../api";

// ── formatCurrency ───────────────────────────────────────────
// Formats raw numbers to Indian Rupee strings (e.g. ₹1,73,300)
function formatCurrency(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(n);
}

// ── formatDate ───────────────────────────────────────────────
// Converts "2024-06-15" to a readable "15 Jun 2024" string
function formatDate(str) {
  return new Date(str + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function TransactionsTable({ transactions, role, onDelete, loading }) {
  // deletingId tracks which row is currently being deleted
  // so we can show a spinner on just that row's button.
  const [deletingId, setDeletingId] = useState(null);

  // ── handleDelete ───────────────────────────────────────────
  // WHAT IT DOES: Calls DELETE /api/transactions/:id. On
  // success, passes the id to onDelete so App.jsx removes
  // it from state without triggering a full data reload.
  async function handleDelete(id) {
    if (!window.confirm("Delete this transaction?")) return;
    setDeletingId(id);
    try {
      await deleteTransaction(id);
      onDelete(id);
    } catch (err) {
      alert("Delete failed: " + err.message);
    } finally {
      setDeletingId(null);
    }
  }

  // ── Loading skeleton ──────────────────────────────────────
  if (loading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden fade-in-up">
        <div className="p-6 border-b border-[var(--border)]">
          <div className="h-5 w-40 rounded bg-[var(--border)] animate-pulse" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-[var(--border)] last:border-0">
            <div className="h-4 w-4 rounded-full bg-[var(--border)] animate-pulse" />
            <div className="h-4 flex-1 rounded bg-[var(--border)] animate-pulse" />
            <div className="h-4 w-24 rounded bg-[var(--border)] animate-pulse" />
            <div className="h-4 w-20 rounded bg-[var(--border)] animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden fade-in-up">
      {/* Table header bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/10">
            <Table2 size={15} className="text-blue-400" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-[var(--text-primary)] text-sm">
              Transactions
            </h2>
            <p className="text-xs text-[var(--text-muted)]">{transactions.length} records</p>
          </div>
        </div>

        {/* Role badge */}
        <span className={`
          text-xs font-display font-semibold px-2.5 py-1 rounded-lg border
          ${role === "Admin"
            ? "bg-blue-500/10 border-blue-500/30 text-blue-300"
            : "bg-amber-500/10 border-amber-500/30 text-amber-300"}
        `}>
          {role}
        </span>
      </div>

      {/* Scrollable table wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {["#", "Description", "Category", "Date", "Type", "Amount",
                ...(role === "Admin" ? [""] : [])
              ].map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left text-xs font-display font-semibold uppercase tracking-widest text-[var(--text-muted)]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={role === "Admin" ? 7 : 6} className="px-6 py-16 text-center text-[var(--text-muted)]">
                  No transactions found.
                </td>
              </tr>
            ) : (
              transactions.map((t, idx) => (
                <tr
                  key={t.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-card-hover)] transition-colors duration-150"
                >
                  {/* Row number */}
                  <td className="px-4 py-3.5 text-[var(--text-muted)] font-mono text-xs">
                    {String(idx + 1).padStart(2, "0")}
                  </td>

                  {/* Description */}
                  <td className="px-4 py-3.5 font-medium text-[var(--text-primary)] max-w-[200px] truncate">
                    {t.description}
                  </td>

                  {/* Category badge */}
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded-md bg-[var(--bg-base)] border border-[var(--border)] text-xs text-[var(--text-secondary)] font-display">
                      {t.category}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3.5 text-[var(--text-secondary)] whitespace-nowrap">
                    {formatDate(t.date)}
                  </td>

                  {/* Type icon + label */}
                  <td className="px-4 py-3.5">
                    <div className={`flex items-center gap-1.5 text-xs font-display font-semibold
                      ${t.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                      {t.type === "income"
                        ? <ArrowUpCircle size={13} strokeWidth={2.5} />
                        : <ArrowDownCircle size={13} strokeWidth={2.5} />}
                      {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                    </div>
                  </td>

                  {/* Amount */}
                  <td className={`px-4 py-3.5 font-display font-bold tabular-nums
                    ${t.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                    {t.type === "expense" ? "−" : "+"}{formatCurrency(t.amount)}
                  </td>

                  {/* Delete button — Admin only */}
                  {role === "Admin" && (
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleDelete(t.id)}
                        disabled={deletingId === t.id}
                        className="
                          p-1.5 rounded-lg text-[var(--text-muted)]
                          hover:bg-rose-500/15 hover:text-rose-400
                          disabled:opacity-40 transition-all duration-200 cursor-pointer
                        "
                        title="Delete transaction"
                      >
                        {deletingId === t.id
                          ? <Loader2 size={14} className="animate-spin" />
                          : <Trash2 size={14} strokeWidth={2} />}
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
