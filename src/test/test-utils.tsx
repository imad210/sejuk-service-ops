import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../auth/AuthContext";
import { AUTH_STORAGE_KEY } from "../lib/constants";
import type { AuthSession } from "../lib/mockAuth";

export function renderWithRouter(ui: ReactElement, initialEntries: string[] = ["/"]) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </AuthProvider>,
  );
}

export function renderWithRoute(
  ui: ReactElement,
  {
    route,
    path,
  }: {
    route: string;
    path: string;
  },
) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path={path} element={ui} />
          <Route path="*" element={<div />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

export function setAuthSession(session: AuthSession | null) {
  if (!session) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}
