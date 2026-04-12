type StatusBadgeProps = {
  status: string;
};

const statusClasses: Record<string, string> = {
  Assigned: "bg-sky-50 text-sky-700 border-sky-200",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
  "Job Done": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
        statusClasses[status] ?? "bg-slate-50 text-slate-700 border-slate-200"
      }`}
    >
      {status}
    </span>
  );
}
