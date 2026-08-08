import React from "react";
import { Clock, CheckCircle2, Package, Truck, MapPin, AlertCircle, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getStatusConfig, RequestStatus } from "@/constants/status";
import { cn } from "@/lib/utils";

export interface StatusBadgeProps {
  status: RequestStatus | string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const STATUS_ICONS: Record<string, React.ElementType> = {
  pending: Clock,
  accepted: CheckCircle2,
  picked_up: Package,
  in_transit: Truck,
  delivered: MapPin,
  cancelled: AlertCircle,
};

const SIZE_MAP = {
  sm: "text-xs px-2 py-0.5 gap-1",
  md: "text-xs px-2.5 py-1 gap-1.5",
  lg: "text-sm px-3 py-1.5 gap-2 font-semibold",
};

const ICON_SIZE_MAP = {
  sm: "w-3 h-3",
  md: "w-3.5 h-3.5",
  lg: "w-4 h-4",
};

export function RequestStatusBadge({
  status,
  showIcon = true,
  size = "md",
  className,
}: StatusBadgeProps) {
  const config = getStatusConfig(status);
  const Icon = STATUS_ICONS[status] || HelpCircle;

  return (
    <Badge
      variant={config.badgeVariant}
      className={cn(
        "inline-flex items-center rounded-full border transition-colors font-medium shrink-0",
        SIZE_MAP[size],
        config.className,
        className
      )}
    >
      {showIcon && (() => {
        const IconComp = Icon as any;
        return <IconComp className={cn(ICON_SIZE_MAP[size], "shrink-0")} />;
      })()}
      <span>{config.label}</span>
    </Badge>
  );
}

export const StatusBadge = RequestStatusBadge;
