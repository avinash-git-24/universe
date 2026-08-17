"use client";

import { useState } from "react";
import { X, Loader2, IndianRupee } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createOffer } from "@/lib/database/resale/offers";

interface MakeOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  sellerId: string;
  listingTitle: string;
  originalAskingPrice: number;
  onOfferSuccess?: () => void;
}

export function MakeOfferModal({
  isOpen,
  onClose,
  listingId,
  sellerId,
  listingTitle,
  originalAskingPrice,
  onOfferSuccess,
}: MakeOfferModalProps) {
  const [offerPrice, setOfferPrice] = useState<string>(originalAskingPrice.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(offerPrice);
    if (isNaN(price) || price <= 0) {
      setError("Please enter a valid price.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      await createOffer(supabase, listingId, sellerId, price);
      if (onOfferSuccess) onOfferSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit offer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="w-full max-w-md bg-[#0A0F0C] border border-[#66FFB2]/10 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,230,118,0.15)] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="offer-modal-title"
      >
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 id="offer-modal-title" className="text-lg font-bold text-white">Make an Offer</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-[#A7B8B0] hover:text-white transition-colors rounded-lg hover:bg-white/5"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <p className="text-sm text-[#A7B8B0] mb-1">You are making an offer on:</p>
            <p className="font-medium text-white line-clamp-1">{listingTitle}</p>
          </div>

          <div>
            <label htmlFor="offerPrice" className="block text-sm font-semibold text-[#A7B8B0] mb-2">
              Your Offer (₹)
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <IndianRupee size={18} className="text-[#A7B8B0]" />
              </div>
              <input
                id="offerPrice"
                type="number"
                min="1"
                step="0.01"
                required
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#050A07] border border-[#66FFB2]/10 rounded-xl text-white placeholder-[#A7B8B0]/50 focus:outline-none focus:border-[#00E676]/50 transition-colors"
                placeholder="e.g. 500"
              />
            </div>
            <p className="text-xs text-[#A7B8B0] mt-2">
              Asking price: ₹{originalAskingPrice.toFixed(2)}
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 text-sm font-semibold text-[#A7B8B0] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#00C853] to-[#00E676] text-[#050A07] text-sm font-bold rounded-xl shadow-[0_4px_20px_rgba(0,230,118,0.25)] hover:shadow-[0_6px_28px_rgba(0,230,118,0.35)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Send Offer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
