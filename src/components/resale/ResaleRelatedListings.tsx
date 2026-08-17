import { ResaleListingCard } from "./ResaleListingCard";
import type { ResaleListingWithImages } from "@/lib/database/resale/types";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ResaleRelatedListingsProps {
  listings: ResaleListingWithImages[];
  signedUrls: Record<string, string>;
  sellerName: string;
}

export function ResaleRelatedListings({ listings, signedUrls, sellerName }: ResaleRelatedListingsProps) {
  if (!listings || listings.length === 0) {
    return null; // Don't show an empty section
  }

  return (
    <div className="mt-16 pt-12 border-t border-white/10">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-white">More from {sellerName}</h2>
        <Link 
          href={`/dashboard/marketplace?search=${encodeURIComponent(sellerName)}`}
          className="text-sm font-medium text-[#00E676] hover:text-[#00E676]/80 flex items-center gap-1 transition-colors"
        >
          View all <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {listings.map((listing) => {
          const primaryImage = listing.images.length > 0
            ? listing.images.reduce((prev, curr) => (curr.display_order < prev.display_order ? curr : prev))
            : null;
          const primaryUrl = primaryImage && signedUrls[primaryImage.storage_path] 
            ? signedUrls[primaryImage.storage_path] 
            : null;

          return (
            <ResaleListingCard
              key={listing.id}
              listing={listing}
              primaryImageUrl={primaryUrl}
            />
          );
        })}
      </div>
    </div>
  );
}
