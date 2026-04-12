import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { AppShell } from "../components/AppShell";
import { AuthActionBar } from "../components/AuthActionBar";
import { OrderForm } from "../components/OrderForm";

export function AdminOrderPage() {
  const { session, logout } = useAuth();

  if (!session || session.role !== "Admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <AppShell
      eyebrow="Admin Portal"
      title="Create Service Order"
      action={<AuthActionBar currentRole={session.role} userName={session.name} onLogout={logout} />}
    >
      <div className="mb-6 flex items-center justify-between">
        <Link to="/" className="text-sm font-semibold text-brand-700 transition hover:text-brand-900">
          Back to home
        </Link>
      </div>
      <OrderForm />
    </AppShell>
  );
}
