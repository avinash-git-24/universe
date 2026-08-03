"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Database } from "@/types/database";
import type { StudentRequestWithDetails } from "@/lib/database/requests";
import { StudentRequestCard } from "@/components/request/StudentRequestCard";
import { RequestSearch } from "./RequestSearch";
import { RequestFilters } from "./RequestFilters";
import { Pagination } from "./Pagination";
import { EmptyRequests } from "./EmptyRequests";

type RequestStatus = Database["public"]["Enums"]["request_status"];

interface RequestListProps {
  initialRequests: StudentRequestWithDetails[];
}

const ITEMS_PER_PAGE = 5;

export function RequestList({ initialRequests }: RequestListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and Search Logic
  const filteredRequests = useMemo(() => {
    return initialRequests.filter((req) => {
      // Status Filter
      if (statusFilter !== "all" && req.status !== statusFilter) {
        return false;
      }
      
      // Search Query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const itemsMatch = req.items.some(item => item.name.toLowerCase().includes(query));
        const pickupMatch = req.pickup_location.toLowerCase().includes(query);
        const dropoffMatch = req.dropoff_location.toLowerCase().includes(query);
        
        if (!itemsMatch && !pickupMatch && !dropoffMatch) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // Sorting
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [initialRequests, searchQuery, statusFilter, sortBy]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const currentRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  const handleFilterChange = (status: RequestStatus | "all") => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div className="flex-1 w-full">
          <RequestSearch searchQuery={searchQuery} onSearchChange={handleSearchChange} />
          <RequestFilters currentFilter={statusFilter} onFilterChange={handleFilterChange} />
        </div>
        
        <select 
          className="h-11 px-3 border rounded-md bg-background text-sm"
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value as "newest" | "oldest");
            setCurrentPage(1);
          }}
        >
          <option value="newest">Sort by Newest</option>
          <option value="oldest">Sort by Oldest</option>
        </select>
      </div>

      {filteredRequests.length === 0 ? (
        <EmptyRequests showCreate={initialRequests.length === 0} />
      ) : (
        <div className="grid gap-6">
          {currentRequests.map(req => (
            <Link href={`/dashboard/requests/${req.id}`} key={req.id} className="block transition-transform hover:-translate-y-1">
              <StudentRequestCard request={req} />
            </Link>
          ))}
        </div>
      )}

      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={setCurrentPage} 
      />
    </div>
  );
}
