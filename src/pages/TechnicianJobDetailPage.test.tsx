import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "../lib/api";
import { TechnicianJobDetailPage } from "./TechnicianJobDetailPage";
import { renderWithRoute, setAuthSession } from "../test/test-utils";

const assignedJob = {
  id: "order-1",
  order_no: "SSS-20260409-0001",
  customer_name: "Ahmad",
  phone: "0123456789",
  address: "Shah Alam",
  problem_description: "Aircond not cold",
  service_type: "Repair",
  quoted_price: 120,
  status: "Assigned" as const,
  created_at: "2026-04-09T08:00:00.000Z",
  assigned_technician_name: "Ali",
};

const inProgressJob = {
  ...assignedJob,
  status: "In Progress" as const,
};

describe("TechnicianJobDetailPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("starts an assigned job when the page loads", async () => {
    setAuthSession({
      email: "ali@sejuk.com",
      name: "Ali",
      role: "Technician",
    });

    const fetchSpy = vi.spyOn(api, "fetchAssignedJobById").mockResolvedValue(assignedJob);
    const startSpy = vi.spyOn(api, "startServiceJob").mockResolvedValue(inProgressJob);

    renderWithRoute(<TechnicianJobDetailPage />, {
      route: "/technician/jobs/order-1",
      path: "/technician/jobs/:orderId",
    });

    expect(await screen.findByText("Ahmad")).toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledWith("order-1", "Ali");
    expect(startSpy).toHaveBeenCalledWith("order-1", "Ali");
  });

  it("recalculates final amount, enforces file rules, and completes the job", async () => {
    setAuthSession({
      email: "ali@sejuk.com",
      name: "Ali",
      role: "Technician",
    });

    vi.spyOn(api, "fetchAssignedJobById").mockResolvedValue(inProgressJob);
    vi.spyOn(api, "uploadServiceMedia").mockResolvedValue([
      {
        file_path: "orders/SSS-20260409-0001/test.jpg",
        file_name: "test.jpg",
        file_type: "image/jpeg",
        file_size: 1234,
      },
    ]);
    const completeSpy = vi.spyOn(api, "completeServiceJob").mockResolvedValue({
      order_id: "order-1",
      order_no: "SSS-20260409-0001",
      customer_name: "Ahmad",
      service_type: "Repair",
      final_amount: 170,
      technician_name: "Ali",
      completed_at: "2026-04-09T10:00:00.000Z",
      status: "Job Done",
      files_count: 1,
    });

    renderWithRoute(<TechnicianJobDetailPage />, {
      route: "/technician/jobs/order-1",
      path: "/technician/jobs/:orderId",
    });

    await screen.findByText("Ahmad");

    fireEvent.click(screen.getByRole("button", { name: /mark job done/i }));
    expect(await screen.findByText(/upload at least 1 photo/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/work done/i), {
      target: { value: "Cleaned the coils and topped up gas." },
    });
    fireEvent.change(screen.getByLabelText(/extra charges/i), {
      target: { value: "50" },
    });

    expect(screen.getByDisplayValue(/170\.00/)).toBeInTheDocument();

    const file = new File(["demo"], "test.jpg", { type: "image/jpeg" });
    fireEvent.change(screen.getByLabelText(/add files/i), {
      target: { files: [file] },
    });

    fireEvent.click(screen.getByRole("button", { name: /mark job done/i }));

    expect(await screen.findByText(/job completed/i)).toBeInTheDocument();
    expect(completeSpy).toHaveBeenCalled();
  });

  it("blocks users from another role", async () => {
    setAuthSession({
      email: "admin@sejuk.com",
      name: "Aina Admin",
      role: "Admin",
    });

    renderWithRoute(<TechnicianJobDetailPage />, {
      route: "/technician/jobs/order-1",
      path: "/technician/jobs/:orderId",
    });

    await waitFor(() => expect(screen.queryByText(/service job/i)).not.toBeInTheDocument());
  });
});
