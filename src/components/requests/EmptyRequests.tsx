import { PackageX, Clock, CheckCircle2, AlertCircle, Plus, SearchX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmptyRequestsProps {
  category?: "active" | "completed" | "cancelled" | "all";
  message?: string;
  description?: string;
  showCreate?: boolean;
  onViewCompleted?: () => void;
  completedCount?: number;
  isSearching?: boolean;
  onClearSearch?: () => void;
}

const CATEGORY_EMPTY_CONFIG = {
  active: {
    icon: Clock,
    title: "No Active Requests",
    description: "You don't have any ongoing delivery requests right now. Create one to get items delivered on campus!",
  },
  completed: {
    icon: CheckCircle2,
    title: "No Completed Requests",
    description: "You haven't completed any delivery requests yet. Past delivered requests will appear here.",
  },
  cancelled: {
    icon: AlertCircle,
    title: "No Cancelled Requests",
    description: "You don't have any cancelled delivery requests.",
  },
  all: {
    icon: PackageX,
    title: "No Requests Found",
    description: "Try adjusting your search terms or filters, or create a new request.",
  },
};

export function EmptyRequests({
  category = "all",
  message,
  description,
  showCreate = true,
  onViewCompleted,
  completedCount,
  isSearching = false,
  onClearSearch,
}: EmptyRequestsProps) {
  const config = CATEGORY_EMPTY_CONFIG[category] || CATEGORY_EMPTY_CONFIG.all;
  const Icon = isSearching ? SearchX : config.icon;

  const displayTitle = isSearching
    ? "No Matching Requests"
    : (message || config.title);

  const displayDescription = isSearching
    ? "We couldn't find any orders matching your search query. Try checking your keywords or reset the filter."
    : (description || config.description);

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-14 text-center border border-white/5 rounded-2xl bg-[#0c130f]/60 backdrop-blur-xl my-4 shadow-[0_0_30px_rgba(0,0,0,0.3)] relative overflow-hidden group">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Icon Badge Capsule */}
      <div className="relative mb-4 flex items-center justify-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-b from-[#112419] to-[#0a160f] border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.18)]">
          <Icon className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.75]" />
        </div>
      </div>

      {/* Title & Description */}
      <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight relative z-10">
        {displayTitle}
      </h3>
      <p className="text-xs sm:text-sm text-white/55 max-w-sm mt-1.5 mb-6 leading-relaxed relative z-10">
        {displayDescription}
      </p>

      {/* Actions */}
      <div className="flex flex-col items-center gap-3 relative z-10">
        {isSearching && onClearSearch ? (
          <Button
            onClick={onClearSearch}
            variant="secondary"
            className="bg-white/10 hover:bg-white/15 text-white font-bold h-10 px-5 rounded-xl border border-white/15 transition-all cursor-pointer"
          >
            Clear Search Filter
          </Button>
        ) : showCreate ? (
          <Link href="/request/new">
            <Button className="bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black font-extrabold h-11 px-6 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all active:scale-[0.98] cursor-pointer">
              <Plus className="w-4 h-4 mr-1.5 stroke-[3]" />
              Create a Request
            </Button>
          </Link>
        ) : null}

        {/* Smart Quick-Link to past completed orders */}
        {!isSearching && category === "active" && completedCount && completedCount > 0 && onViewCompleted && (
          <button
            type="button"
            onClick={onViewCompleted}
            className="text-xs font-semibold text-emerald-400/90 hover:text-emerald-300 transition-colors inline-flex items-center gap-1.5 pt-1 cursor-pointer group/link"
          >
            <span>View {completedCount} completed order{completedCount > 1 ? "s" : ""} history</span>
            <span className="group-hover/link:translate-x-0.5 transition-transform">➔</span>
          </button>
        )}
      </div>
    </div>
  );
}
