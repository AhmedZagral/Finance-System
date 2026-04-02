// ============================================================
// App.jsx — Root Application Component
// WHAT IT DOES: Acts as the "brain" of the app. It:
//   1. Holds global state: role, transactions, stats, loading
//   2. Fetches data from the backend on first render (useEffect)
//   3. Distributes state + callbacks to child components
//   4. Enforces the access-control matrix based on current role
//
// STATE MANAGEMENT APPROACH:
//   We use React's built-in useState + useEffect hooks rather
//   than a library like Redux — appropriate for an app of this
//   scope. The parent component is the "single source of truth"
//   and passes data DOWN via props.
// ============================================================

import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp, TrendingDown, Wallet,
  RefreshCw, Loader2, AlertTriangle, Activity
} from "lucide-react";

import { fetchTransactions, fetchStats } from "./api";
import RoleSwitcher        from "./components/RoleSwitcher";
import StatsCard           from "./components/StatsCard";
import AddTransactionForm  from "./components/AddTransactionForm";
import TransactionsTable   from "./components/TransactionsTable";
import AccessBanner        from "./components/AccessBanner";

// ── ACCESS CONTROL MATRIX ────────────────────────────────────
// WHAT THIS DOES: Defines what each role can see/do.
// Using an object lookup is cleaner than chaining if/else.
const PERMISSIONS = {
  Admin:   { canViewStats: true,  canViewTable: true,  canAdd: true,  canDelete: true  },
  Analyst: { canViewStats: true,  canViewTable: false, canAdd: false, canDelete: false },
  Viewer:  { canViewStats: false, canViewTable: true,  canAdd: false, canDelete: false },
};

export default function App() {
  // ── State ─────────────────────────────────────────────────
  const [role,         setRole]         = useState("Admin");
  const [transactions, setTransactions] = useState([]);
  const [stats,        setStats]        = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [lastUpdated,  setLastUpdated]  = useState(null);

  // Derive permissions from the current role
  const perms = PERMISSIONS[role];

  // ── loadData ──────────────────────────────────────────────
  // WHAT IT DOES: Fetches BOTH transactions and stats from the
  // backend in PARALLEL using Promise.all — faster than two
  // sequential awaits which would each wait for the previous.
  // useCallback memoises this function so it's stable across
  // renders (needed because it's used in useEffect's dep array).
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [txData, statsData] = await Promise.all([
        fetchTransactions(),
        fetchStats(),
      ]);
      setTransactions(txData);
      setStats(statsData);
      setLastUpdated(new Date().toLocaleTimeString("en-IN"));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── useEffect: Initial data load ──────────────────────────
  // WHAT IT DOES: Runs loadData() exactly once after the
  // component first mounts in the DOM. The [] dependency array
  // prevents it from re-running on every render.
  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── handleAdd ─────────────────────────────────────────────
  // WHAT IT DOES: When the form adds a new transaction, we
  // PREPEND it to the local state array (so it appears at top)
  // and recompute stats — avoiding a full round-trip refetch.
  function handleAdd(newTx) {
    setTransactions(prev => [newTx, ...prev]);
    setStats(prev => {
      if (!prev) return prev;
      const isIncome = newTx.type === "income";
      return {
        totalIncome:   isIncome ? prev.totalIncome   + newTx.amount : prev.totalIncome,
        totalExpenses: isIncome ? prev.totalExpenses : prev.totalExpenses + newTx.amount,
        netBalance:    isIncome ? prev.netBalance    + newTx.amount : prev.netBalance - newTx.amount,
      };
    });
  }

  // ── handleDelete ──────────────────────────────────────────
  // WHAT IT DOES: Removes the deleted row from local state
  // by filtering it out, then adjusts the stats accordingly.
  function handleDelete(id) {
    const deleted = transactions.find(t => t.id === id);
    setTransactions(prev => prev.filter(t => t.id !== id));
    if (deleted) {
      setStats(prev => {
        if (!prev) return prev;
        const isIncome = deleted.type === "income";
        return {
          totalIncome:   isIncome ? prev.totalIncome   - deleted.amount : prev.totalIncome,
          totalExpenses: isIncome ? prev.totalExpenses : prev.totalExpenses - deleted.amount,
          netBalance:    isIncome ? prev.netBalance    - deleted.amount : prev.netBalance + deleted.amount,
        };
      });
    }
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      {/* ── Subtle grid background texture ── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px),
                            linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
          opacity: 0.25,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Top Navigation Bar ───────────────────────────── */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            {/* Logo mark */}
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <Activity size={18} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 pulse-dot border-2 border-[var(--bg-base)]" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-[var(--text-primary)] tracking-tight">
                FinanceOS
              </h1>
              <p className="text-xs text-[var(--text-muted)]">
                Data Processing & Access Control
                {lastUpdated && (
                  <span className="ml-2 text-blue-400/70">· Updated {lastUpdated}</span>
                )}
              </p>
            </div>
          </div>

          {/* Right side: role switcher + refresh */}
          <div className="flex items-center gap-3 flex-wrap">
            <RoleSwitcher role={role} setRole={setRole} />
            <button
              onClick={loadData}
              disabled={loading}
              className="
                flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border)]
                text-xs font-display font-semibold text-[var(--text-secondary)]
                hover:border-blue-500/40 hover:text-blue-300
                transition-all duration-200 cursor-pointer disabled:opacity-50
              "
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} strokeWidth={2.5} />
              Refresh
            </button>
          </div>
        </header>

        {/* ── Global Error Banner ──────────────────────────── */}
        {error && (
          <div className="mb-6 flex items-center gap-3 px-5 py-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 fade-in-up">
            <AlertTriangle size={16} strokeWidth={2} />
            <div>
              <p className="text-sm font-display font-semibold">Backend Connection Error</p>
              <p className="text-xs opacity-80 mt-0.5">{error} — Make sure the backend is running on port 5000.</p>
            </div>
          </div>
        )}

        {/* ── Loading overlay ──────────────────────────────── */}
        {loading && !stats && (
          <div className="flex items-center justify-center py-32 fade-in-up">
            <div className="flex flex-col items-center gap-4 text-[var(--text-muted)]">
              <Loader2 size={32} className="animate-spin text-blue-400" strokeWidth={1.5} />
              <p className="text-sm font-display">Connecting to database…</p>
            </div>
          </div>
        )}

        {/* ── Main Content (once loaded) ───────────────────── */}
        {(stats || !loading) && (
          <main className="space-y-6">

            {/* ── STATS SECTION ─────────────────────────────
                Admin and Analyst can see this section.
                Viewer cannot — we show an AccessBanner instead.
            ─────────────────────────────────────────────── */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <p className="text-xs font-display font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                  Financial Overview
                </p>
                <div className="flex-1 h-px bg-[var(--border)]" />
              </div>

              {perms.canViewStats ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatsCard
                    title="Total Income"
                    value={stats?.totalIncome ?? 0}
                    type="income"
                    icon={TrendingUp}
                    loading={loading}
                  />
                  <StatsCard
                    title="Total Expenses"
                    value={stats?.totalExpenses ?? 0}
                    type="expense"
                    icon={TrendingDown}
                    loading={loading}
                  />
                  <StatsCard
                    title="Net Balance"
                    value={stats?.netBalance ?? 0}
                    type="net"
                    icon={Wallet}
                    loading={loading}
                  />
                </div>
              ) : (
                <AccessBanner message="Viewers cannot access financial summary statistics. Switch to Analyst or Admin to see stats." />
              )}
            </section>

            {/* ── ADD FORM SECTION ──────────────────────────
                Only Admins can add transactions.
            ─────────────────────────────────────────────── */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <p className="text-xs font-display font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                  New Entry
                </p>
                <div className="flex-1 h-px bg-[var(--border)]" />
              </div>

              {perms.canAdd ? (
                <AddTransactionForm onAdd={handleAdd} />
              ) : (
                <AccessBanner
                  message={`${role}s cannot add new transactions. Switch to Admin to unlock this feature.`}
                />
              )}
            </section>

            {/* ── TABLE SECTION ─────────────────────────────
                Admin and Viewer can see the table.
                Analyst cannot — show AccessBanner instead.
            ─────────────────────────────────────────────── */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <p className="text-xs font-display font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                  Transaction Records
                </p>
                <div className="flex-1 h-px bg-[var(--border)]" />
              </div>

              {perms.canViewTable ? (
                <TransactionsTable
                  transactions={transactions}
                  role={role}
                  onDelete={handleDelete}
                  loading={loading}
                />
              ) : (
                <AccessBanner message="Analysts can only view aggregated stats. Switch to Admin or Viewer to see individual records." />
              )}
            </section>

          </main>
        )}

        {/* ── Footer ───────────────────────────────────────── */}
        <footer className="mt-16 pb-8 text-center">
          <p className="text-xs text-[var(--text-muted)] font-display">
            FinanceOS — Internship Assignment · React + Node.js + SQLite
          </p>
        </footer>
      </div>
    </div>
  );
}
