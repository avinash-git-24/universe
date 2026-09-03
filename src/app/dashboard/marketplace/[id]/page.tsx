import type { Metadata } from "next";
import { getUser } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/constants/routes";
import { 
  getResaleListingById, 
  LISTING_WITH_IMAGES_COLUMNS
} from "@/lib/database/resale/listings";
import type { ResaleListingWithImages } from "@/lib/database/resale/types";
import { getSignedImageUrls } from "@/lib/database/resale/images";
import { getProfile } from "@/lib/database/profile";
import { ResaleListingDetail } from "@/components/resale/ResaleListingDetail";
import { ResaleDetailError } from "@/components/resale/ResaleDetailError";
import { ResaleRelatedListings } from "@/components/resale/ResaleRelatedListings";
import { Suspense } from "react";
import { ResaleDetailSkeleton } from "@/components/resale/ResaleDetailSkeleton";

export const metadata: Metadata = {
  title: "Listing · UniVerse Resale",
  description: "View item details on UniVerse Resale.",
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  if (!UUID_REGEX.test(id)) {
    return <ResaleDetailError />;
  }

  return (
    <Suspense fallback={<ResaleDetailSkeleton />}>
      <ListingContent id={id} />
    </Suspense>
  );
}

async function ListingContent({ id }: { id: string }) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await getUser();

  if (authError || !user) {
    redirect(ROUTES.LOGIN);
  }

  // Fetch listing
  let listing;
  try {
    listing = await getResaleListingById(supabase, id);
  } catch (error) {
    // If unauthorized or database error, show error page
    return <ResaleDetailError />;
  }

  if (!listing) {
    return <ResaleDetailError />;
  }

  // Fallback: If PostgREST didn't populate listing.images, fetch directly from resale_listing_images
  if (!listing.images || listing.images.length === 0) {
    try {
      const { data: directImages } = await supabase
        .from("resale_listing_images")
        .select("id, listing_id, storage_path, display_order, created_at")
        .eq("listing_id", listing.id)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (directImages && directImages.length > 0) {
        listing = {
          ...listing,
          images: directImages,
        };
      }
    } catch (err) {
      console.error("[ListingDetailPage] Direct image query fallback error:", err);
    }
  }

  // Check if favorited
  let isFavorited = false;
  try {
    const { data } = await supabase
      .from("resale_favorites")
      .select("id")
      .eq("listing_id", listing.id)
      .eq("user_id", user.id)
      .single();
    if (data) isFavorited = true;
  } catch {}

  // Check if current user is the accepted buyer, or if they are the seller, get the accepted buyer
  let isAcceptedBuyer = false;
  let hasReviewed = false;
  let acceptedBuyerId: string | null = null;

  try {
    if (listing.status === "sold" || listing.status === "reserved") {
      const { data } = await supabase
        .from("resale_offers")
        .select("buyer_id")
        .eq("listing_id", listing.id)
        .eq("status", "accepted")
        .single();
        
      if (data) {
        if (data.buyer_id === user.id) {
          isAcceptedBuyer = true;
        }
        
        if (listing.seller_id === user.id) {
          acceptedBuyerId = data.buyer_id;
        }
        
        // Check for reviews if sold
        if (listing.status === "sold" && (isAcceptedBuyer || listing.seller_id === user.id)) {
          const { data: review } = await supabase
            .from("resale_reviews")
            .select("id")
            .eq("listing_id", listing.id)
            .eq("reviewer_id", user.id)
            .single();
            
          if (review) hasReviewed = true;
        }
      }
    }
  } catch {}

  // Fetch linked delivery request if reserved or sold
  let linkedDeliveryRequest = null;
  if (listing.status === "sold" || listing.status === "reserved") {
    try {
      const { data: request } = await supabase
        .from("delivery_requests")
        .select("*")
        .eq("linked_listing_id", listing.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
        
      if (request) {
        linkedDeliveryRequest = request;
      }
    } catch {}
  }

  // Fetch signed URLs using the existing service
  const signedUrlsArray = listing.images.length > 0 
    ? await getSignedImageUrls(supabase, listing.images)
    : [];
  const signedUrls = signedUrlsArray.reduce((acc, curr) => {
    acc[curr.storagePath] = curr.signedUrl;
    return acc;
  }, {} as Record<string, string>);

  // Fetch seller profile
  const sellerProfile = await getProfile(supabase, listing.seller_id);
  
  if (!sellerProfile) {
    // Highly unlikely due to FK constraints, but handle gracefully
    return <ResaleDetailError />;
  }

  // Fetch related active listings: first from same seller, fallback to same category or trending campus items
  let relatedTitle = `More from ${sellerProfile.full_name || "Seller"}`;
  const { data: rawOtherListings } = await supabase
    .from("resale_listings")
    .select(LISTING_WITH_IMAGES_COLUMNS)
    .eq("seller_id", listing.seller_id)
    .eq("status", "active")
    .neq("id", listing.id)
    .order("created_at", { ascending: false })
    .limit(4);

  let finalOtherListings = rawOtherListings || [];

  if (finalOtherListings.length === 0) {
    const { data: catListings } = await supabase
      .from("resale_listings")
      .select(LISTING_WITH_IMAGES_COLUMNS)
      .eq("category", listing.category)
      .eq("status", "active")
      .neq("id", listing.id)
      .order("created_at", { ascending: false })
      .limit(4);

    if (catListings && catListings.length > 0) {
      finalOtherListings = catListings;
      const formattedCategory = listing.category.charAt(0).toUpperCase() + listing.category.slice(1).replace('_', ' ');
      relatedTitle = `More in ${formattedCategory}`;
    } else {
      const { data: recentListings } = await supabase
        .from("resale_listings")
        .select(LISTING_WITH_IMAGES_COLUMNS)
        .eq("status", "active")
        .neq("id", listing.id)
        .order("created_at", { ascending: false })
        .limit(4);

      if (recentListings && recentListings.length > 0) {
        finalOtherListings = recentListings;
        relatedTitle = "Similar Campus Deals";
      }
    }
  }

  const filteredOtherListings = finalOtherListings as unknown as ResaleListingWithImages[];

  // Sign URLs for related listings
  const relatedImages = filteredOtherListings.flatMap((l) => l.images);
  const relatedSignedUrlsArray = relatedImages.length > 0 
    ? await getSignedImageUrls(supabase, relatedImages) 
    : [];
  const relatedSignedUrls = relatedSignedUrlsArray.reduce((acc, curr) => {
    acc[curr.storagePath] = curr.signedUrl;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#060a08] relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-radial from-emerald-500/10 via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-10 w-[500px] h-[500px] rounded-full bg-radial from-teal-500/10 via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="relative pt-4 sm:pt-8 pb-16 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <ResaleListingDetail 
          listing={listing} 
          signedUrls={signedUrls} 
          sellerProfile={sellerProfile} 
          currentUserId={user.id} 
          isFavorited={isFavorited}
          isAcceptedBuyer={isAcceptedBuyer}
          hasReviewed={hasReviewed}
          acceptedBuyerId={acceptedBuyerId}
        />
        <ResaleRelatedListings 
          listings={filteredOtherListings} 
          signedUrls={relatedSignedUrls} 
          sellerName={sellerProfile.full_name || "Seller"} 
          title={relatedTitle}
        />
      </div>
    </div>
  );
}
