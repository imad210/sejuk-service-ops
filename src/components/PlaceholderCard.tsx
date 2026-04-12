import type { AppRole } from "../lib/constants";

type PlaceholderCardProps = {
  role: AppRole;
};

export function PlaceholderCard({ role }: PlaceholderCardProps) {
  return (
    <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 shadow-panel">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">{role} module</p>
      <h2 className="mt-4 text-2xl font-semibold text-slate-900">Coming in a later module</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
        Module 1 is focused on the admin workflow. Technician and manager experiences are intentionally
        left as placeholders so the order submission flow stays polished and decision-complete.
      </p>
    </section>
  );
}
