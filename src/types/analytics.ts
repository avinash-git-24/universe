export type QuickDateRange = "today" | "7d" | "30d" | "this_month" | "last_month" | "all_time" | "custom";

export interface AnalyticsFilterState {
  quickRange: QuickDateRange;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}
