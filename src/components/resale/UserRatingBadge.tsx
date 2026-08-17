"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { getUserRatingStats, UserRatingStats } from "@/lib/database/resale/reviews";

interface UserRatingBadgeProps {
  userId: string;
  className?: string;
  showCount?: boolean;
}

export function UserRatingBadge({ userId, className = "", showCount = true }: UserRatingBadgeProps) {
  const [stats, setStats] = useState<UserRatingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getUserRatingStats(userId);
        setStats(data);
      } catch (err) {
        console.error("Failed to load user rating", err);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchStats();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className={`flex items-center gap-1 text-sm text-white/50 animate-pulse ${className}`}>
        <Star size={14} className="text-white/20" />
        <span>...</span>
      </div>
    );
  }

  if (!stats || stats.total_reviews === 0) {
    return (
      <div className={`flex items-center gap-1 text-xs text-white/50 ${className}`}>
        <Star size={14} className="text-white/30" />
        <span>No ratings yet</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Star size={14} className="text-yellow-400 fill-yellow-400" />
      <span className="text-sm font-semibold text-white">{stats.avg_rating.toFixed(1)}</span>
      {showCount && (
        <span className="text-xs text-white/60 ml-1">
          ({stats.total_reviews} review{stats.total_reviews !== 1 ? "s" : ""})
        </span>
      )}
    </div>
  );
}
