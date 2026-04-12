import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { HomePage } from "./HomePage";
import { AUTH_STORAGE_KEY } from "../lib/constants";
import { renderWithRouter } from "../test/test-utils";

describe("HomePage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows the mock login form by default", () => {
    renderWithRouter(<HomePage />);

    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/demo accounts/i)).toBeInTheDocument();
  });

  it("signs in with admin demo credentials and persists a session", () => {
    renderWithRouter(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toContain("admin@sejuk.com");
    expect(screen.getByRole("link", { name: /create service order/i })).toBeInTheDocument();
  });

  it("keeps technician users out of the admin CTA", () => {
    renderWithRouter(<HomePage />);

    fireEvent.click(screen.getByText("Ali"));
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toContain("Technician");
    expect(screen.getByRole("link", { name: /view assigned jobs/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /create service order/i })).not.toBeInTheDocument();
  });
});
