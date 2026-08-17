import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";
import { sendMessage, getOrCreateMarketplaceConversation } from "../chat";

export type ResaleOffer = Database["public"]["Tables"]["resale_offers"]["Row"];

/**
 * Creates a new offer for a listing.
 * This also sends an automated system message into the chat.
 */
export async function createOffer(
  supabase: SupabaseClient<Database>,
  listingId: string,
  sellerId: string,
  offerPrice: number
): Promise<ResaleOffer | null> {
  const { data: userResponse, error: authError } = await supabase.auth.getUser();
  if (authError || !userResponse.user) {
    throw new Error("UNAUTHENTICATED");
  }

  const buyerId = userResponse.user.id;

  if (buyerId === sellerId) {
    throw new Error("Cannot make an offer on your own listing.");
  }

  // 1. Verify listing is active
  const { data: listing, error: listingError } = await supabase
    .from("resale_listings")
    .select("status")
    .eq("id", listingId)
    .single();

  if (listingError || !listing) {
    throw new Error("Listing not found.");
  }
  if (listing.status !== "active") {
    throw new Error(`Cannot make an offer on a listing that is ${listing.status}.`);
  }

  // 2. Insert the offer
  const { data: offer, error: insertError } = await supabase
    .from("resale_offers")
    .insert({
      listing_id: listingId,
      buyer_id: buyerId,
      seller_id: sellerId,
      offer_price: offerPrice,
      status: "pending",
    })
    .select("*")
    .single();

  if (insertError) {
    console.error("Failed to create offer:", insertError);
    // If uniqueness constraint triggered:
    if (insertError.code === "23505") {
      throw new Error("You already have a pending offer for this item.");
    }
    throw new Error("Failed to submit offer.");
  }

  // 2. Create or get conversation
  const convId = await getOrCreateMarketplaceConversation(
    supabase,
    buyerId,
    sellerId,
    listingId
  );

  // 3. Send system message so the offer appears in chat
  if (convId) {
    await sendMessage(
      supabase,
      convId,
      buyerId, // The buyer sends the offer message
      `Made an offer of ₹${offerPrice}`,
      null,
      "offer",
      { offer_id: offer.id, type: "created", offer_price: offerPrice }
    );
  }

  return offer;
}

/**
 * Accepts an offer. Only the seller can do this.
 */
export async function acceptOffer(
  supabase: SupabaseClient<Database>,
  offer: ResaleOffer,
  conversationId: string
): Promise<void> {
  const { data: userResponse } = await supabase.auth.getUser();
  if (!userResponse.user) throw new Error("UNAUTHENTICATED");

  // Update offer to accepted. The DB trigger will auto-reject others and reserve listing.
  const { data: updatedOffer, error } = await supabase
    .from("resale_offers")
    .update({ status: "accepted" })
    .eq("id", offer.id)
    .eq("status", "pending")
    .eq("seller_id", userResponse.user.id)
    .select("*")
    .single();

  if (error || !updatedOffer) {
    console.error("Failed to accept offer:", error);
    throw new Error("Failed to accept offer. It may have been withdrawn.");
  }

  // Send system message
  await sendMessage(
    supabase,
    conversationId,
    userResponse.user.id,
    `Accepted offer of ₹${updatedOffer.offer_price}`,
    null,
    "offer",
    { offer_id: updatedOffer.id, type: "accepted", offer_price: updatedOffer.offer_price }
  );
}

/**
 * Rejects an offer. Only the seller can do this.
 */
export async function rejectOffer(
  supabase: SupabaseClient<Database>,
  offer: ResaleOffer,
  conversationId: string
): Promise<void> {
  const { data: userResponse } = await supabase.auth.getUser();
  if (!userResponse.user) throw new Error("UNAUTHENTICATED");

  const { data: updatedOffer, error } = await supabase
    .from("resale_offers")
    .update({ status: "rejected" })
    .eq("id", offer.id)
    .eq("status", "pending")
    .eq("seller_id", userResponse.user.id)
    .select("*")
    .single();

  if (error || !updatedOffer) {
    throw new Error("Failed to reject offer.");
  }

  await sendMessage(
    supabase,
    conversationId,
    userResponse.user.id,
    `Rejected offer of ₹${updatedOffer.offer_price}`,
    null,
    "offer",
    { offer_id: updatedOffer.id, type: "rejected", offer_price: updatedOffer.offer_price }
  );
}

/**
 * Withdraws an offer. Only the buyer can do this.
 */
export async function withdrawOffer(
  supabase: SupabaseClient<Database>,
  offer: ResaleOffer,
  conversationId: string
): Promise<void> {
  const { data: userResponse } = await supabase.auth.getUser();
  if (!userResponse.user) throw new Error("UNAUTHENTICATED");

  const { data: updatedOffer, error } = await supabase
    .from("resale_offers")
    .update({ status: "withdrawn" })
    .eq("id", offer.id)
    .eq("status", "pending")
    .eq("buyer_id", userResponse.user.id)
    .select("*")
    .single();

  if (error || !updatedOffer) {
    throw new Error("Failed to withdraw offer.");
  }

  await sendMessage(
    supabase,
    conversationId,
    userResponse.user.id,
    `Withdrew offer of ₹${updatedOffer.offer_price}`,
    null,
    "offer",
    { offer_id: updatedOffer.id, type: "withdrawn", offer_price: updatedOffer.offer_price }
  );
}

/**
 * Fetches an offer by ID.
 */
export async function getOfferById(
  supabase: SupabaseClient<Database>,
  offerId: string
): Promise<ResaleOffer | null> {
  const { data, error } = await supabase
    .from("resale_offers")
    .select("*")
    .eq("id", offerId)
    .single();

  if (error) return null;
  return data;
}
