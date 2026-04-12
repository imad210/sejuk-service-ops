import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { AppShell } from "../components/AppShell";
import { AuthActionBar } from "../components/AuthActionBar";
import { TechnicianJobCard } from "../components/TechnicianJobCard";
import { fetchAssignedJobs } from "../lib/api";
import type { AssignedJobSummary } from "../lib/types";

export function TechnicianJobsPage() {
  const { session, logout } = useAuth();
  const [jobs, setJobs] = useState<AssignedJobSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadJobs() {
      if (!session || session.role !== "Technician") {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const nextJobs = await fetchAssignedJobs(session.name);
        setJobs(nextJobs);
      } catch {
        setError("We could not load your assigned jobs right now. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadJobs();
  }, [session]);

  if (!session || session.role !== "Technician") {
    return <Navigate to="/" replace />;
  }

  return (
    <AppShell
      eyebrow="Technician Portal"
      title="Assigned Jobs"
      action={<AuthActionBar currentRole={session.role} userName={session.name} onLogout={logout} />}
    >
      <div className="mb-6 flex items-center justify-between">
        <Link to="/" className="text-sm font-semibold text-brand-700 transition hover:text-brand-900">
          Back to home
        </Link>
      </div>

      {error ? (
        <section className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 shadow-panel">
          {error}
        </section>
      ) : null}

      {isLoading ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-panel">
          Loading your assigned jobs...
        </section>
      ) : jobs.length === 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">No active jobs</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">You are all caught up</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Assigned and In Progress jobs will appear here once an admin assigns one to {session.name}.
          </p>
        </section>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <TechnicianJobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
