import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { AUTH_STORAGE_KEY } from "../lib/constants";
import { DEMO_USERS, authenticateDemoUser, type AuthSession, type DemoUser } from "../lib/mockAuth";

type AuthContextValue = {
  session: AuthSession | null;
  demoUsers: DemoUser[];
  login: (email: string, password: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(getStoredSession);

  useEffect(() => {
    if (!session) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      demoUsers: DEMO_USERS,
      login(email, password) {
        setSession(authenticateDemoUser(email, password));
      },
      logout() {
        setSession(null);
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
