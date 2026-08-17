"use server";

import { createClient } from "@/lib/supabase/server";
import { getOrCreateMarketplaceConversation } from "@/lib/database/chat";

export async function contactSellerAction(listingId: string) {
  try {
    const supabase = await createClient();
    
    // 1. Authenticate current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("UNAUTHENTICATED");
    }

    // 2. Load the listing
    const { data: listing, error: listingError } = await supabase
      .from("resale_listings")
      .select("id, seller_id, status")
      .eq("id", listingId)
      .single();

    if (listingError || !listing) {
      throw new Error("NOT_FOUND");
    }

    // 3. Verify listing status allows contact
    if (listing.status !== "active" && listing.status !== "reserved") {
      throw new Error("INVALID_STATUS");
    }

    // 4. Verify current user != seller_id
    if (user.id === listing.seller_id) {
      throw new Error("CANNOT_CONTACT_SELF");
    }

    // 5. Find/create the unique marketplace conversation
    const conversationId = await getOrCreateMarketplaceConversation(
      supabase,
      user.id, // we still pass it for TS compatibility unless we change the signature
      listing.seller_id,
      listing.id
    );

    if (!conversationId) {
      throw new Error("INTERNAL_ERROR");
    }

    return { success: true, conversationId };
  } catch (error) {
    console.error("contactSellerAction failed:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "UNKNOWN_ERROR" 
    };
  }
}
