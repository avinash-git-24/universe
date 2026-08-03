"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { AdminPlatformRequest } from "@/lib/database/admin";
import { Input } from "@/components/ui/input";
import { RequestStatusBadge } from "@/components/request/RequestStatusBadge";
import Link from "next/link";

interface DeliveriesTableProps {
  requests: AdminPlatformRequest[];
}

export function DeliveriesTable({ requests }: DeliveriesTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredRequests = requests.filter((req) => {
    if (statusFilter !== "all" && req.status !== statusFilter) return false;
    
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchPickup = req.pickup_location.toLowerCase().includes(q);
      const matchDropoff = req.dropoff_location.toLowerCase().includes(q);
      const matchId = req.id.toLowerCase().includes(q);
      const matchStudent = req.requester?.full_name?.toLowerCase().includes(q);
      if (!matchPickup && !matchDropoff && !matchId && !matchStudent) return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by ID, location, or student..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        
        <select 
          className="h-10 px-3 border rounded-md bg-background text-sm w-full sm:w-auto"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="picked_up">Picked Up</option>
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs">
            <tr>
              <th className="px-6 py-3 font-semibold">ID</th>
              <th className="px-6 py-3 font-semibold">Student</th>
              <th className="px-6 py-3 font-semibold">Route</th>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  No requests found matching criteria.
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/requests/${req.id}`} className="font-mono text-primary hover:underline">
                      {req.id.substring(0, 8)}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{req.requester?.full_name || "Unknown"}</p>
                  </td>
                  <td className="px-6 py-4 max-w-[200px] truncate">
                    <span className="text-muted-foreground">{req.pickup_location}</span>
                    <span className="mx-2 text-muted-foreground">→</span>
                    <span className="font-medium">{req.dropoff_location}</span>
                  </td>
                  <td className="px-6 py-4">
                    <RequestStatusBadge status={req.status} className="py-0.5 px-2 text-xs" />
                  </td>
                  <td className="px-6 py-4 text-muted-foreground whitespace-nowrap text-xs">
                    {format(new Date(req.created_at), "MMM d, yyyy h:mm a")}
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
