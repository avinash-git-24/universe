"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { addFundsMock } from "@/lib/database/wallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-card border rounded-lg shadow-lg p-6">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          disabled={loading}
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Add Funds to Wallet
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            This is a mock payment gateway. No real money will be deducted.
          </p>
        </div>
        
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-4 gap-2">
            {presetAmounts.map((amt) => (
              <Button 
                key={amt} 
                variant={amount === amt.toString() ? "primary" : "secondary"}
                className="w-full"
                onClick={() => setAmount(amt.toString())}
              >
                ₹{amt}
              </Button>
            ))}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="custom-amount" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Custom Amount (₹)
            </label>
            <Input 
              id="custom-amount" 
              type="number" 
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleTopUp} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {loading ? "Processing..." : `Pay ₹${amount || 0}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
