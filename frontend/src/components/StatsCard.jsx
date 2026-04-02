// ============================================================
// StatsCard.jsx — KPI Summary Card
// WHAT IT DOES: Renders a single metric card (Total Income,
// Total Expenses, or Net Balance) with a formatted currency
// value, a trend icon, and a subtle colour accent.
// Receives all its data as props — it has no internal state.
// ============================================================

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// ── formatCurrency ───────────────────────────────────────────
// WHAT IT DOES: Converts a raw number like 173300 into a
// locale-formatted string like "₹1,73,300" using the browser's
// built-in Intl.NumberFormat API (supports Indian numbering).
function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style:    "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function StatsCard({ title, value, type, icon: Icon, loading }) {
  // Choose styling based on the card type (income / expense / net)
  const config = {
    income: {
      valueColor:  "text-emerald-400",
      iconBg:      "bg-emerald-500/10",
      iconColor:   "text-emerald-400",
      TrendIcon:   TrendingUp,
      trendColor:  "text-emerald-400",
      border:      "border-emerald-500/20",
      glow:        "hover:border-emerald-500/40",
    },
    expense: {
      valueColor:  "text-rose-400",
      iconBg:      "bg-rose-500/10",
      iconColor:   "text-rose-400",
      TrendIcon:   TrendingDown,
      trendColor:  "text-rose-400",
      border:      "border-rose-500/20",
      glow:        "hover:border-rose-500/40",
    },
    net: {
      valueColor:  value >= 0 ? "text-blue-400" : "text-rose-400",
      iconBg:      "bg-blue-500/10",
      iconColor:   "text-blue-400",
      TrendIcon:   value >= 0 ? TrendingUp : Minus,
      trendColor:  value >= 0 ? "text-blue-400" : "text-rose-400",
      border:      "border-blue-500/20",
      glow:        "hover:border-blue-500/40",
    },
  }[type];

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border bg-[var(--bg-card)]
        p-6 card-glow transition-all duration-300 fade-in-up
        ${config.border} ${config.glow}
      `}
    >
      {/* Subtle background gradient blob for depth */}
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-5 blur-2xl"
        style={{ background: type === "income" ? "#10b981" : type === "expense" ? "#ef4444" : "#3b82f6" }}
      />

      {/* Header row: title + icon */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-display font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          {title}
        </p>
        <div className={`p-2 rounded-xl ${config.iconBg}`}>
          <Icon size={16} className={config.iconColor} strokeWidth={2} />
        </div>
      </div>

      {/* Value — shows a shimmer skeleton while loading */}
      {loading ? (
        <div className="h-9 w-36 rounded-lg bg-[var(--border)] animate-pulse" />
      ) : (
        <p className={`text-3xl font-display font-bold tracking-tight ${config.valueColor}`}>
          {formatCurrency(value)}
        </p>
      )}

      {/* Trend label */}
      <div className={`flex items-center gap-1 mt-3 ${config.trendColor}`}>
        <config.TrendIcon size={13} strokeWidth={2.5} />
        <span className="text-xs font-medium">
          {type === "net"
            ? value >= 0 ? "Profitable period" : "Net loss"
            : type === "income" ? "Total earned" : "Total spent"}
        </span>
      </div>
    </div>
  );
}
