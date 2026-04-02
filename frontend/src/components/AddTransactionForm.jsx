// ============================================================
// AddTransactionForm.jsx — New Transaction Input Form
// WHAT IT DOES: Renders a form with 5 fields. On submit it
// calls the addTransaction() API function and passes the new
// record back to App.jsx via the onAdd callback so the table
// updates immediately without a full page refresh.
//
// Only rendered when role === "Admin" (enforced in App.jsx).
// ============================================================

import { useState } from "react";
import { PlusCircle, Loader2 } from "lucide-react";
import { addTransaction } from "../api";

const CATEGORIES = ["Salary", "Freelance", "Consulting", "Investment", "Rent",
                    "Technology", "Food", "Utilities", "Marketing", "Operations",
                    "Travel", "Other"];

// ── Initial form state (blank slate) ─────────────────────────
const EMPTY_FORM = {
  description: "",
  amount:      "",
  type:        "income",
  category:    "Salary",
  date:        new Date().toISOString().split("T")[0], // Today's date
};

export default function AddTransactionForm({ onAdd }) {
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // ── handleChange ─────────────────────────────────────────────
  // WHAT IT DOES: A single change handler for ALL inputs.
  // Uses the input's name attribute to update the correct field.
  // This pattern avoids writing a separate handler per field.
  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  }

  // ── handleSubmit ─────────────────────────────────────────────
  // WHAT IT DOES: Prevents default form reload, validates the
  // amount, calls the API, passes the new row to the parent,
  // and resets the form on success.
  async function handleSubmit(e) {
    e.preventDefault();

    // Client-side guard so users get instant feedback
    if (!form.description.trim()) return setError("Description is required.");
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0)
      return setError("Enter a valid positive amount.");

    setLoading(true);
    setError(null);

    try {
      const newRecord = await addTransaction(form);
      onAdd(newRecord);            // Bubble up to App.jsx
      setForm(EMPTY_FORM);         // Clear form
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Shared input class string ─────────────────────────────────
  const inputCls = `
    w-full px-3 py-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border)]
    text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)]
    transition-all duration-200 focus:border-blue-500/60
    font-body
  `;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-xl bg-blue-500/10">
          <PlusCircle size={16} className="text-blue-400" strokeWidth={2} />
        </div>
        <div>
          <h2 className="font-display font-semibold text-[var(--text-primary)]">
            Add Transaction
          </h2>
          <p className="text-xs text-[var(--text-muted)]">Admin access required</p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Description */}
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="block text-xs font-display font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
            Description
          </label>
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="e.g. Monthly Salary"
            className={inputCls}
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-display font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
            Amount (₹)
          </label>
          <input
            name="amount"
            type="number"
            min="1"
            value={form.amount}
            onChange={handleChange}
            placeholder="e.g. 5000"
            className={inputCls}
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-xs font-display font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
            Type
          </label>
          <select name="type" value={form.type} onChange={handleChange} className={inputCls}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-display font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
            Category
          </label>
          <select name="category" value={form.category} onChange={handleChange} className={inputCls}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-display font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
            Date
          </label>
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            className={inputCls}
            style={{ colorScheme: "dark" }}
          />
        </div>

        {/* Submit */}
        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="
              w-full flex items-center justify-center gap-2
              px-4 py-2.5 rounded-xl font-display font-semibold text-sm
              bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900
              text-white disabled:text-blue-400
              transition-all duration-200 cursor-pointer disabled:cursor-not-allowed
            "
          >
            {loading
              ? <><Loader2 size={15} className="animate-spin" /> Saving…</>
              : <><PlusCircle size={15} /> Add Transaction</>}
          </button>
        </div>
      </form>
    </div>
  );
}
