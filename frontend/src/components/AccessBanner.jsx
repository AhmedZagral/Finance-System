// ============================================================
// AccessBanner.jsx — Access Denied Notice
// WHAT IT DOES: Displays a friendly "you don't have permission"
// banner instead of completely hiding a section. This makes the
// access control system VISIBLE and demonstrable in interviews.
// ============================================================

import { ShieldOff } from "lucide-react";

export default function AccessBanner({ message }) {
  return (
    <div className="
      flex items-center gap-4 px-6 py-5 rounded-2xl
      border border-[var(--border)] bg-[var(--bg-card)]
      fade-in-up
    ">
      <div className="p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border)]">
        <ShieldOff size={18} className="text-[var(--text-muted)]" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-sm font-display font-semibold text-[var(--text-secondary)]">
          Access Restricted
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{message}</p>
      </div>
    </div>
  );
}
