import { createClient } from "@/lib/supabase/server";
import { getAllPlatformRequests, getAllUsers } from "@/lib/database/admin";
import { DeliveriesTable } from "@/components/admin/DeliveriesTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform Deliveries · UniVerse Admin",
  description: "Oversight of all active and past deliveries.",
};

export default async function AdminDeliveriesPage() {
  const supabase = await createClient();
  const [requests, users] = await Promise.all([
    getAllPlatformRequests(supabase),
    getAllUsers(supabase),
  ]);

  const runners = users.filter((u) => u.role === "runner" && u.account_status === "active");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Platform Deliveries</h1>
        <p className="text-muted-foreground mt-1">Track every delivery request happening across the campus.</p>
      </div>

      <DeliveriesTable requests={requests} availableRunners={runners} />
    </div>
  );
}
