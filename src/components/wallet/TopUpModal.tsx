"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { addFundsMock } from "@/lib/database/wallet";
import { CreditCard, Loader2, X } from "lucide-react";

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function TopUpModal({ isOpen, onClose, userId }: TopUpModalProps) {
  const [amount, setAmount] = useState("500");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleTopUp = async () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    
    // Simulate network delay for realistic "Gateway" feel
    await new Promise(resolve => setTimeout(resolve, 1500));

    const result = await addFundsMock(supabase, userId, val);
    
    setLoading(false);
    
    if (result.success) {
      router.refresh(); // Refresh page to get new server data
      onClose();
    } else {
      alert("Failed to add funds: " + result.error);
    }
  };

  const presetAmounts = [100, 500, 1000, 2000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md bg-[#0d1411] border border-emerald-500/30 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.8)] p-6 sm:p-7 text-white">
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 text-white/50 hover:text-white transition-colors"
          disabled={loading}
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold flex items-center gap-2.5 text-white">
            <div className="p-2 rounded-lg bg-emerald-500/15 text-[#00E676] border border-emerald-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            Add Funds to Wallet
          </h2>
          <p className="text-sm text-white/60 mt-2">
            This is a mock payment gateway. No real money will be deducted.
          </p>
        </div>
        
        <div className="space-y-5 py-2">
          <div>
            <label className="text-xs font-bold text-white/70 uppercase tracking-wider block mb-2.5">
              Quick Select
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {presetAmounts.map((amt) => {
                const isSelected = amount === amt.toString();
                return (
                  <button 
                    key={amt} 
                    type="button"
                    className={`py-2.5 rounded-xl font-bold text-sm transition-all ${
                      isSelected 
                        ? 'bg-[#00E676] text-[#050A07] shadow-[0_0_15px_rgba(0,230,118,0.3)]' 
                        : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                    }`}
                    onClick={() => setAmount(amt.toString())}
                  >
                    ₹{amt}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="custom-amount" className="text-xs font-bold text-white/70 uppercase tracking-wider block">
              Custom Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-[#00E676]">₹</span>
              <input 
                id="custom-amount" 
                type="number" 
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                className="w-full bg-black/50 border border-white/15 focus:border-[#00E676] focus:outline-none focus:ring-1 focus:ring-[#00E676] text-white rounded-xl pl-9 pr-4 py-3.5 text-lg font-bold placeholder:text-white/30 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-2">
          <button 
            type="button"
            onClick={onClose} 
            disabled={loading}
            className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/10 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleTopUp} 
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-[#00E676] hover:bg-[#00c864] text-[#050A07] font-bold text-sm shadow-[0_0_20px_rgba(0,230,118,0.3)] hover:shadow-[0_0_30px_rgba(0,230,118,0.4)] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
            {loading ? "Processing..." : `Pay ₹${amount || 0}`}
          </button>
        </div>
      </div>
    </div>
  );
}
