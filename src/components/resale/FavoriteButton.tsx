"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toggleFavorite } from "@/lib/database/resale";

interface FavoriteButtonProps {
  listingId: string;
  initialIsFavorited: boolean;
  onToggleSuccess?: (newStatus: boolean) => void;
  size?: number;
}

export function FavoriteButton({
  listingId,
  initialIsFavorited,
  onToggleSuccess,
  size = 20,
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsFavorited(initialIsFavorited);
  }, [initialIsFavorited]);

  async function handleToggle(e: React.MouseEvent) {
    // Prevent navigating if the button is inside a Link
    e.preventDefault();
    e.stopPropagation();

    if (isPending) return;

    // Optimistic UI update
    const previousState = isFavorited;
    setIsFavorited(!previousState);
    setIsPending(true);

    try {
      const supabase = createClient();
      const result = await toggleFavorite(supabase, listingId);

      // Sync with server's source of truth
      setIsFavorited(result.isFavorited);
      if (onToggleSuccess) {
        onToggleSuccess(result.isFavorited);
      }
    } catch (error: unknown) {
      // Revert optimistic update
      setIsFavorited(previousState);
      const e = error as { code?: string };
      const msg =
        e?.code === "UNAUTHENTICATED"
          ? "Please sign in to save listings."
          : "Failed to update wishlist. Please try again.";

      alert(msg);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      aria-label={isFavorited ? "Remove from saved" : "Save listing"}
      aria-pressed={isFavorited}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: `${size * 2}px`,
        height: `${size * 2}px`,
        borderRadius: "50%",
        background: isFavorited
          ? "rgba(239, 68, 68, 0.15)"
          : "rgba(10, 15, 12, 0.6)",
        backdropFilter: "blur(4px)",
        border: `1px solid ${
          isFavorited ? "rgba(239, 68, 68, 0.3)" : "rgba(255, 255, 255, 0.15)"
        }`,
        cursor: isPending ? "wait" : "pointer",
        transition: "all 0.2s ease",
        opacity: isPending ? 0.7 : 1,
      }}
      className="hover:scale-110 hover:bg-[rgba(239,68,68,0.2)] focus:outline-none focus:ring-2 focus:ring-[#ef4444] focus:ring-offset-1 focus:ring-offset-[#0a0f0c]"
    >
      <Heart
        size={size}
        color={isFavorited ? "#ef4444" : "#ffffff"}
        fill={isFavorited ? "#ef4444" : "transparent"}
        style={{
          transition: "all 0.2s ease",
          transform: isFavorited ? "scale(1.1)" : "scale(1)",
        }}
      />
    </button>
  );
}
