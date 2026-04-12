import type { PropsWithChildren, ReactNode } from "react";

type AppShellProps = PropsWithChildren<{
  title: string;
  eyebrow: string;
  action?: ReactNode;
}>;

export function AppShell({ title, eyebrow, action, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-slate-200 bg-white/90 px-6 py-6 shadow-panel backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">
                {eyebrow}
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
            </div>
            {action ? <div className="lg:self-center">{action}</div> : null}
          </div>
        </header>
        <main className="flex-1 py-6">{children}</main>
      </div>
    </div>
  );
}
