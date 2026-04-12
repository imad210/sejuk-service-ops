import { supabase } from "./supabase";
import {
  ACTIVE_ORDER_STATUSES,
  COMPLETION_ORDER_STATUS,
  MAX_COMPLETION_FILES,
  MEDIA_ACCEPT,
} from "./constants";
import type {
  AssignedJobDetail,
  AssignedJobSummary,
  CompletedJobSummary,
  CreatedOrderSummary,
  OrderFormValues,
  ServiceCompletionFormValues,
  TechnicianOption,
  UploadedServiceFile,
} from "./types";

type CreateServiceOrderArgs = {
  p_customer_name: string;
  p_phone: string;
  p_address: string;
  p_problem_description: string;
  p_service_type: string;
  p_quoted_price: number;
  p_assigned_technician_id: string;
  p_admin_notes: string | null;
};

type StartServiceJobArgs = {
  p_order_id: string;
  p_technician_name: string;
};

type CompleteServiceJobArgs = {
  p_order_id: string;
  p_technician_name: string;
  p_work_done: string;
  p_extra_charges: number;
  p_remarks: string | null;
  p_files: UploadedServiceFile[];
};

export async function fetchActiveTechnicians() {
  const { data, error } = await supabase
    .from("technicians")
    .select("id, name, phone, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return data as TechnicianOption[];
}

export async function fetchAssignedJobs(technicianName: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("id, order_no, customer_name, address, service_type, quoted_price, status, created_at")
    .eq("assigned_technician_name", technicianName)
    .in("status", [...ACTIVE_ORDER_STATUSES])
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as AssignedJobSummary[];
}

export async function fetchAssignedJobById(orderId: string, technicianName: string) {
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_no, customer_name, phone, address, problem_description, service_type, quoted_price, status, created_at, assigned_technician_name",
    )
    .eq("id", orderId)
    .eq("assigned_technician_name", technicianName)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }

  return data as AssignedJobDetail;
}

export async function createServiceOrder(values: OrderFormValues) {
  const payload: CreateServiceOrderArgs = {
    p_customer_name: values.customer_name.trim(),
    p_phone: values.phone.trim(),
    p_address: values.address.trim(),
    p_problem_description: values.problem_description.trim(),
    p_service_type: values.service_type,
    p_quoted_price: Number(values.quoted_price),
    p_assigned_technician_id: values.assigned_technician_id,
    p_admin_notes: values.admin_notes.trim() || null,
  };

  const { data, error } = await supabase.rpc("create_service_order", payload);

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("The order was created, but no response payload was returned.");
  }

  return data as CreatedOrderSummary;
}

export async function startServiceJob(orderId: string, technicianName: string) {
  const args: StartServiceJobArgs = {
    p_order_id: orderId,
    p_technician_name: technicianName,
  };

  const { data, error } = await supabase.rpc("start_service_job", args);

  if (error) {
    throw error;
  }

  return data as AssignedJobDetail;
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function isAllowedFileType(file: File) {
  return file.type.startsWith("image/") || file.type.startsWith("video/") || file.type === "application/pdf";
}

export async function uploadServiceMedia(orderNo: string, files: File[]) {
  if (files.length === 0) {
    return [];
  }

  if (files.length > MAX_COMPLETION_FILES) {
    throw new Error(`Upload no more than ${MAX_COMPLETION_FILES} files.`);
  }

  const disallowed = files.find((file) => !isAllowedFileType(file));
  if (disallowed) {
    throw new Error(`Unsupported file type for ${disallowed.name}. Allowed types: ${MEDIA_ACCEPT}.`);
  }

  const uploadedFiles: UploadedServiceFile[] = [];

  for (const file of files) {
    const filePath = `orders/${orderNo}/${Date.now()}-${sanitizeFileName(file.name)}`;
    const { error } = await supabase.storage.from("service-media").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      throw error;
    }

    uploadedFiles.push({
      file_path: filePath,
      file_name: file.name,
      file_type: file.type || "application/octet-stream",
      file_size: file.size,
    });
  }

  return uploadedFiles;
}

export async function removeServiceMedia(filePaths: string[]) {
  if (filePaths.length === 0) {
    return;
  }

  const { error } = await supabase.storage.from("service-media").remove(filePaths);

  if (error) {
    throw error;
  }
}

export async function completeServiceJob(
  orderId: string,
  technicianName: string,
  values: ServiceCompletionFormValues,
  files: UploadedServiceFile[],
) {
  const args: CompleteServiceJobArgs = {
    p_order_id: orderId,
    p_technician_name: technicianName,
    p_work_done: values.work_done.trim(),
    p_extra_charges: values.extra_charges.trim() === "" ? 0 : Number(values.extra_charges),
    p_remarks: values.remarks.trim() || null,
    p_files: files,
  };

  const { data, error } = await supabase.rpc("complete_service_job", args);

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("The job was completed, but no completion summary was returned.");
  }

  const completion = Array.isArray(data) ? data[0] : data;

  if (!completion) {
    throw new Error("The job was completed, but the completion summary payload was empty.");
  }

  return completion as CompletedJobSummary;
}

export function isCompletedStatus(status: string) {
  return status === COMPLETION_ORDER_STATUS;
}
