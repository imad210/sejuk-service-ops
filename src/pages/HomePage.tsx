import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { AppShell } from "../components/AppShell";
import { AuthActionBar } from "../components/AuthActionBar";
import { PlaceholderCard } from "../components/PlaceholderCard";

export function HomePage() {
  const { session, demoUsers, login, logout } = useAuth();
  const [email, setEmail] = useState("admin@sejuk.com");
  const [password, setPassword] = useState("admin123");
  const [authError, setAuthError] = useState<string | null>(null);

  function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError(null);

    try {
      login(email, password);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Unable to sign in with the supplied demo credentials.");
    }
  }

  if (!session) {
    return (
      <AppShell eyebrow="Sejuk Sejuk Service" title="Mock Authentication">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">Assessment login</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">Sign in with a demo account</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
              Real authentication is not required for this assessment, so the portal uses fixed demo users to
              simulate Admin, Technician, and Manager access.
            </p>

            <form onSubmit={handleLoginSubmit} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-800">Email</span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-800">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </label>

              {authError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {authError}
                </div>
              ) : null}

              <button
                type="submit"
                className="rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Sign In
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-brand-50 to-white p-6 shadow-panel">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">Demo accounts</p>
            <div className="mt-5 space-y-4">
              {demoUsers.map((user) => (
                <button
                  key={user.email}
                  type="button"
                  onClick={() => {
                    setEmail(user.email);
                    setPassword(user.password);
                    setAuthError(null);
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left transition hover:border-brand-300 hover:bg-brand-50"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{user.role}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">{user.name}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      Use demo
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{user.description}</p>
                  <p className="mt-3 text-sm font-medium text-slate-700">{user.email}</p>
                  <p className="mt-1 text-sm text-slate-500">{user.password}</p>
                </button>
              ))}
            </div>
          </section>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      eyebrow="Sejuk Sejuk Service"
      title="Operations System"
      action={<AuthActionBar currentRole={session.role} userName={session.name} onLogout={logout} />}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Signed in as {session.name}
          </p>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">
            {session.role === "Admin" ? "Module 1" : session.role === "Technician" ? "Module 2" : "Manager"}
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">
            {session.role === "Admin"
              ? "Admin order submission"
              : session.role === "Technician"
                ? "Technician service jobs"
                : "Manager portal"}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            {session.role === "Admin"
              ? "Create a service order, assign an active technician from Supabase, and confirm the result with a clean summary state. This module is optimized for admin staff working on desktop."
              : session.role === "Technician"
                ? "View only the jobs assigned to your technician account, record work done, upload proof of service, and complete the workflow from a mobile-first screen."
                : "Manager review remains outside the current implementation scope and stays as a placeholder in this build."}
          </p>
          {session.role === "Admin" ? (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/admin/orders/new"
                className="rounded-2xl bg-brand-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Create Service Order
              </Link>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-600">
                Role locked to Admin workflow
              </div>
            </div>
          ) : session.role === "Technician" ? (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/technician/jobs"
                className="rounded-2xl bg-brand-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                View Assigned Jobs
              </Link>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-600">
                Role locked to Technician workflow
              </div>
            </div>
          ) : (
            <div className="mt-8">
              <PlaceholderCard role={session.role} />
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-brand-50 to-white p-6 shadow-panel">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">Build notes</p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
            <li>Single React app with separate Admin and Technician portals by route.</li>
            <li>Supabase RPC handles order creation, job progression, and completion updates.</li>
            <li>Mock authentication persists the signed-in account and fixes role until logout.</li>
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
