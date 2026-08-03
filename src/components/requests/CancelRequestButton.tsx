"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { updateRequestStatus } from "@/lib/database/requests";

interface CancelRequestButtonProps {
  requestId: string;
}

export function CancelRequestButton({ requestId }: CancelRequestButtonProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this request? This action cannot be undone.")) {
      return;
    }

    setIsCancelling(true);
    try {
      const supabase = createClient();
      const success = await updateRequestStatus(supabase, requestId, "cancelled");
      if (success) {
        alert("Request cancelled successfully.");
        router.refresh();
      } else {
        alert("Failed to cancel request.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while cancelling.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Button 
      variant="destructive" 
      onClick={handleCancel} 
      disabled={isCancelling}
      className="w-full sm:w-auto"
    >
      <X className="w-4 h-4 mr-2" />
      {isCancelling ? "Cancelling..." : "Cancel Request"}
    </Button>
  );
}
