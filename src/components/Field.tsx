import type { ReactNode } from "react";

type FieldProps = {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
};

export function Field({ label, htmlFor, required, hint, error, children }: FieldProps) {
  return (
    <label htmlFor={htmlFor} className="block">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm font-semibold text-slate-800">{label}</span>
        {required ? (
          <span
            aria-hidden="true"
            className="text-xs font-semibold uppercase tracking-wide text-rose-600"
          >
            Required
          </span>
        ) : null}
      </div>
      {children}
      {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
    </label>
  );
}
