"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { updateResaleListing, deleteResaleListing } from "@/lib/database/resale/listings";
import { deleteAllListingImages } from "@/lib/database/resale/images";
import { CheckCircle2, XCircle, Trash2, Edit2, Loader2, RefreshCw } from "lucide-react";
import type { ResaleListingRow } from "@/lib/database/resale/types";
import { ReviewModal } from "./ReviewModal";

interface ResaleListingActionsProps {
  listing: ResaleListingRow;
}

export function ResaleListingActions({ listing }: ResaleListingActionsProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [acceptedBuyerId, setAcceptedBuyerId] = useState<string | null>(null);

  if (listing.status === "sold" || listing.status === "removed") {
    return null;
  }

  const handleUpdateStatus = async (newStatus: "active" | "reserved" | "sold") => {
    setIsProcessing(true);
    setError(null);
    try {
      const supabase = createClient();

      if (newStatus === "sold") {
        // Fetch the accepted offer to find the buyer
        const { data: offerData, error: offerError } = await supabase
          .from("resale_offers")
          .select("buyer_id")
          .eq("listing_id", listing.id)
          .eq("status", "accepted")
          .single();

        // If there's an accepted buyer, we'll prompt for a review
        if (!offerError && offerData) {
          setAcceptedBuyerId(offerData.buyer_id);
        }
      }

      await updateResaleListing(supabase, listing.id, { status: newStatus });
      router.refresh();

      if (newStatus === "sold" && acceptedBuyerId) {
        // Handled in a useEffect or directly below because state might not have batched yet
      }
      
      // If we marked as sold and we found a buyer, show the review modal instead of just finishing
      if (newStatus === "sold") {
        // We re-query locally because setAcceptedBuyerId isn't immediately available here
        const supabase = createClient();
        const { data: offerData } = await supabase
          .from("resale_offers")
          .select("buyer_id")
          .eq("listing_id", listing.id)
          .eq("status", "accepted")
          .single();

        if (offerData) {
          setAcceptedBuyerId(offerData.buyer_id);
          setShowReviewModal(true);
        }
      }

    } catch (err: unknown) {
      console.error("Failed to update status:", err);
      setError(err instanceof Error ? err.message : "Failed to update listing status");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm("Are you sure you want to completely remove this listing? This action cannot be undone.")) {
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    try {
      const supabase = createClient();
      // Important: As noted in deleteResaleListing docs, we must delete storage objects first
      await deleteAllListingImages(supabase, listing.id);
      await deleteResaleListing(supabase, listing.id);
      router.push("/dashboard/marketplace");
    } catch (err: unknown) {
      console.error("Failed to remove listing:", err);
      setError(err instanceof Error ? err.message : "Failed to remove listing");
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
          Owner Actions
        </h3>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm flex items-start gap-2">
            <XCircle size={16} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {(listing.status === "active" || listing.status === "reserved") && (
            <Link href={`/dashboard/marketplace/${listing.id}/edit`} className="w-full">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 text-white/90 border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 hover:text-emerald-300 transition-all font-medium cursor-pointer"
              >
                <Edit2 size={16} />
                Edit Listing
              </button>
            </Link>
          )}

          {listing.status === "active" && (
            <button
              onClick={() => handleUpdateStatus("reserved")}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 hover:bg-[#F59E0B]/20 transition-colors disabled:opacity-50 font-medium"
            >
              {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Clock size={18} />}
              Mark as Reserved
            </button>
          )}

          {listing.status === "reserved" && (
            <button
              onClick={() => handleUpdateStatus("active")}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20 transition-colors disabled:opacity-50 font-medium"
            >
              {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
              Mark as Active
            </button>
          )}

          {(listing.status === "active" || listing.status === "reserved") && (
            <button
              onClick={() => handleUpdateStatus("sold")}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20 hover:bg-[#00E676]/20 transition-colors disabled:opacity-50 font-medium"
            >
              {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
              Mark as Sold
            </button>
          )}

          {(listing.status === "active" || listing.status === "reserved") && (
            <button
              onClick={handleRemove}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50 font-medium mt-2"
            >
              {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
              Remove Listing
            </button>
          )}
        </div>
      </div>

      {showReviewModal && acceptedBuyerId && (
        <ReviewModal
          listingId={listing.id}
          revieweeId={acceptedBuyerId}
          role="seller"
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            // Already refreshed above, but we can do it again if needed
            router.refresh();
          }}
        />
      )}
    </>
  );
}

// Just a local icon since it's only used here
function Clock({ size = 24, className = "" }: { size?: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

