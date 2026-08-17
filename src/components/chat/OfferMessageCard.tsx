"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Clock, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { acceptOffer, rejectOffer, withdrawOffer, type ResaleOffer } from "@/lib/database/resale/offers";
import { Message } from "@/lib/database/chat";

interface OfferMessageCardProps {
  message: Message;
  currentUserId: string;
  conversationId: string;
}

export function OfferMessageCard({ message, currentUserId, conversationId }: OfferMessageCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse metadata from message
  const metadata = message.metadata as { type?: string; offer_price?: number; offer_id?: string } | null;
  if (!metadata || !metadata.type) return null;

  const isSender = message.sender_id === currentUserId;
  const offerPrice = metadata.offer_price;
  const offerStatus = metadata.type; // "created", "accepted", "rejected", "withdrawn"
  
  // Note: the sender of a "created" offer is ALWAYS the buyer.
  const isBuyer = isSender;
  const isSeller = !isSender;

  const handleAction = async (action: "accept" | "reject" | "withdraw") => {
    setIsProcessing(true);
    setError(null);
    try {
      const supabase = createClient();
      
      // We need a dummy offer object with just the ID to pass to the API
      const dummyOffer = { id: metadata.offer_id, offer_price: offerPrice } as ResaleOffer;

      if (action === "accept") await acceptOffer(supabase, dummyOffer, conversationId);
      if (action === "reject") await rejectOffer(supabase, dummyOffer, conversationId);
      if (action === "withdraw") await withdrawOffer(supabase, dummyOffer, conversationId);
      
      // Refresh chat to show the new system message
      window.location.reload(); 
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Failed to ${action} offer`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`flex flex-col gap-2 max-w-[85%] sm:max-w-[75%] ${isSender ? "self-end" : "self-start"}`}>
      <div 
        className={`relative group rounded-2xl p-4 shadow-sm border ${
          offerStatus === "created"
            ? isSender 
              ? "bg-[#00E676]/10 border-[#00E676]/20 text-white rounded-tr-sm" 
              : "bg-[#1A231E] border-white/10 text-white rounded-tl-sm"
            : offerStatus === "accepted"
              ? "bg-blue-500/10 border-blue-500/20 text-white rounded-xl"
              : "bg-red-500/10 border-red-500/20 text-white rounded-xl"
        }`}
      >
        <div className="flex items-start gap-3 mb-3">
          <div className={`p-2 rounded-xl shrink-0 ${
             offerStatus === "created" ? "bg-[#00E676]/20 text-[#00E676]" :
             offerStatus === "accepted" ? "bg-blue-500/20 text-blue-500" :
             "bg-red-500/20 text-red-500"
          }`}>
            <Tag size={18} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold opacity-90 mb-0.5">
              {offerStatus === "created" && isBuyer && "You made an offer"}
              {offerStatus === "created" && isSeller && "Buyer made an offer"}
              {offerStatus === "accepted" && "Offer Accepted"}
              {offerStatus === "rejected" && "Offer Rejected"}
              {offerStatus === "withdrawn" && "Offer Withdrawn"}
            </p>
            <p className="text-2xl font-black tracking-tight">₹{offerPrice}</p>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-400 mb-3">{error}</p>
        )}

        {/* Action Buttons: Only show on pending ("created") offers */}
        {offerStatus === "created" && (
          <div className="flex gap-2 pt-2 mt-2 border-t border-white/5">
            {isSeller && (
              <>
                <button
                  onClick={() => handleAction("accept")}
                  disabled={isProcessing}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#00E676]/20 hover:bg-[#00E676]/30 text-[#00E676] rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 size={16} />
                  Accept
                </button>
                <button
                  onClick={() => handleAction("reject")}
                  disabled={isProcessing}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                >
                  <XCircle size={16} />
                  Reject
                </button>
              </>
            )}
            {isBuyer && (
              <button
                onClick={() => handleAction("withdraw")}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
              >
                <Clock size={16} />
                Withdraw Offer
              </button>
            )}
          </div>
        )}
      </div>
      <div className={`flex items-center gap-2 px-1 ${isSender ? "justify-end" : "justify-start"}`}>
        <span className="text-[10px] font-medium text-white/30 uppercase tracking-wider">
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
