import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface RequestSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function RequestSearch({ searchQuery, onSearchChange }: RequestSearchProps) {
  return (
    <div className="relative mb-6">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-muted-foreground" />
      </div>
      <Input
        type="text"
        placeholder="Search by category, pickup, or delivery location..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 h-11"
      />
    </div>
  );
}
