import { createClient } from "@/lib/supabase/server";
import { getAllUsers } from "@/lib/database/admin";
import { UsersTable } from "@/components/admin/UsersTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Users · UniVerse Admin",
  description: "View and manage all students and runners.",
};

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const users = await getAllUsers(supabase);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Manage Users</h1>
        <p className="text-muted-foreground mt-1">Search, filter, and moderate student and runner accounts.</p>
      </div>

      <UsersTable users={users} />
    </div>
  );
}
