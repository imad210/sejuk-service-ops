export const AUTH_STORAGE_KEY = "sss-auth-session";

export const ROLES = ["Admin", "Technician", "Manager"] as const;
export type AppRole = (typeof ROLES)[number];
export const ACTIVE_ORDER_STATUSES = ["Assigned", "In Progress"] as const;
export const COMPLETION_ORDER_STATUS = "Job Done";
export const ORDER_STATUS_OPTIONS = [...ACTIVE_ORDER_STATUSES, COMPLETION_ORDER_STATUS] as const;
export type OrderStatus = (typeof ORDER_STATUS_OPTIONS)[number];

export const SERVICE_TYPES = [
  "Installation",
  "Cleaning",
  "Repair",
  "Gas Refill",
  "Inspection",
  "Maintenance",
] as const;

export const MAX_LENGTHS = {
  customerName: 100,
  phone: 20,
  address: 300,
  problemDescription: 500,
  adminNotes: 500,
  workDone: 1000,
  remarks: 500,
} as const;

export const MAX_COMPLETION_FILES = 6;
export const MEDIA_ACCEPT = "image/*,video/*,application/pdf";
