import { Link } from "react-router-dom";
import { formatCurrency, formatLocalDateTime } from "../lib/formatters";
import type { CompletedJobSummary } from "../lib/types";

type ServiceCompletionSummaryCardProps = {
  completion: CompletedJobSummary;
};

export function ServiceCompletionSummaryCard({ completion }: ServiceCompletionSummaryCardProps) {
  return (
    <section className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-panel">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Job completed</p>
      <h1 className="mt-3 text-2xl font-semibold text-slate-900">{completion.order_no}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        The service completion has been recorded and the order status is now Job Done.
      </p>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <SummaryItem label="Customer" value={completion.customer_name} />
        <SummaryItem label="Service Type" value={completion.service_type} />
        <SummaryItem label="Technician" value={completion.technician_name} />
        <SummaryItem label="Final Amount" value={formatCurrency(completion.final_amount)} />
        <SummaryItem label="Files Uploaded" value={`${completion.files_count}`} />
        <SummaryItem label="Completed At" value={formatLocalDateTime(completion.completed_at)} />
      </dl>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/technician/jobs"
          className="rounded-2xl bg-brand-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Back to Assigned Jobs
        </Link>
        <Link
          to="/"
          className="rounded-2xl border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
        >
          Back to Home
        </Link>
      </div>
    </section>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</dt>
      <dd className="mt-2 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}
