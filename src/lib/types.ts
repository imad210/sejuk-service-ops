import type { OrderStatus } from "./constants";

export type TechnicianOption = {
  id: string;
  name: string;
  phone: string | null;
  is_active: boolean;
};

export type OrderFormValues = {
  customer_name: string;
  phone: string;
  address: string;
  problem_description: string;
  service_type: string;
  quoted_price: string;
  assigned_technician_id: string;
  admin_notes: string;
};

export type OrderFormErrors = Partial<Record<keyof OrderFormValues, string>>;

export type CreatedOrderSummary = {
  id: string;
  order_no: string;
  customer_name: string;
  service_type: string;
  quoted_price: number;
  assigned_technician_name: string;
  status: OrderStatus;
  created_at: string;
};

export type AssignedJobSummary = {
  id: string;
  order_no: string;
  customer_name: string;
  address: string;
  service_type: string;
  quoted_price: number;
  status: Extract<OrderStatus, "Assigned" | "In Progress">;
  created_at: string;
};

export type AssignedJobDetail = AssignedJobSummary & {
  phone: string;
  problem_description: string;
  assigned_technician_name: string;
};

export type ServiceCompletionFormValues = {
  work_done: string;
  extra_charges: string;
  remarks: string;
};

export type ServiceCompletionErrors = Partial<Record<keyof ServiceCompletionFormValues | "files", string>>;

export type UploadedServiceFile = {
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
};

export type CompletedJobSummary = {
  order_id: string;
  order_no: string;
  customer_name: string;
  service_type: string;
  final_amount: number;
  technician_name: string;
  completed_at: string;
  status: Extract<OrderStatus, "Job Done">;
  files_count: number;
};
