"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface DeleteAccountButtonProps {
  className?: string;
}

export function DeleteAccountButton({ className }: DeleteAccountButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    const isConfirmed = window.confirm(
      "Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently erase all your requests, messages, and wallet balance."
    );

    if (!isConfirmed) return;

    setLoading(true);
    try {
      const supabase = createClient();
      
      // Call the secure RPC function to delete the user
      const { error } = await supabase.rpc("delete_own_account");
      
      if (error) {
        console.error("Error deleting account:", error.message);
        alert("Failed to delete account. Please ensure the SQL function is added to your Supabase dashboard.");
        setLoading(false);
        return;
      }

      // Immediately sign out to clear local session state
      await supabase.auth.signOut();
      
      // Redirect to login
      window.location.href = "/login";
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      className={className}
      onClick={handleDeleteAccount}
      isLoading={loading}
      loadingText="Deleting..."
    >
      {!loading && <Trash2 className="w-4 h-4 mr-2" />}
      Delete Account
    </Button>
  );
}
