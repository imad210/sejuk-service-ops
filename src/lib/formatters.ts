export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatLocalDateTime(isoDate: string) {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-MY", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kuala_Lumpur",
  }).format(date);
}

export function formatCompactDateTime(isoDate: string) {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-MY", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Kuala_Lumpur",
  }).format(date);
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
