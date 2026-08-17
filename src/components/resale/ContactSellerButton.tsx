"use client";

import { useState } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { contactSellerAction } from "@/app/dashboard/marketplace/actions";
import { useRouter } from "next/navigation";

export function ContactSellerButton({ listingId }: { listingId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleContact = async () => {
    setLoading(true);
    const result = await contactSellerAction(listingId);
    
    if (result.success && result.conversationId) {
      router.push(`/dashboard/chat?id=${result.conversationId}`);
    } else {
      alert(`Failed to start conversation: ${result.error || "Unknown error"}`);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleContact}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-[#10b981] hover:bg-[#10b981]/90 text-[#0d1310] font-bold text-lg transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] group disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <Loader2 size={20} className="animate-spin" />
      ) : (
        <MessageSquare size={20} className="transition-transform group-hover:scale-110" />
      )}
      {loading ? "Starting Chat..." : "Contact Seller"}
    </button>
  );
}
