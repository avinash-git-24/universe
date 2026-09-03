"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, MapPin, Tag, Box, Info, Star, Package, Wallet, 
  Share2, Copy, CheckCircle2, QrCode, ShieldCheck, X 
} from "lucide-react";
import type { ResaleListingWithImages } from "@/lib/database/resale/types";
import type { Profile } from "@/lib/database/profile";
import { ResaleImageGallery } from "./ResaleImageGallery";
import { ResaleListingActions } from "./ResaleListingActions";
import { ContactSellerButton } from "./ContactSellerButton";
import { FavoriteButton } from "./FavoriteButton";
import { MakeOfferButton } from "./MakeOfferButton";
import { UserRatingBadge } from "./UserRatingBadge";
import { ReviewModal } from "./ReviewModal";
import { RequestRunnerModal } from "./RequestRunnerModal";
import type { DeliveryRequest } from "@/lib/database/requests";

interface ResaleListingDetailProps {
  listing: ResaleListingWithImages;
  signedUrls: Record<string, string>;
  sellerProfile: Profile;
  currentUserId: string;
  isFavorited?: boolean;
  isAcceptedBuyer?: boolean;
  hasReviewed?: boolean;
  acceptedBuyerId?: string | null;
  linkedDeliveryRequest?: DeliveryRequest | null;
}

const CONDITION_LABELS: Record<string, string> = {
  new: "New",
  like_new: "Like New",
  good: "Good",
  fair: "Fair",
};

const CATEGORY_LABELS: Record<string, string> = {
  books: "Books",
  electronics: "Electronics",
  study_materials: "Study Materials",
  hostel: "Hostel Essentials",
  sports: "Sports & Fitness",
  furniture: "Furniture",
  clothing: "Clothing",
  gaming: "Gaming",
  other: "Other",
};

export function ResaleListingDetail({
  listing,
  signedUrls,
  sellerProfile,
  currentUserId,
  isFavorited = false,
  isAcceptedBuyer = false,
  hasReviewed = false,
  acceptedBuyerId = null,
  linkedDeliveryRequest = null,
}: ResaleListingDetailProps) {
  const isOwner = currentUserId === listing.seller_id;
  const isAvailable = listing.status === "active";
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showRunnerModal, setShowRunnerModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    if (typeof window !== "undefined") {
      const url = window.location.href;
      const text = `Hey! Check out "${listing.title}" for ${formatPrice(listing.price)} on UniVerse Campus Marketplace:\n${url}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  const getStatusBadge = () => {
    switch (listing.status) {
      case "active":
        return <span className="bg-[#00E676]/15 text-[#00E676] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-[#00E676]/30 shadow-[0_0_10px_rgba(0,230,118,0.2)]">Available</span>;
      case "reserved":
        return <span className="bg-[#F59E0B]/15 text-[#F59E0B] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-[#F59E0B]/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]">Reserved</span>;
      case "sold":
        return <span className="bg-white/10 text-white/70 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/20">Sold</span>;
      case "removed":
        return <span className="bg-red-500/15 text-red-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-red-500/30">Removed</span>;
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto text-white">
      {/* Back Link */}
      <div className="mb-6 md:mb-8">
        <Link 
          href="/dashboard/marketplace"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#A7B8B0] hover:text-white transition-all px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1 text-emerald-400" />
          <span>Back to Marketplace</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 lg:gap-14">
        {/* Left Column: Gallery */}
        <div className="w-full">
          <ResaleImageGallery 
            title={listing.title} 
            images={listing.images} 
            signedUrls={signedUrls} 
            isOwner={isOwner}
            listingId={listing.id}
          />
        </div>

        {/* Right Column: Info & Actions */}
        <div className="flex flex-col">
          {/* Header & Price */}
          <div className="mb-5 sm:mb-6">
            <div className="flex items-center gap-3 mb-3">
              {getStatusBadge()}
              <span className="text-white/40 text-xs sm:text-sm">
                Posted {new Date(listing.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
              </span>
            </div>
            
            <div className="flex items-start justify-between gap-3 mb-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight">
                {listing.title}
              </h1>
              {!isOwner && isAvailable && (
                <div className="shrink-0 mt-1">
                  <FavoriteButton listingId={listing.id} initialIsFavorited={isFavorited} size={22} />
                </div>
              )}
            </div>
            
            {/* Price & Savings Pill */}
            <div className="flex flex-wrap items-baseline gap-3 mb-2">
              <span className="text-3xl sm:text-4xl font-black text-[#00E676] tracking-tight">{formatPrice(listing.price)}</span>
              {listing.original_price && listing.original_price > listing.price && (
                <>
                  <span className="text-lg sm:text-xl text-white/40 line-through">
                    {formatPrice(listing.original_price)}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {Math.round(((listing.original_price - listing.price) / listing.original_price) * 100)}% OFF
                  </span>
                </>
              )}
              {listing.negotiable ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  ⚡ Negotiable
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-white/60 border border-white/10">
                  🔒 Firm Price
                </span>
              )}
            </div>
            
            {listing.original_price && listing.original_price > listing.price && (
              <p className="text-xs sm:text-sm font-semibold text-[#00E676]/90 m-0">
                You save {formatPrice(listing.original_price - listing.price)}!
              </p>
            )}

            {/* Viral Campus Share Bar */}
            <div className="flex flex-wrap items-center gap-2 py-3 border-y border-white/10 my-4">
              <span className="text-xs text-white/40 font-medium mr-1">Share:</span>
              
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                title="Share on WhatsApp batch group"
              >
                <Share2 size={13} />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-semibold transition-all cursor-pointer active:scale-95"
                title="Copy listing link"
              >
                {copied ? (
                  <>
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-semibold transition-all cursor-pointer active:scale-95"
                title="Show QR Code for hostel friends"
              >
                <QrCode size={13} className="text-emerald-400" />
                <span>QR Code</span>
              </button>
            </div>
          </div>

          {/* Quick Details Grid */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#0c1410]/70 border border-white/10 backdrop-blur-md mb-6 shadow-sm">
            <div className="p-2.5 rounded-xl bg-white/[0.02]">
              <p className="text-white/40 text-[11px] font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Box size={13} className="text-emerald-400" /> Condition
              </p>
              <p className="text-white font-medium text-sm m-0">{CONDITION_LABELS[listing.condition] || listing.condition}</p>
            </div>
            
            <div className="p-2.5 rounded-xl bg-white/[0.02]">
              <p className="text-white/40 text-[11px] font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Tag size={13} className="text-emerald-400" /> Category
              </p>
              <p className="text-white font-medium text-sm m-0">{CATEGORY_LABELS[listing.category] || listing.category}</p>
            </div>
            
            <div className="p-2.5 rounded-xl bg-white/[0.02]">
              <p className="text-white/40 text-[11px] font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Info size={13} className="text-emerald-400" /> Negotiable
              </p>
              <p className="text-white font-medium text-sm m-0">{listing.negotiable ? "Yes" : "Firm Price"}</p>
            </div>
            
            <div className="p-2.5 rounded-xl bg-white/[0.02]">
              <p className="text-white/40 text-[11px] font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <MapPin size={13} className="text-emerald-400" /> Location
              </p>
              <p className="text-white font-medium text-sm truncate m-0" title={listing.pickup_location || "On Campus"}>
                {listing.pickup_location || "On Campus"}
              </p>
            </div>
          </div>

          {/* Campus Handover & Safety Card */}
          <div className="p-4 rounded-2xl bg-[#0c1410]/80 border border-emerald-500/20 backdrop-blur-md mb-6 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-2">
              <ShieldCheck size={16} />
              <span>Campus Handover & Zero Fees</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-white/70">
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">📍</span>
                <span>Meet at <strong>Library, Canteen, or Hostel Lounge</strong>.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">🤝</span>
                <span>Physical inspection before payment.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">⚡</span>
                <span>Direct UPI / Cash — <strong>100% Zero Fees</strong>!</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">🏃</span>
                <span>Busy? Request a verified Campus Runner!</span>
              </div>
            </div>
          </div>

          {/* Actions & Delivery Tracker */}
          <div className="mt-auto pt-2 space-y-4">
            {isOwner ? (
              <ResaleListingActions listing={listing} />
            ) : isAvailable ? (
              <div className="flex gap-3">
                <ContactSellerButton listingId={listing.id} />
                {listing.negotiable && (
                  <MakeOfferButton
                    listingId={listing.id}
                    sellerId={listing.seller_id}
                    listingTitle={listing.title}
                    originalAskingPrice={listing.price}
                  />
                )}
              </div>
            ) : (
              <div className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-white/5 text-white/40 border border-white/10 font-bold text-lg cursor-not-allowed">
                <Box size={20} />
                {listing.status === "reserved" ? "Currently Reserved" : "No Longer Available"}
              </div>
            )}

            {/* Delivery Integration */}
            {(listing.status === "reserved" || listing.status === "sold") && (
              <>
                {linkedDeliveryRequest ? (
                  <div className="w-full bg-[#00E676]/10 border border-[#00E676]/20 rounded-xl p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-[#00E676] font-bold">
                      <Package size={18} />
                      Runner Delivery Requested
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-white/80 text-sm">
                        Status: <span className="font-semibold text-white capitalize">{linkedDeliveryRequest.status.replace('_', ' ')}</span>
                      </p>
                      <span className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 bg-white/10 rounded-md border border-white/10 text-white/80">
                        <Wallet size={12} className="text-[#00E676]" /> 
                        Funds in Escrow
                      </span>
                    </div>
                    {isOwner && linkedDeliveryRequest.status === "accepted" && (
                      <p className="text-sm text-[#00E676]/80 mt-1">
                        A runner is on their way to pick this up from you!
                      </p>
                    )}
                  </div>
                ) : (
                  isAcceptedBuyer && listing.status === "reserved" && (
                    <button
                      onClick={() => setShowRunnerModal(true)}
                      className="w-full flex flex-col items-center justify-center gap-1 py-4 px-6 rounded-xl bg-gradient-to-r from-[#00E676]/20 to-[#00BFA5]/20 hover:from-[#00E676]/30 hover:to-[#00BFA5]/30 text-white border border-[#00E676]/30 transition-all group"
                    >
                      <div className="flex items-center gap-2 font-bold text-lg text-[#00E676] group-hover:scale-105 transition-transform">
                        <Package size={20} />
                        Request Runner Delivery
                      </div>
                      <p className="text-sm text-white/60">Don&apos;t want to walk? Let a campus runner deliver it to you.</p>
                    </button>
                  )
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Description Card */}
      <div className="mt-14 pt-10 border-t border-white/10">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>Description</span>
        </h2>
        <div className="p-6 rounded-2xl bg-[#0c1410]/70 border border-white/10 backdrop-blur-md shadow-sm">
          <div className="prose prose-invert max-w-none text-[#A7B8B0] leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
            {listing.description ? listing.description : (
              <p className="italic text-white/30 m-0">No description provided.</p>
            )}
          </div>
        </div>
      </div>

      {/* Seller Info */}
      <div className="mt-12 pt-10 border-t border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-6 mb-6">
          <h2 className="text-xl font-bold text-white">Seller Information</h2>
          {listing.status === "sold" && !hasReviewed && (
            <>
              {isAcceptedBuyer && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20 rounded-xl text-sm font-semibold hover:bg-[#00E676]/20 transition-colors cursor-pointer"
                >
                  <Star size={16} />
                  Leave a Review for Seller
                </button>
              )}
              {isOwner && acceptedBuyerId && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20 rounded-xl text-sm font-semibold hover:bg-[#00E676]/20 transition-colors cursor-pointer"
                >
                  <Star size={16} />
                  Leave a Review for Buyer
                </button>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-4 bg-[#0c1410]/80 p-6 rounded-2xl border border-white/10 backdrop-blur-md w-full md:w-fit min-w-[320px] shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00E676] to-[#00BFA5] flex items-center justify-center text-black font-extrabold text-xl shrink-0 shadow-[0_0_15px_rgba(0,230,118,0.3)]">
            {sellerProfile.full_name?.charAt(0).toUpperCase() || "?"}
          </div>
          <div>
            <h3 className="text-base font-bold text-white mb-1">{sellerProfile.full_name || "Unknown Seller"}</h3>
            <UserRatingBadge userId={listing.seller_id} className="mb-1.5" />
            {sellerProfile.enrollment_number && (
              <p className="text-xs text-[#00E676] font-semibold flex items-center gap-1.5 mt-1 pt-1 border-t border-white/10 m-0">
                <span>🎓 Verified Campus Student</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="bg-[#0c1410] border border-emerald-500/30 rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="font-bold text-white text-sm flex items-center gap-2 m-0">
                <QrCode size={16} className="text-emerald-400" />
                <span>Campus QR Code</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <p className="text-xs text-white/60 m-0">
              Ask your friend or hostel mate to scan this QR code with their phone camera to open this listing directly!
            </p>

            <div className="p-3 bg-white rounded-2xl inline-block shadow-lg mx-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                alt="Campus Listing QR Code"
                className="w-40 h-40 block"
              />
            </div>

            <div className="text-xs font-semibold text-emerald-400 m-0">
              {listing.title} · {formatPrice(listing.price)}
            </div>
          </div>
        </div>
      )}

      {showReviewModal && (
        <ReviewModal
          listingId={listing.id}
          revieweeId={isOwner ? acceptedBuyerId! : listing.seller_id}
          role={isOwner ? "seller" : "buyer"}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}

      {showRunnerModal && (
        <RequestRunnerModal
          listing={listing}
          onClose={() => setShowRunnerModal(false)}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

