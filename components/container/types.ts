import type { Option } from "@/components/ui/select";

export type ContainersStatus =
  | "Good"
  | "Empty"
  | "Loading"
  | "Loaded"
  | "Damaged"
  | "Missing"
  | "Broken"
  | "COR"
  | "Free"
  | "Busy";

export type ContainerRecord = {
  id: string;
  created?: string;
  containerNo?: string;
  size?: string;
  status?: ContainersStatus;
  cargoType?: string;
  ownedBy?: string;
};

export interface ContainerStats {
  total: number;
  busy: number;
  free: number;
  good: number;
  damaged: number;
  loading: number;
  loaded: number;
}

export const STATUS_TABS = [
  { key: "All" as const, label: "All" },
  { key: "Busy" as const, label: "Busy" },
  { key: "Free" as const, label: "Free" },
  { key: "Maintenance" as const, label: "Maintenance" },
] as const;

export type StatusTabKey = (typeof STATUS_TABS)[number]["key"];

export const statusOptions: Option[] = [
  { value: "Good", label: "Good" },
  { value: "Empty", label: "Empty" },
  { value: "Loading", label: "Loading" },
  { value: "Loaded", label: "Loaded" },
  { value: "Damaged", label: "Damaged" },
  { value: "Missing", label: "Missing" },
  { value: "Broken", label: "Broken" },
  { value: "COR", label: "COR" },
  { value: "Free", label: "Free" },
  { value: "Busy", label: "Busy" },
];

export const sizeOptions: Option[] = [
  { value: "20ft", label: "20ft" },
  { value: "40ft", label: "40ft" },
  { value: "45ft", label: "45ft" },
];

export function formatAddedDate(created?: string): string {
  if (!created) return "N/A";
  return new Date(created).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

export function getDimensionsLabel(size?: string): string {
  if (!size) return "—";
  if (size === "20ft") return "20ft Standard";
  if (size === "40ft" || size === "45ft") return `${size} HC`;
  return size;
}

/** Status display for card: BUSY (yellow), FREE (green), MAINTENANCE (red) */
export function getStatusDisplay(
  status?: ContainersStatus
): { label: string; dotClass: string; bgClass: string; textClass: string } | null {
  if (!status) return null;
  if (status === "Busy")
    return {
      label: "BUSY",
      dotClass: "bg-yellow-500",
      bgClass: "bg-yellow-100",
      textClass: "text-yellow-800",
    };
  if (status === "Free")
    return {
      label: "FREE",
      dotClass: "bg-green-500",
      bgClass: "bg-green-100",
      textClass: "text-green-800",
    };
  if (status === "Damaged" || status === "Broken")
    return {
      label: "MAINTENANCE",
      dotClass: "bg-red-500",
      bgClass: "bg-red-100",
      textClass: "text-red-800",
    };
  return {
    label: status.toUpperCase(),
    dotClass: "bg-gray-500",
    bgClass: "bg-gray-100",
    textClass: "text-gray-800",
  };
}

/** Short location/status line for card (derived from status when no location field) */
export function getLocationLabel(status?: ContainersStatus): string {
  switch (status) {
    case "Busy":
    case "Loading":
    case "Loaded":
      return "In transit";
    case "Free":
      return "Available";
    case "Damaged":
    case "Broken":
      return "Service Center";
    default:
      return "—";
  }
}
