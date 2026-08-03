import { PackageX, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmptyRequestsProps {
  category?: "active" | "completed" | "cancelled" | "all";
  message?: string;
  description?: string;
  showCreate?: boolean;
}

const CATEGORY_EMPTY_CONFIG = {
  active: {
    icon: Clock,
    title: "No Active Requests",
    description: "You don't have any ongoing delivery requests right now. Create one to get items delivered on campus!",
  },
  completed: {
    icon: CheckCircle2,
    title: "No Completed Requests",
    description: "You haven't completed any delivery requests yet. Past delivered requests will appear here.",
  },
  cancelled: {
    icon: AlertCircle,
    title: "No Cancelled Requests",
    description: "You don't have any cancelled delivery requests.",
  },
  all: {
    icon: PackageX,
    title: "No Requests Found",
    description: "Try adjusting your search terms or filters, or create a new request.",
  },
};

export function EmptyRequests({
  category = "all",
  message,
  description,
  showCreate = true,
}: EmptyRequestsProps) {
  const config = CATEGORY_EMPTY_CONFIG[category] || CATEGORY_EMPTY_CONFIG.all;
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl bg-background/50 my-4">
      <Icon className="w-16 h-16 text-muted-foreground/30 mb-4" />
      <h3 className="text-lg font-semibold">{message || config.title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">
        {description || config.description}
      </p>
      {showCreate && (
        <Link href="/request/new">
          <Button>Create a Request</Button>
        </Link>
      )}
    </div>
  );
}
