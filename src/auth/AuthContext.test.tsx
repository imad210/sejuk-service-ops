import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";
import { AUTH_STORAGE_KEY } from "../lib/constants";

describe("AuthProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("logs in with demo credentials and persists the session", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.login("admin@sejuk.com", "admin123");
    });

    expect(result.current.session?.role).toBe("Admin");
    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toContain("admin@sejuk.com");
  });

  it("logs out and clears the persisted session", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.login("admin@sejuk.com", "admin123");
      result.current.logout();
    });

    expect(result.current.session).toBeNull();
    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });
});
