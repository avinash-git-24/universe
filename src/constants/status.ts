import type { Database } from "@/types/database";

export type RequestStatus = Database["public"]["Enums"]["request_status"];

export const REQUEST_STATUSES = [
  "pending",
  "accepted",
  "picked_up",
  "in_transit",
  "delivered",
  "cancelled",
] as const;

export interface StatusConfig {
  label: string;
  description: string;
  badgeVariant: "warning" | "primary" | "accent" | "success" | "error" | "neutral" | "solid";
  className: string;
}

export const REQUEST_STATUS_CONFIG: Record<RequestStatus, StatusConfig> = {
  pending: {
    label: "Pending",
    description: "Waiting for a runner to accept your request.",
    badgeVariant: "warning",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  accepted: {
    label: "Accepted",
    description: "Runner assigned and heading to pickup location.",
    badgeVariant: "primary",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  picked_up: {
    label: "Picked Up",
    description: "Items have been picked up from the store.",
    badgeVariant: "accent",
    className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  in_transit: {
    label: "In Transit",
    description: "Runner is on the way to your delivery location.",
    badgeVariant: "accent",
    className: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  },
  delivered: {
    label: "Delivered",
    description: "Delivery complete.",
    badgeVariant: "success",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  cancelled: {
    label: "Cancelled",
    description: "This request was cancelled.",
    badgeVariant: "error",
    className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  },
};

export function getStatusConfig(status: string): StatusConfig {
  if (status in REQUEST_STATUS_CONFIG) {
    return REQUEST_STATUS_CONFIG[status as RequestStatus];
  }
  return {
    label: status.replace(/_/g, " "),
    description: "",
    badgeVariant: "neutral",
    className: "bg-secondary text-secondary-foreground",
  };
}

export function getStatusLabel(status: string): string {
  return getStatusConfig(status).label;
}

export function isValidRequestStatus(status: string): status is RequestStatus {
  return (REQUEST_STATUSES as readonly string[]).includes(status);
}
