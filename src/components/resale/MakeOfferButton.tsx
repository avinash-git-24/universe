"use client";

import { useState } from "react";
import { Handshake } from "lucide-react";
import { MakeOfferModal } from "./MakeOfferModal";
import { useRouter } from "next/navigation";

interface MakeOfferButtonProps {
  listingId: string;
  sellerId: string;
  listingTitle: string;
  originalAskingPrice: number;
}

export function MakeOfferButton({
  listingId,
  sellerId,
  listingTitle,
  originalAskingPrice,
}: MakeOfferButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleOfferSuccess = () => {
    // Optionally redirect to chat or refresh
    router.push(`/dashboard/marketplace/chat`);
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#1A231E] hover:bg-[#202B25] text-white rounded-xl text-lg font-bold transition-all border border-white/5 shadow-sm"
      >
        <Handshake size={20} />
        Make Offer
      </button>

      <MakeOfferModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        listingId={listingId}
        sellerId={sellerId}
        listingTitle={listingTitle}
        originalAskingPrice={originalAskingPrice}
        onOfferSuccess={handleOfferSuccess}
      />
    </>
  );
}
