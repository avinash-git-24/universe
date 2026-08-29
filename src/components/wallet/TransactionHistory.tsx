"use client";

import { format } from "date-fns";
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Clock, XCircle, FileText } from "lucide-react";
import { Transaction } from "@/lib/database/wallet";

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center p-12 border border-white/10 rounded-2xl bg-[#0d1411]/80 backdrop-blur-md text-white/50 mt-2 flex flex-col items-center justify-center gap-3">
        <Clock className="w-8 h-8 text-white/20" />
        <p className="text-base font-medium">No transactions found.</p>
        <p className="text-xs text-white/40">Your deposits and payments will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => {
        const isPositive = tx.type === "deposit" || tx.type === "earning" || tx.type === "refund";
        return (
          <div key={tx.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 sm:p-5 gap-3 border border-white/10 rounded-2xl bg-[#0d1411]/80 hover:border-emerald-500/30 transition-all backdrop-blur-md">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                isPositive 
                  ? 'bg-emerald-500/15 text-[#00E676] border-emerald-500/20' 
                  : 'bg-rose-500/15 text-rose-400 border-rose-500/20'
              }`}>
                {isPositive ? <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5" /> : <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />}
              </div>
              <div>
                <p className="font-bold text-white text-sm sm:text-base capitalize">{tx.type}</p>
                <div className="flex items-center text-[11px] sm:text-xs text-white/50 mt-0.5 sm:mt-1 gap-2 sm:gap-2.5 flex-wrap">
                  <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {format(new Date(tx.created_at), "MMM d, h:mm a")}</span>
                  {tx.status === "completed" && <span className="flex items-center text-[#00E676] bg-emerald-500/10 px-1.5 sm:px-2 py-0.5 rounded-full font-semibold"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</span>}
                  {tx.status === "pending" && <span className="flex items-center text-amber-400 bg-amber-500/10 px-1.5 sm:px-2 py-0.5 rounded-full font-semibold"><Clock className="w-3 h-3 mr-1" /> Pending</span>}
                  {tx.status === "failed" && <span className="flex items-center text-rose-400 bg-rose-500/10 px-1.5 sm:px-2 py-0.5 rounded-full font-semibold"><XCircle className="w-3 h-3 mr-1" /> Failed</span>}
                </div>
              </div>
            </div>
            
            <div className="text-left sm:text-right w-full sm:w-auto flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-end border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
              <p className={`font-black text-base sm:text-lg ${isPositive ? 'text-[#00E676]' : 'text-white'}`}>
                {isPositive ? "+" : "-"} ₹{tx.amount}
              </p>
              {tx.description && (
                <p className="text-[11px] sm:text-xs text-white/60 flex items-center justify-end font-medium">
                  <FileText className="w-3 h-3 mr-1 opacity-70" /> {tx.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
