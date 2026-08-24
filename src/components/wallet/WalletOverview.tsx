"use client";

import { useState } from "react";
import { Wallet } from "@/lib/database/wallet";
import { Wallet as WalletIcon, Plus, ArrowRightLeft } from "lucide-react";
import { TopUpModal } from "./TopUpModal";

interface WalletOverviewProps {
  wallet: Wallet | null;
  role: "student" | "runner" | "admin";
  userId: string;
}

export function WalletOverview({ wallet, role, userId }: WalletOverviewProps) {
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  
  const balance = wallet?.balance || 0;

  return (
    <>
      <div className="bg-[#0d1411] border border-emerald-500/20 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(0,230,118,0.06)] relative overflow-hidden backdrop-blur-xl">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="text-xs sm:text-sm font-bold text-[#00E676] uppercase tracking-wider flex items-center gap-2 mb-4">
            <WalletIcon className="w-4 h-4" />
            <span>{role === "runner" ? "Earnings Balance" : "Wallet Balance"}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <div className="text-5xl sm:text-6xl font-black text-white flex items-center tracking-tight">
                <span className="text-[#00E676] text-4xl sm:text-5xl mr-2 font-bold">₹</span>
                {balance.toFixed(2)}
              </div>
              <p className="text-sm text-white/60 mt-2 font-medium">
                Available to {role === "runner" ? "withdraw or spend" : "spend on deliveries"}
              </p>
            </div>
            
            <div className="flex gap-3">
              {role === "student" ? (
                <button
                  onClick={() => setIsTopUpOpen(true)}
                  className="w-full sm:w-auto bg-[#00E676] hover:bg-[#00c864] text-[#050A07] font-bold text-sm sm:text-base px-6 py-3.5 rounded-xl shadow-[0_0_20px_rgba(0,230,118,0.25)] hover:shadow-[0_0_30px_rgba(0,230,118,0.4)] transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                  <span>Add Funds</span>
                </button>
              ) : (
                <button
                  onClick={() => alert("Withdrawal system coming soon!")}
                  className="w-full sm:w-auto bg-white/10 hover:bg-white/15 text-white font-semibold text-sm sm:text-base px-6 py-3.5 rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowRightLeft className="w-5 h-5" />
                  <span>Withdraw Funds</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <TopUpModal 
        isOpen={isTopUpOpen} 
        onClose={() => setIsTopUpOpen(false)} 
        userId={userId} 
      />
    </>
  );
}
