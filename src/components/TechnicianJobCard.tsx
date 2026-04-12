import { Link } from "react-router-dom";
import { formatCompactDateTime, formatCurrency } from "../lib/formatters";
import type { AssignedJobSummary } from "../lib/types";
import { StatusBadge } from "./StatusBadge";

type TechnicianJobCardProps = {
  job: AssignedJobSummary;
};

export function TechnicianJobCard({ job }: TechnicianJobCardProps) {
  return (
    <Link
      to={`/technician/jobs/${job.id}`}
      className="block rounded-3xl border border-slate-200 bg-white p-5 shadow-panel transition hover:border-brand-300 hover:bg-brand-50/30"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">{job.order_no}</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">{job.customer_name}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{job.address}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        <SummaryItem label="Service" value={job.service_type} />
        <SummaryItem label="Quoted Price" value={formatCurrency(job.quoted_price)} />
        <SummaryItem label="Created" value={formatCompactDateTime(job.created_at)} />
      </dl>
    </Link>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</dt>
      <dd className="mt-2 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}
