import type { AppRole } from "../lib/constants";

type AuthActionBarProps = {
  currentRole: AppRole;
  userName: string;
  onLogout: () => void;
};

export function AuthActionBar({ currentRole, userName, onLogout }: AuthActionBarProps) {
  return (
    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
        <span className="font-semibold text-slate-900">{userName}</span>
        <span className="mx-2 text-slate-300">|</span>
        <span className="font-medium">{currentRole}</span>
      </div>
      <button
        type="button"
        onClick={onLogout}
        className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
      >
        Sign Out
      </button>
    </div>
  );
}
