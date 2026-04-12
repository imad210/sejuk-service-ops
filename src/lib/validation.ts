import { MAX_COMPLETION_FILES, MAX_LENGTHS, SERVICE_TYPES } from "./constants";
import type {
  OrderFormErrors,
  OrderFormValues,
  ServiceCompletionErrors,
  ServiceCompletionFormValues,
  TechnicianOption,
} from "./types";

const isNonNegativeNumber = (value: string) =>
  value.trim() !== "" && !Number.isNaN(Number(value)) && Number(value) >= 0;

export function validateOrderForm(
  values: OrderFormValues,
  technicians: TechnicianOption[],
): OrderFormErrors {
  const errors: OrderFormErrors = {};

  const customerName = values.customer_name.trim();
  const phone = values.phone.trim();
  const address = values.address.trim();
  const problemDescription = values.problem_description.trim();
  const adminNotes = values.admin_notes.trim();

  if (!customerName) {
    errors.customer_name = "Customer name is required.";
  } else if (customerName.length > MAX_LENGTHS.customerName) {
    errors.customer_name = `Customer name must be ${MAX_LENGTHS.customerName} characters or fewer.`;
  }

  if (!phone) {
    errors.phone = "Phone number is required.";
  } else if (phone.length > MAX_LENGTHS.phone) {
    errors.phone = `Phone number must be ${MAX_LENGTHS.phone} characters or fewer.`;
  }

  if (!address) {
    errors.address = "Address is required.";
  } else if (address.length > MAX_LENGTHS.address) {
    errors.address = `Address must be ${MAX_LENGTHS.address} characters or fewer.`;
  }

  if (!problemDescription) {
    errors.problem_description = "Problem description is required.";
  } else if (problemDescription.length > MAX_LENGTHS.problemDescription) {
    errors.problem_description = `Problem description must be ${MAX_LENGTHS.problemDescription} characters or fewer.`;
  }

  if (!values.service_type) {
    errors.service_type = "Service type is required.";
  } else if (!SERVICE_TYPES.includes(values.service_type as (typeof SERVICE_TYPES)[number])) {
    errors.service_type = "Please choose a valid service type.";
  }

  if (!isNonNegativeNumber(values.quoted_price)) {
    errors.quoted_price = "Quoted price must be a valid amount of 0 or more.";
  }

  if (!values.assigned_technician_id) {
    errors.assigned_technician_id = "Assigned technician is required.";
  } else if (!technicians.some((technician) => technician.id === values.assigned_technician_id)) {
    errors.assigned_technician_id = "Please choose a valid technician.";
  }

  if (adminNotes.length > MAX_LENGTHS.adminNotes) {
    errors.admin_notes = `Admin notes must be ${MAX_LENGTHS.adminNotes} characters or fewer.`;
  }

  return errors;
}

export function validateServiceCompletion(
  values: ServiceCompletionFormValues,
  selectedFiles: File[],
): ServiceCompletionErrors {
  const errors: ServiceCompletionErrors = {};
  const workDone = values.work_done.trim();
  const remarks = values.remarks.trim();
  const extraCharges = values.extra_charges.trim();

  if (!workDone) {
    errors.work_done = "Work done is required.";
  } else if (workDone.length > MAX_LENGTHS.workDone) {
    errors.work_done = `Work done must be ${MAX_LENGTHS.workDone} characters or fewer.`;
  }

  if (remarks.length > MAX_LENGTHS.remarks) {
    errors.remarks = `Remarks must be ${MAX_LENGTHS.remarks} characters or fewer.`;
  }

  if (extraCharges !== "" && (Number.isNaN(Number(extraCharges)) || Number(extraCharges) < 0)) {
    errors.extra_charges = "Extra charges must be a valid amount of 0 or more.";
  }

  if (selectedFiles.length === 0) {
    errors.files = "Upload at least 1 photo, video, or PDF.";
  } else if (selectedFiles.length > MAX_COMPLETION_FILES) {
    errors.files = `Upload no more than ${MAX_COMPLETION_FILES} files.`;
  }

  return errors;
}
