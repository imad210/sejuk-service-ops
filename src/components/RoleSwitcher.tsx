import { ROLES, type AppRole } from "../lib/constants";

type RoleSwitcherProps = {
  currentRole: AppRole;
  onChange: (role: AppRole) => void;
};

export function RoleSwitcher({ currentRole, onChange }: RoleSwitcherProps) {
  return (
    <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
      {ROLES.map((role) => {
        const active = role === currentRole;

        return (
          <button
            key={role}
            type="button"
            onClick={() => onChange(role)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              active
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-white hover:text-slate-900"
            }`}
          >
            {role}
          </button>
        );
      })}
    </div>
  );
}
