"use client";

import { useState } from "react";
import { Calendar, Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuickDateRange, AnalyticsFilterState } from "@/types/analytics";

interface AnalyticsFilterBarProps {
  filterState: AnalyticsFilterState;
  onFilterChange: (newFilter: AnalyticsFilterState) => void;
  className?: string;
}

const QUICK_RANGES: { id: QuickDateRange; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "7d", label: "Last 7 Days" },
  { id: "30d", label: "Last 30 Days" },
  { id: "this_month", label: "This Month" },
  { id: "last_month", label: "Last Month" },
  { id: "all_time", label: "All Time" },
  { id: "custom", label: "Custom Range" },
];

export function AnalyticsFilterBar({
  filterState,
  onFilterChange,
  className = "",
}: AnalyticsFilterBarProps) {
  const [startDate, setStartDate] = useState(filterState.startDate || "");
  const [endDate, setEndDate] = useState(filterState.endDate || "");

  const handleQuickRangeClick = (range: QuickDateRange) => {
    if (range === "custom") {
      onFilterChange({ quickRange: "custom", startDate, endDate });
    } else {
      onFilterChange({ quickRange: range });
    }
  };

  const handleCustomDateApply = () => {
    if (!startDate && !endDate) return;
    onFilterChange({
      quickRange: "custom",
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    onFilterChange({ quickRange: "30d" });
  };

  return (
    <div className={`p-4 bg-card border rounded-xl shadow-sm space-y-4 ${className}`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Quick Date Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <span className="text-xs font-semibold text-muted-foreground flex items-center mr-1 gap-1">
            <Filter className="w-3.5 h-3.5" /> Date Filter:
          </span>
          {QUICK_RANGES.map((range) => (
            <Button
              key={range.id}
              variant={filterState.quickRange === range.id ? "primary" : "secondary"}
              size="sm"
              onClick={() => handleQuickRangeClick(range.id)}
              className="text-xs h-8 px-3 rounded-lg capitalize"
            >
              {range.label}
            </Button>
          ))}
        </div>

        {/* Reset Filter Button */}
        {filterState.quickRange !== "30d" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs h-8 text-muted-foreground hover:text-foreground gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Filter
          </Button>
        )}
      </div>

      {/* Custom Date Range Picker */}
      {filterState.quickRange === "custom" && (
        <div className="pt-3 border-t flex flex-col sm:flex-row items-end gap-3 text-xs">
          <div className="space-y-1 w-full sm:w-auto">
            <label className="font-semibold text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3 text-primary" /> Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1 w-full sm:w-auto">
            <label className="font-semibold text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3 text-primary" /> End Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <Button
            size="sm"
            onClick={handleCustomDateApply}
            className="h-9 px-4 text-xs font-semibold w-full sm:w-auto"
          >
            Apply Range
          </Button>
        </div>
      )}
    </div>
  );
}
