// ============================================================
// RoleSwitcher.jsx — Access Control Role Selector
// WHAT IT DOES: Renders three role buttons (Admin, Analyst,
// Viewer). When a user clicks one, it updates the global role
// state in App.jsx which then shows/hides features accordingly.
//
// ACCESS CONTROL MATRIX:
//   Admin   → Can view stats, view table, ADD and DELETE rows
//   Analyst → Can view stats only (no table)
//   Viewer  → Can view table only (no stats, no add/delete)
// ============================================================

import { ShieldCheck, BarChart2, Eye } from "lucide-react";

// Role definitions: label, icon component, description, colors
const ROLES = [
  {
    id:    "Admin",
    label: "Admin",
    Icon:  ShieldCheck,
    desc:  "Full access",
    color: "blue",
    activeClasses:  "border-blue-500 bg-blue-500/10 text-blue-300",
    inactiveClasses:"border-transparent text-[var(--text-secondary)] hover:border-blue-500/40 hover:text-blue-300/70",
    dot:   "bg-blue-400",
  },
  {
    id:    "Analyst",
    label: "Analyst",
    Icon:  BarChart2,
    desc:  "Stats only",
    color: "purple",
    activeClasses:  "border-purple-500 bg-purple-500/10 text-purple-300",
    inactiveClasses:"border-transparent text-[var(--text-secondary)] hover:border-purple-500/40 hover:text-purple-300/70",
    dot:   "bg-purple-400",
  },
  {
    id:    "Viewer",
    label: "Viewer",
    Icon:  Eye,
    desc:  "Table only",
    color: "amber",
    activeClasses:  "border-amber-500 bg-amber-500/10 text-amber-300",
    inactiveClasses:"border-transparent text-[var(--text-secondary)] hover:border-amber-500/40 hover:text-amber-300/70",
    dot:   "bg-amber-400",
  },
];

export default function RoleSwitcher({ role, setRole }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Label */}
      <span className="text-xs font-display font-semibold uppercase tracking-widest text-[var(--text-muted)] mr-1">
        Role
      </span>

      {ROLES.map(({ id, label, Icon, desc, activeClasses, inactiveClasses, dot }) => {
        const isActive = role === id;
        return (
          <button
            key={id}
            onClick={() => setRole(id)}
            title={desc}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-display font-semibold
              transition-all duration-200 cursor-pointer
              ${isActive ? activeClasses : inactiveClasses}
            `}
          >
            {/* Live indicator dot — only shown for active role */}
            {isActive && (
              <span className={`w-1.5 h-1.5 rounded-full pulse-dot ${dot}`} />
            )}
            <Icon size={14} strokeWidth={2} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
