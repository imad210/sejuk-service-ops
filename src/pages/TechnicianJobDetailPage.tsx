import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { AppShell } from "../components/AppShell";
import { AuthActionBar } from "../components/AuthActionBar";
import { Field } from "../components/Field";
import { ServiceCompletionSummaryCard } from "../components/ServiceCompletionSummaryCard";
import { ServiceFilePicker } from "../components/ServiceFilePicker";
import { StatusBadge } from "../components/StatusBadge";
import { MAX_COMPLETION_FILES } from "../lib/constants";
import {
  completeServiceJob,
  fetchAssignedJobById,
  removeServiceMedia,
  startServiceJob,
  uploadServiceMedia,
} from "../lib/api";
import { formatCurrency, formatLocalDateTime } from "../lib/formatters";
import { validateServiceCompletion } from "../lib/validation";
import type {
  AssignedJobDetail,
  CompletedJobSummary,
  ServiceCompletionErrors,
  ServiceCompletionFormValues,
} from "../lib/types";

const emptyCompletionValues: ServiceCompletionFormValues = {
  work_done: "",
  extra_charges: "0",
  remarks: "",
};

function getReadableErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message.trim();
  }

  return null;
}

export function TechnicianJobDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { session, logout } = useAuth();
  const [job, setJob] = useState<AssignedJobDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [values, setValues] = useState<ServiceCompletionFormValues>(emptyCompletionValues);
  const [errors, setErrors] = useState<ServiceCompletionErrors>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedJob, setCompletedJob] = useState<CompletedJobSummary | null>(null);

  const finalAmount = useMemo(() => {
    if (!job) {
      return 0;
    }

    const extraCharges = values.extra_charges.trim() === "" ? 0 : Number(values.extra_charges);
    return job.quoted_price + (Number.isNaN(extraCharges) ? 0 : extraCharges);
  }, [job, values.extra_charges]);

  useEffect(() => {
    async function loadJob() {
      if (!session || session.role !== "Technician" || !orderId) {
        return;
      }

      setIsLoading(true);
      setLoadError(null);

      try {
        const assignedJob = await fetchAssignedJobById(orderId, session.name);

        if (!assignedJob) {
          setLoadError("This job is unavailable or is not assigned to your technician account.");
          setJob(null);
          return;
        }

        if (assignedJob.status === "Assigned") {
          const startedJob = await startServiceJob(orderId, session.name);
          setJob(startedJob);
        } else {
          setJob(assignedJob);
        }
      } catch (error) {
        const message = getReadableErrorMessage(error);
        setLoadError(message ? `We could not load this job: ${message}` : "We could not load this job right now. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadJob();
  }, [orderId, session]);

  if (!session || session.role !== "Technician") {
    return <Navigate to="/" replace />;
  }

  if (!orderId) {
    return <Navigate to="/technician/jobs" replace />;
  }

  function updateField<K extends keyof ServiceCompletionFormValues>(
    field: K,
    value: ServiceCompletionFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function handleFilesAdd(files: FileList | null) {
    if (!files) {
      return;
    }

    const incomingFiles = Array.from(files);

    setSelectedFiles((current) => {
      const dedupedCurrent = new Map(
        current.map((file) => [`${file.name}-${file.size}-${file.lastModified}`, file] as const),
      );

      for (const file of incomingFiles) {
        dedupedCurrent.set(`${file.name}-${file.size}-${file.lastModified}`, file);
      }

      const nextFiles = Array.from(dedupedCurrent.values());
      return nextFiles.slice(0, MAX_COMPLETION_FILES);
    });

    setErrors((current) => {
      const nextErrors = { ...current };

      if (incomingFiles.length + selectedFiles.length > MAX_COMPLETION_FILES) {
        nextErrors.files = `Upload no more than ${MAX_COMPLETION_FILES} files.`;
        return nextErrors;
      }

      if (nextErrors.files) {
        delete nextErrors.files;
      }

      return nextErrors;
    });
  }

  function handleFileRemove(fileName: string) {
    setSelectedFiles((current) => current.filter((file) => file.name !== fileName));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    if (!job || !session) {
      return;
    }

    const nextErrors = validateServiceCompletion(values, selectedFiles);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    let uploadedFiles: Awaited<ReturnType<typeof uploadServiceMedia>> = [];

    try {
      uploadedFiles = await uploadServiceMedia(job.order_no, selectedFiles);
      const completion = await completeServiceJob(job.id, session.name, values, uploadedFiles);
      setCompletedJob(completion);
    } catch (error) {
      const message = getReadableErrorMessage(error);
      setSubmitError(
        message
          ? `The job could not be completed: ${message}`
          : "The job could not be completed. Please review the details and try again.",
      );

      if (uploadedFiles.length > 0) {
        try {
          await removeServiceMedia(uploadedFiles.map((file) => file.file_path));
        } catch {
          // Keep the original completion error visible; orphaned files can be cleaned up manually in demo mode.
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell
      eyebrow="Technician Portal"
      title="Service Job"
      action={<AuthActionBar currentRole={session.role} userName={session.name} onLogout={logout} />}
    >
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/technician/jobs"
          className="text-sm font-semibold text-brand-700 transition hover:text-brand-900"
        >
          Back to assigned jobs
        </Link>
      </div>

      {completedJob ? <ServiceCompletionSummaryCard completion={completedJob} /> : null}

      {!completedJob && isLoading ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-panel">
          Loading job details...
        </section>
      ) : null}

      {!completedJob && loadError ? (
        <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-panel">
          {loadError}
        </section>
      ) : null}

      {!completedJob && !isLoading && !loadError && job ? (
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">{job.order_no}</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">{job.customer_name}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{job.address}</p>
              </div>
              <StatusBadge status={job.status} />
            </div>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <SummaryItem label="Service Type" value={job.service_type} />
              <SummaryItem label="Quoted Price" value={formatCurrency(job.quoted_price)} />
              <SummaryItem label="Phone" value={job.phone} />
              <SummaryItem label="Technician" value={session.name} />
              <SummaryItem label="Assigned At" value={formatLocalDateTime(job.created_at)} />
            </dl>

            <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Problem Description</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{job.problem_description}</p>
            </div>
          </section>

          {submitError ? (
            <section className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 shadow-panel">
              {submitError}
            </section>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-panel">
              <Field label="Work Done" htmlFor="work_done" required error={errors.work_done}>
                <textarea
                  id="work_done"
                  rows={5}
                  value={values.work_done}
                  onChange={(event) => updateField("work_done", event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </Field>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <Field label="Extra Charges" htmlFor="extra_charges" error={errors.extra_charges}>
                  <input
                    id="extra_charges"
                    inputMode="decimal"
                    value={values.extra_charges}
                    onChange={(event) => updateField("extra_charges", event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </Field>

                <Field label="Final Amount" htmlFor="final_amount">
                  <input
                    id="final_amount"
                    readOnly
                    value={formatCurrency(finalAmount)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
                  />
                </Field>
              </div>

              <div className="mt-6">
                <Field label="Remarks" htmlFor="remarks" error={errors.remarks}>
                  <textarea
                    id="remarks"
                    rows={4}
                    value={values.remarks}
                    onChange={(event) => updateField("remarks", event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </Field>
              </div>
            </section>

            <ServiceFilePicker
              files={selectedFiles}
              error={errors.files}
              onFilesAdd={handleFilesAdd}
              onFileRemove={handleFileRemove}
            />

            <div className="sticky bottom-0 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-panel backdrop-blur">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Ready to complete this job?</p>
                  <p className="mt-1 text-sm text-slate-600">Timestamp will be recorded automatically on submit.</p>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isSubmitting ? "Submitting..." : "Mark Job Done"}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : null}
    </AppShell>
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
