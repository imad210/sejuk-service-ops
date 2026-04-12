import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OrderForm } from "./OrderForm";
import * as api from "../lib/api";
import { renderWithRouter } from "../test/test-utils";

const technicians = [{ id: "tech-1", name: "Ali", phone: null, is_active: true }];

describe("OrderForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows validation errors when required fields are empty", async () => {
    vi.spyOn(api, "fetchActiveTechnicians").mockResolvedValue(technicians);

    renderWithRouter(<OrderForm />);

    await screen.findByText("Module 1 scope");
    fireEvent.click(screen.getByRole("button", { name: /create service order/i }));

    expect(await screen.findByText("Customer name is required.")).toBeInTheDocument();
    expect(screen.getByText("Phone number is required.")).toBeInTheDocument();
    expect(screen.getByText("Assigned technician is required.")).toBeInTheDocument();
  });

  it("rejects an invalid quoted price", async () => {
    vi.spyOn(api, "fetchActiveTechnicians").mockResolvedValue(technicians);

    renderWithRouter(<OrderForm />);
    await screen.findByText("Module 1 scope");

    fireEvent.change(screen.getByLabelText(/customer name/i), { target: { value: "Ahmad" } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: "0123456789" } });
    fireEvent.change(screen.getByLabelText(/address/i), { target: { value: "No 1 Jalan Sejuk" } });
    fireEvent.change(screen.getByLabelText(/problem description/i), {
      target: { value: "Aircond not cold" },
    });
    fireEvent.change(screen.getByLabelText(/service type/i), { target: { value: "Repair" } });
    fireEvent.change(screen.getByLabelText(/quoted price/i), { target: { value: "-1" } });
    fireEvent.change(screen.getByLabelText(/assigned technician/i), { target: { value: "tech-1" } });

    fireEvent.click(screen.getByRole("button", { name: /create service order/i }));

    expect(await screen.findByText("Quoted price must be a valid amount of 0 or more.")).toBeInTheDocument();
  });

  it("renders the summary state after a successful submission", async () => {
    vi.spyOn(api, "fetchActiveTechnicians").mockResolvedValue(technicians);
    vi.spyOn(api, "createServiceOrder").mockResolvedValue({
      id: "order-1",
      order_no: "SSS-20260408-0001",
      customer_name: "Ahmad",
      service_type: "Repair",
      quoted_price: 120,
      assigned_technician_name: "Ali",
      status: "Assigned",
      created_at: "2026-04-08T10:00:00.000Z",
    });

    renderWithRouter(<OrderForm />);
    await screen.findByText("Module 1 scope");

    fireEvent.change(screen.getByLabelText(/customer name/i), { target: { value: "Ahmad" } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: "0123456789" } });
    fireEvent.change(screen.getByLabelText(/address/i), { target: { value: "No 1 Jalan Sejuk" } });
    fireEvent.change(screen.getByLabelText(/problem description/i), {
      target: { value: "Aircond not cold" },
    });
    fireEvent.change(screen.getByLabelText(/service type/i), { target: { value: "Repair" } });
    fireEvent.change(screen.getByLabelText(/quoted price/i), { target: { value: "120" } });
    fireEvent.change(screen.getByLabelText(/assigned technician/i), { target: { value: "tech-1" } });
    fireEvent.click(screen.getByRole("button", { name: /create service order/i }));

    expect(await screen.findByText("Order created successfully")).toBeInTheDocument();
    expect(screen.getByText("SSS-20260408-0001")).toBeInTheDocument();
    expect(screen.getByText("Ali")).toBeInTheDocument();
  });

  it("preserves form values and shows an error banner after a failed submission", async () => {
    vi.spyOn(api, "fetchActiveTechnicians").mockResolvedValue(technicians);
    vi.spyOn(api, "createServiceOrder").mockRejectedValue(new Error("boom"));

    renderWithRouter(<OrderForm />);
    await screen.findByText("Module 1 scope");

    fireEvent.change(screen.getByLabelText(/customer name/i), { target: { value: "Ahmad" } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: "0123456789" } });
    fireEvent.change(screen.getByLabelText(/address/i), { target: { value: "No 1 Jalan Sejuk" } });
    fireEvent.change(screen.getByLabelText(/problem description/i), {
      target: { value: "Aircond not cold" },
    });
    fireEvent.change(screen.getByLabelText(/service type/i), { target: { value: "Repair" } });
    fireEvent.change(screen.getByLabelText(/quoted price/i), { target: { value: "120" } });
    fireEvent.change(screen.getByLabelText(/assigned technician/i), { target: { value: "tech-1" } });
    fireEvent.click(screen.getByRole("button", { name: /create service order/i }));

    expect(await screen.findByText(/could not be created/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/customer name/i)).toHaveValue("Ahmad");
  });

  it("shows a retry flow when technician loading fails", async () => {
    const fetchSpy = vi
      .spyOn(api, "fetchActiveTechnicians")
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(technicians);

    renderWithRouter(<OrderForm />);

    expect(await screen.findByText(/technician load failed/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /retry loading technicians/i }));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2));
  });
});
