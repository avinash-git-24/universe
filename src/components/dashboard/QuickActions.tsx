"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Bike, User, Package, Wallet, MessageSquare, BarChart3, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { createClient } from "@/lib/supabase/client";

export function QuickActions() {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    const isConfirmed = window.confirm(
      "Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently erase all your requests, messages, and wallet balance."
    );

    if (!isConfirmed) return;

    setIsDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.rpc("delete_own_account");
      if (error) {
        alert("Failed to delete account: " + error.message);
        setIsDeleting(false);
        return;
      }
      await supabase.auth.signOut();
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting your account.");
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link href="/request/new" className="block">
          <Button className="w-full justify-start h-11">
            <Plus className="w-4 h-4 mr-3" /> Create Request
          </Button>
        </Link>
        <Link href="/dashboard/requests" className="block">
          <Button variant="secondary" className="w-full justify-start h-11">
            <Package className="w-4 h-4 mr-3" /> My Requests
          </Button>
        </Link>
        <Link href="/dashboard/runner" className="block">
          <Button variant="secondary" className="w-full justify-start h-11">
            <Bike className="w-4 h-4 mr-3" /> Runner Mode
          </Button>
        </Link>
        <Link href="/dashboard/wallet" className="block">
          <Button variant="secondary" className="w-full justify-start h-11">
            <Wallet className="w-4 h-4 mr-3" /> Wallet
          </Button>
        </Link>
        <Link href="/dashboard/chat" className="block">
          <Button variant="secondary" className="w-full justify-start h-11">
            <MessageSquare className="w-4 h-4 mr-3" /> Chat
          </Button>
        </Link>
        <Link href="/dashboard/analytics" className="block">
          <Button variant="secondary" className="w-full justify-start h-11">
            <BarChart3 className="w-4 h-4 mr-3" /> Analytics
          </Button>
        </Link>
        <Link href="/complete-profile" className="block">
          <Button variant="secondary" className="w-full justify-start h-11">
            <User className="w-4 h-4 mr-3" /> Edit Profile
          </Button>
        </Link>
        <div className="pt-2 space-y-2 border-t mt-4">
          <LogoutButton 
            variant="destructive" 
            className="w-full justify-start h-11 bg-[var(--color-error)]/10 text-[var(--color-error)] hover:bg-[var(--color-error)]/20 hover:text-[var(--color-error)]" 
          />
          <Button
            type="button"
            variant="destructive"
            className="w-full justify-start h-11 bg-red-600 hover:bg-red-700 text-white font-semibold"
            onClick={handleDeleteAccount}
            isLoading={isDeleting}
            loadingText="Deleting Account..."
          >
            {!isDeleting && <Trash2 className="w-4 h-4 mr-2" />}
            Delete Account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
