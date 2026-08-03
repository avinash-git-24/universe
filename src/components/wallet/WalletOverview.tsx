"use client";

import { useState } from "react";
import { Wallet } from "@/lib/database/wallet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet as WalletIcon, IndianRupee, Plus, ArrowRightLeft } from "lucide-react";
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
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center">
            <WalletIcon className="w-4 h-4 mr-2" />
            {role === "runner" ? "Earnings Balance" : "Wallet Balance"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-5xl font-extrabold flex items-center">
                <IndianRupee className="w-10 h-10 mr-1 opacity-80" />
                {balance.toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Available to {role === "runner" ? "withdraw or spend" : "spend on deliveries"}
              </p>
            </div>
            
            <div className="flex gap-2">
              {role === "student" ? (
                <Button onClick={() => setIsTopUpOpen(true)} className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Funds
                </Button>
              ) : (
                <Button onClick={() => alert("Withdrawal system coming soon!")} className="w-full sm:w-auto">
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Withdraw Funds
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <TopUpModal 
        isOpen={isTopUpOpen} 
        onClose={() => setIsTopUpOpen(false)} 
        userId={userId} 
      />
    </>
  );
}
