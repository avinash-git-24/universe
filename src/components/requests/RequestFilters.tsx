import { Database } from "@/types/database";

type RequestStatus = Database["public"]["Enums"]["request_status"];

interface RequestFiltersProps {
  currentFilter: RequestStatus | "all";
  onFilterChange: (status: RequestStatus | "all") => void;
}

const FILTERS: { label: string; value: RequestStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Picked Up", value: "picked_up" },
  { label: "In Transit", value: "in_transit" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

export function RequestFilters({ currentFilter, onFilterChange }: RequestFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {FILTERS.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
            currentFilter === filter.value
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
