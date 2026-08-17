import { useState, useEffect } from "react";
import { X, MapPin, Package, AlertCircle, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { ResaleListingWithImages } from "@/lib/database/resale/types";
import { getWallet } from "@/lib/database/wallet";

interface RequestRunnerModalProps {
  listing: ResaleListingWithImages;
  onClose: () => void;
  onSuccess: () => void;
}

export function RequestRunnerModal({ listing, onClose, onSuccess }: RequestRunnerModalProps) {
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [acceptedOfferId, setAcceptedOfferId] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const supabase = createClient();
  const DELIVERY_FEE = 20;
  const TOTAL_COST = listing.price + DELIVERY_FEE;

  useEffect(() => {
    async function loadCheckoutData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // Fetch Wallet Balance
        const wallet = await getWallet(supabase, user.id);
        if (wallet) {
          setWalletBalance(wallet.balance);
        } else {
          setWalletBalance(0);
        }

        // Fetch Accepted Offer ID
        const { data: offerData, error: offerError } = await supabase
          .from("resale_offers")
          .select("id")
          .eq("listing_id", listing.id)
          .eq("buyer_id", user.id)
          .eq("status", "accepted")
          .single();

        if (offerError || !offerData) {
          throw new Error("Could not find your accepted offer for this item.");
        }
        
        setAcceptedOfferId(offerData.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load checkout data.");
      } finally {
        setIsLoadingData(false);
      }
    }
    loadCheckoutData();
  }, [listing.id, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!dropoffLocation.trim()) {
      setError("Please provide your delivery location.");
      return;
    }

    if (!acceptedOfferId) {
      setError("Missing offer ID. Please refresh the page.");
      return;
    }

    if (walletBalance === null || walletBalance < TOTAL_COST) {
      setError("Insufficient wallet balance. Please add funds to your wallet first.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in.");

      const pickupLocation = listing.pickup_location || "Contact seller for exact pickup location";

      // Call the secure Escrow Checkout RPC
      const { data: newRequestId, error: rpcError } = await supabase.rpc(
        "checkout_resale_offer_with_delivery",
        {
          p_offer_id: acceptedOfferId,
          p_dropoff_location: dropoffLocation.trim(),
          p_pickup_location: pickupLocation,
        }
      );

      if (rpcError) {
        throw new Error(rpcError.message || "Checkout failed. Please try again.");
      }

      // If the user provided additional instructions, we could optionally update the delivery_request here
      if (instructions.trim() && newRequestId) {
        await supabase
          .from("delivery_requests")
          .update({ instructions: instructions.trim() })
          .eq("id", newRequestId);
      }

      onSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasInsufficientFunds = walletBalance !== null && walletBalance < TOTAL_COST;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3 text-white">
            <Package className="w-5 h-5 text-[#00E676]" />
            <h2 className="text-xl font-bold">Secure Checkout</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoadingData ? (
          <div className="p-8 text-center text-white/40">Loading checkout details...</div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Order Summary */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <p className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-2">Order Summary</p>
                <div className="flex justify-between items-center text-white">
                  <span className="font-medium truncate max-w-[200px]">{listing.title}</span>
                  <span>₹{listing.price}</span>
                </div>
                <div className="flex justify-between items-center text-white/60 text-sm">
                  <span>Campus Delivery Fee</span>
                  <span>₹{DELIVERY_FEE}</span>
                </div>
                <div className="pt-3 border-t border-white/10 flex justify-between items-center text-white font-bold text-lg">
                  <span>Total Cost</span>
                  <span className="text-[#00E676]">₹{TOTAL_COST}</span>
                </div>
              </div>

              {/* Wallet Status */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${hasInsufficientFunds ? 'bg-red-500/5 border-red-500/20' : 'bg-[#00E676]/5 border-[#00E676]/20'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${hasInsufficientFunds ? 'bg-red-500/10 text-red-400' : 'bg-[#00E676]/10 text-[#00E676]'}`}>
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${hasInsufficientFunds ? 'text-red-400' : 'text-[#00E676]'}`}>
                      Wallet Balance
                    </p>
                    <p className="text-white font-medium text-lg">₹{walletBalance ?? "---"}</p>
                  </div>
                </div>
                {hasInsufficientFunds && (
                  <div className="text-right">
                    <span className="text-xs font-semibold text-red-400 uppercase tracking-wider block mb-1">Shortfall</span>
                    <span className="text-sm font-bold text-red-400">-₹{(TOTAL_COST - (walletBalance || 0)).toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/80 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-white/40" /> Drop-off Location
                </label>
                <input
                  type="text"
                  value={dropoffLocation}
                  onChange={(e) => setDropoffLocation(e.target.value)}
                  placeholder="e.g. Hostel 12, Room 402"
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-3.5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#00E676]/50 focus:border-[#00E676]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/80">Delivery Instructions (Optional)</label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Call me when you reach the gate."
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-3.5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#00E676]/50 focus:border-[#00E676] min-h-[100px] resize-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <Button 
                type="submit" 
                className={`w-full font-bold py-6 text-lg rounded-xl transition-all hover:scale-[1.02] ${
                  hasInsufficientFunds 
                    ? "bg-white/10 text-white/40 hover:bg-white/10 cursor-not-allowed border border-white/5" 
                    : "bg-[#00E676] hover:bg-[#00BFA5] text-black shadow-[0_0_20px_rgba(0,230,118,0.3)]"
                }`}
                disabled={isSubmitting || !dropoffLocation.trim() || hasInsufficientFunds}
              >
                {isSubmitting 
                  ? "Processing..." 
                  : hasInsufficientFunds 
                    ? "Insufficient Balance" 
                    : "Pay Securely via Wallet"}
              </Button>
              {hasInsufficientFunds && (
                <p className="text-center text-xs text-white/40 mt-3">
                  Please go to the Wallet tab to add funds before continuing.
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
