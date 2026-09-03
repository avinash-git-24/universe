"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Tag, Box, Info, Star, Package, Wallet } from "lucide-react";
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
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = () => {
    switch (listing.status) {
      case "active":
        return <span className="bg-[#00E676]/10 text-[#00E676] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border border-[#00E676]/20">Available</span>;
      case "reserved":
        return <span className="bg-[#F59E0B]/10 text-[#F59E0B] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border border-[#F59E0B]/20">Reserved</span>;
      case "sold":
        return <span className="bg-white/10 text-white/70 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border border-white/20">Sold</span>;
      case "removed":
        return <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border border-red-500/20">Removed</span>;
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Back Link */}
      <div className="mb-6 md:mb-8">
        <Link 
          href="/dashboard/marketplace"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#A7B8B0] hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Marketplace
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
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-3">
              {getStatusBadge()}
              <span className="text-white/40 text-xs sm:text-sm">
                Posted {new Date(listing.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
              </span>
            </div>
            <div className="flex items-start justify-between gap-3 mb-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                {listing.title}
              </h1>
              {!isOwner && isAvailable && (
                <div className="shrink-0 mt-1">
                  <FavoriteButton listingId={listing.id} initialIsFavorited={isFavorited} size={22} />
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap items-baseline gap-3 mb-2">
              <span className="text-3xl sm:text-4xl font-black text-[#00E676]">{formatPrice(listing.price)}</span>
              {listing.original_price && listing.original_price > listing.price && (
                <span className="text-lg sm:text-xl text-[#A7B8B0] line-through">
                  {formatPrice(listing.original_price)}
                </span>
              )}
            </div>
            
            {listing.original_price && listing.original_price > listing.price && (
              <p className="text-xs sm:text-sm font-medium text-[#00E676]/80">
                You save {formatPrice(listing.original_price - listing.price)}!
              </p>
            )}
          </div>

          <hr className="border-white/5 mb-8" />

          {/* Quick Details Grid */}
          <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-10">
            <div>
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Box size={14} /> Condition
              </p>
              <p className="text-white font-medium">{CONDITION_LABELS[listing.condition]}</p>
            </div>
            
            <div>
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Tag size={14} /> Category
              </p>
              <p className="text-white font-medium">{CATEGORY_LABELS[listing.category] || listing.category}</p>
            </div>
            
            <div>
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Info size={14} /> Negotiable
              </p>
              <p className="text-white font-medium">{listing.negotiable ? "Yes" : "Firm Price"}</p>
            </div>
            
            {listing.pickup_location && (
              <div>
                <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <MapPin size={14} /> Location
                </p>
                <p className="text-white font-medium truncate" title={listing.pickup_location}>
                  {listing.pickup_location}
                </p>
              </div>
            )}
          </div>

          {/* Actions & Delivery Tracker */}
          <div className="mt-auto pt-4 space-y-4">
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

      {/* Description */}
      <div className="mt-16 pt-12 border-t border-white/10">
        <h2 className="text-xl font-bold text-white mb-6">Description</h2>
        <div className="prose prose-invert max-w-none text-[#A7B8B0] leading-relaxed whitespace-pre-wrap">
          {listing.description ? listing.description : (
            <p className="italic text-white/30">No description provided.</p>
          )}
        </div>
      </div>

      {/* Seller Info */}
      <div className="mt-16 pt-12 border-t border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-6 mb-6">
          <h2 className="text-xl font-bold text-white">Seller Information</h2>
          {listing.status === "sold" && !hasReviewed && (
            <>
              {isAcceptedBuyer && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20 rounded-xl text-sm font-semibold hover:bg-[#00E676]/20 transition-colors"
                >
                  <Star size={16} />
                  Leave a Review for Seller
                </button>
              )}
              {isOwner && acceptedBuyerId && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20 rounded-xl text-sm font-semibold hover:bg-[#00E676]/20 transition-colors"
                >
                  <Star size={16} />
                  Leave a Review for Buyer
                </button>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-4 bg-white/5 p-6 rounded-2xl border border-white/10 w-full md:w-fit min-w-[300px]">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00E676] to-[#00BFA5] flex items-center justify-center text-black font-bold text-xl shrink-0">
            {sellerProfile.full_name?.charAt(0).toUpperCase() || "?"}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">{sellerProfile.full_name || "Unknown Seller"}</h3>
            <UserRatingBadge userId={listing.seller_id} className="mb-2" />
            {sellerProfile.enrollment_number && (
              <p className="text-sm text-[#00E676] font-medium flex items-center gap-1.5 mt-1 pt-1 border-t border-white/5">
                Verified Student
              </p>
            )}
          </div>
        </div>
      </div>

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
