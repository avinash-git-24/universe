import { Badge } from "@/components/ui/badge";
import { Database } from "@/types/database";

type RequestStatus = Database["public"]["Enums"]["request_status"];

interface RequestStatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

export function RequestStatusBadge({ status, className }: RequestStatusBadgeProps) {
  switch (status) {
    case "pending":
      return <Badge variant="neutral" className={`bg-amber-100 text-amber-800 hover:bg-amber-100/80 ${className}`}>Pending</Badge>;
    case "accepted":
      return <Badge variant="primary" className={className}>Accepted</Badge>;
    case "picked_up":
      return <Badge variant="accent" className={className}>Picked Up</Badge>;
    case "delivered":
      return <Badge variant="neutral" className={`bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80 ${className}`}>Delivered</Badge>;
    case "cancelled":
      return <Badge variant="error" className={className}>Cancelled</Badge>;
    default:
      return <Badge variant="neutral" className={className}>{status}</Badge>;
  }
}
