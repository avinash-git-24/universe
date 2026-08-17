"use client";

import { useState } from "react";
import { Star, X, Loader2 } from "lucide-react";
import { createReview, ResaleReviewRole } from "@/lib/database/resale/reviews";

interface ReviewModalProps {
  listingId: string;
  revieweeId: string;
  role: ResaleReviewRole;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReviewModal({ listingId, revieweeId, role, onClose, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createReview({
        listingId,
        revieweeId,
        role,
        rating,
        comment: comment.trim(),
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0B120D] border border-[#00E676]/20 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
        <div className="flex justify-between items-center p-4 border-b border-white/5 bg-white/5">
          <h2 className="text-xl font-bold text-white">Rate the {role === "buyer" ? "Buyer" : "Seller"}</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg flex items-center justify-center text-center">
              {error}
            </div>
          )}
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-white/70">How was your experience?</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Star
                    size={32}
                    className={`transition-colors ${
                      star <= (hoverRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-white/20"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-xs text-[#00E676] font-medium mt-1">
                {["Terrible", "Bad", "Okay", "Good", "Excellent"][rating - 1]}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <label htmlFor="comment" className="text-sm font-medium text-white/90">
              Leave a comment <span className="text-white/40 font-normal">(Optional)</span>
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isSubmitting}
              placeholder="What went well? What could be better?"
              rows={3}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder-white/30 focus:outline-none focus:border-[#00E676]/50 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="w-full mt-4 py-3 rounded-xl bg-[#00E676] text-black font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 hover:bg-[#00E676]/90 disabled:opacity-50 disabled:active:scale-100"
          >
            {isSubmitting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              "Submit Review"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
