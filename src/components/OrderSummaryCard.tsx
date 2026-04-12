import { Link } from "react-router-dom";
import { formatCurrency, formatLocalDateTime } from "../lib/formatters";
import type { CreatedOrderSummary } from "../lib/types";

type OrderSummaryCardProps = {
  order: CreatedOrderSummary;
  onCreateAnother: () => void;
};

export function OrderSummaryCard({ order, onCreateAnother }: OrderSummaryCardProps) {
  return (
    <section className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-panel">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Order created successfully
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">{order.order_no}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            The service order is now saved in Supabase and ready for the next workflow steps.
          </p>
        </div>
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          Status: {order.status}
        </div>
      </div>

      <dl className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryItem label="Customer Name" value={order.customer_name} />
        <SummaryItem label="Service Type" value={order.service_type} />
        <SummaryItem label="Assigned Technician" value={order.assigned_technician_name} />
        <SummaryItem label="Quoted Price" value={formatCurrency(order.quoted_price)} />
        <SummaryItem label="Created At" value={formatLocalDateTime(order.created_at)} />
      </dl>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onCreateAnother}
          className="rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
          Create Another Order
        </button>
        <Link
          to="/"
          className="rounded-2xl border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
        >
          Back to Admin Home
        </Link>
      </div>
    </section>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</dt>
      <dd className="mt-2 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}
