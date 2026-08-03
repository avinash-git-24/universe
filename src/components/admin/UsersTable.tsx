"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Search, ShieldAlert, ShieldCheck } from "lucide-react";
import { AdminProfile, updateUserStatus } from "@/lib/database/admin";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface UsersTableProps {
  users: AdminProfile[];
}

export function UsersTable({ users }: UsersTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "student" | "runner" | "admin">("all");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const filteredUsers = users.filter((user) => {
    if (roleFilter !== "all" && user.role !== roleFilter) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchName = user.full_name?.toLowerCase().includes(q);
      const matchEnrollment = user.enrollment_number?.toLowerCase().includes(q);
      if (!matchName && !matchEnrollment) return false;
    }
    return true;
  });

  const handleStatusToggle = async (userId: string, currentStatus: "active" | "suspended") => {
    if (!confirm(`Are you sure you want to ${currentStatus === "active" ? "suspend" : "activate"} this user?`)) return;
    
    setIsUpdating(userId);
    try {
      const supabase = createClient();
      const newStatus = currentStatus === "active" ? "suspended" : "active";
      const success = await updateUserStatus(supabase, userId, newStatus);
      if (success) {
        router.refresh();
      } else {
        alert("Failed to update user status.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search users..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        
        <select 
          className="h-10 px-3 border rounded-md bg-background text-sm w-full sm:w-auto"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as "all" | "student" | "runner" | "admin")}
        >
          <option value="all">All Roles</option>
          <option value="student">Students</option>
          <option value="runner">Runners</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs">
            <tr>
              <th className="px-6 py-3 font-semibold">User</th>
              <th className="px-6 py-3 font-semibold">Role</th>
              <th className="px-6 py-3 font-semibold">Joined</th>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                  <Search className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="font-semibold text-base text-foreground">No users found</p>
                  <p className="text-xs mt-1">Try adjusting your search query or role filter.</p>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold">{user.full_name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{user.enrollment_number || "No ID"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={user.role === "admin" ? "accent" : user.role === "runner" ? "primary" : "neutral"} className="capitalize">
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                    {format(new Date(user.created_at), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={user.account_status === "active" ? "neutral" : "error"} className="capitalize bg-opacity-10 text-xs py-0.5">
                      {user.account_status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.role !== "admin" && (
                      <Button 
                        variant={user.account_status === "active" ? "destructive" : "secondary"} 
                        size="sm"
                        disabled={isUpdating === user.id}
                        onClick={() => handleStatusToggle(user.id, user.account_status)}
                      >
                        {user.account_status === "active" ? (
                          <><ShieldAlert className="w-4 h-4 mr-2" /> Suspend</>
                        ) : (
                          <><ShieldCheck className="w-4 h-4 mr-2" /> Activate</>
                        )}
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
