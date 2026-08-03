import { PackageX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmptyRequestsProps {
  message?: string;
  showCreate?: boolean;
}

export function EmptyRequests({ message = "No requests found.", showCreate = false }: EmptyRequestsProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl bg-background/50">
      <PackageX className="w-16 h-16 text-muted-foreground/30 mb-4" />
      <h3 className="text-lg font-semibold">{message}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">
        Try adjusting your filters or search terms. If you haven&apos;t created a request yet, now is a great time!
      </p>
      {showCreate && (
        <Link href="/request/new">
          <Button>Create a Request</Button>
        </Link>
      )}
    </div>
  );
}
