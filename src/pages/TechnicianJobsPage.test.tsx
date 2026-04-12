import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "../lib/api";
import { TechnicianJobsPage } from "./TechnicianJobsPage";
import { renderWithRoute, setAuthSession } from "../test/test-utils";

describe("TechnicianJobsPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("shows only jobs assigned to the signed-in technician", async () => {
    setAuthSession({
      email: "ali@sejuk.com",
      name: "Ali",
      role: "Technician",
    });

    vi.spyOn(api, "fetchAssignedJobs").mockResolvedValue([
      {
        id: "order-1",
        order_no: "SSS-20260409-0001",
        customer_name: "Ahmad",
        address: "Shah Alam",
        service_type: "Repair",
        quoted_price: 120,
        status: "Assigned",
        created_at: "2026-04-09T08:00:00.000Z",
      },
    ]);

    renderWithRoute(<TechnicianJobsPage />, {
      route: "/technician/jobs",
      path: "/technician/jobs",
    });

    expect(await screen.findByText("Ahmad")).toBeInTheDocument();
    expect(screen.getByText("SSS-20260409-0001")).toBeInTheDocument();
  });

  it("shows the empty state when no assigned jobs exist", async () => {
    setAuthSession({
      email: "john@sejuk.com",
      name: "John",
      role: "Technician",
    });

    vi.spyOn(api, "fetchAssignedJobs").mockResolvedValue([]);

    renderWithRoute(<TechnicianJobsPage />, {
      route: "/technician/jobs",
      path: "/technician/jobs",
    });

    expect(await screen.findByText(/you are all caught up/i)).toBeInTheDocument();
  });

  it("redirects away when the signed-in user is not a technician", async () => {
    setAuthSession({
      email: "admin@sejuk.com",
      name: "Aina Admin",
      role: "Admin",
    });

    renderWithRoute(<TechnicianJobsPage />, {
      route: "/technician/jobs",
      path: "/technician/jobs",
    });

    await waitFor(() => expect(screen.queryByText(/assigned jobs/i)).not.toBeInTheDocument());
  });
});
