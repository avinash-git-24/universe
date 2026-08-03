import { StatusBadge } from "@/components/ui/status-badge";
import { Database } from "@/types/database";

type RequestStatus = Database["public"]["Enums"]["request_status"];

interface RequestStatusBadgeProps {
  status: RequestStatus | string;
  className?: string;
}

export function RequestStatusBadge({ status, className }: RequestStatusBadgeProps) {
  return <StatusBadge status={status} showIcon={false} className={className} />;
}
