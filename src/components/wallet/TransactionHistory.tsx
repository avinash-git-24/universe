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
      <div className="text-center p-8 border rounded-lg bg-card text-muted-foreground mt-4">
        No transactions found.
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {transactions.map((tx) => {
        const isPositive = tx.type === "deposit" || tx.type === "earning" || tx.type === "refund";
        return (
          <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'}`}>
                {isPositive ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-semibold capitalize">{tx.type}</p>
                <div className="flex items-center text-xs text-muted-foreground mt-1 gap-2">
                  <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {format(new Date(tx.created_at), "MMM d, h:mm a")}</span>
                  {tx.status === "completed" && <span className="flex items-center text-emerald-500"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</span>}
                  {tx.status === "pending" && <span className="flex items-center text-amber-500"><Clock className="w-3 h-3 mr-1" /> Pending</span>}
                  {tx.status === "failed" && <span className="flex items-center text-destructive"><XCircle className="w-3 h-3 mr-1" /> Failed</span>}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className={`font-bold ${isPositive ? 'text-emerald-500' : ''}`}>
                {isPositive ? "+" : "-"} ₹{tx.amount}
              </p>
              {tx.description && (
                <p className="text-xs text-muted-foreground flex items-center justify-end mt-1">
                  <FileText className="w-3 h-3 mr-1" /> {tx.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
