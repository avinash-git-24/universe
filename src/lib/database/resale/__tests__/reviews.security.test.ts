import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY must be provided in the test environment variables.");
}

type ResaleReviewInsert = {
  id?: string;
  listing_id: string;
  reviewer_id: string;
  reviewee_id: string;
  role: "buyer" | "seller";
  rating: number;
  comment?: string;
  created_at?: string;
};

type TestDatabase = Omit<Database, "public"> & {
  public: Omit<Database["public"], "Tables"> & {
    Tables: Database["public"]["Tables"] & {
      resale_reviews: {
        Row: ResaleReviewInsert & { id: string; created_at: string };
        Insert: ResaleReviewInsert;
        Update: Partial<ResaleReviewInsert>;
        Relationships: [];
      };
    };
  };
};

// Create an admin client to bypass RLS and set up data
const adminClient = createClient<TestDatabase>(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// User auth details
let sellerEmail: string;
const sellerPass = "password123";
let buyerEmail: string;
const buyerPass = "password123";
let randomEmail: string;
const randomPass = "password123";

let sellerClient: ReturnType<typeof createClient<TestDatabase>>;
let buyerClient: ReturnType<typeof createClient<TestDatabase>>;
let randomClient: ReturnType<typeof createClient<TestDatabase>>;

let sellerId: string;
let buyerId: string;
let randomId: string;
let listingId: string;

describe("Phase 2H - Resale Reviews Security", () => {
  beforeAll(async () => {
    const runId = Math.random().toString(36).substring(7);
    sellerEmail = `seller_rev_sec_${runId}@example.com`;
    buyerEmail = `buyer_rev_sec_${runId}@example.com`;
    randomEmail = `random_rev_sec_${runId}@example.com`;

    // 1. Create users via admin API (with retry for CI cold starts where Kong/GoTrue may return 502 initially)
    const createTestUser = async (email: string, password: string) => {
      let result;
      for (let i = 0; i < 10; i++) {
        result = await adminClient.auth.admin.createUser({ email, password, email_confirm: true });
        // Break if successful or if the error is not a transient network/gateway error
        const status = (result.error as { status?: number } | null)?.status;
        if (!result.error || (status !== 500 && status !== 502 && status !== 503 && status !== 0)) {
          break;
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
      if (result?.error || !result?.data?.user) {
        const status = (result?.error as { status?: number } | null)?.status;
        throw new Error(`Create user failed for ${email}. Status: ${status}. Message: ${result?.error?.message || JSON.stringify(result?.error)}`);
      }
      return result.data.user.id;
    };

    sellerId = await createTestUser(sellerEmail, sellerPass);
    buyerId = await createTestUser(buyerEmail, buyerPass);
    randomId = await createTestUser(randomEmail, randomPass);

    // Wait a tick for triggers to create profiles
    await new Promise((resolve) => setTimeout(resolve, 500));

    sellerClient = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0", { auth: { persistSession: false } });
    await sellerClient.auth.signInWithPassword({ email: sellerEmail, password: sellerPass });

    buyerClient = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0", { auth: { persistSession: false } });
    await buyerClient.auth.signInWithPassword({ email: buyerEmail, password: buyerPass });

    randomClient = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0", { auth: { persistSession: false } });
    await randomClient.auth.signInWithPassword({ email: randomEmail, password: randomPass });

    // 3. Create a listing directly as admin (status: sold)
    const { data: listingData, error: lError } = await adminClient
      .from("resale_listings")
      .insert({
        seller_id: sellerId,
        title: "Test Laptop",
        category: "electronics",
        condition: "good",
        price: 500,
        status: "sold", // Listing is sold
      })
      .select()
      .single();
    if (lError) console.error("Insert listing error:", lError);
    listingId = listingData!.id;


    // 4. Create the accepted offer directly as admin
    const { error: oError } = await adminClient
      .from("resale_offers")
      .insert({
        listing_id: listingId,
        buyer_id: buyerId,
        seller_id: sellerId, // For V2G strictness
        offer_price: 450,
        status: "accepted",
      });
    if (oError) console.error("Insert offer error:", oError);
  });

  afterAll(async () => {
    // Cleanup is handled by the ephemeral test database
  });

  it("should allow the verified buyer to review the seller", async () => {
    // 5. Check if buyer can read listing
    const { data: bListings } = await buyerClient.from("resale_listings").select("*").eq("id", listingId);
    console.log("Buyer can read listing:", bListings);
    
    // Check if buyer can read offer
    const { data: bOffers } = await buyerClient.from("resale_offers").select("*").eq("listing_id", listingId);
    console.log("Buyer can read offers:", bOffers);

    const { error } = await buyerClient.from("resale_reviews").insert({
      listing_id: listingId,
      reviewer_id: buyerId,
      reviewee_id: sellerId,
      role: "buyer",
      rating: 5,
      comment: "Great seller!",
    });

    if (error) console.error("Buyer review error:", error);
    expect(error).toBeNull();
  });

  it("should allow the verified seller to review the buyer", async () => {
    // 5. Check if seller can read listing
    const { data: sListings } = await sellerClient.from("resale_listings").select("*").eq("id", listingId);
    console.log("Seller can read listing:", sListings);
    
    // Check if seller can read offer
    const { data: sOffers } = await sellerClient.from("resale_offers").select("*").eq("listing_id", listingId);
    console.log("Seller can read offers:", sOffers);

    const { error } = await sellerClient.from("resale_reviews").insert({
      listing_id: listingId,
      reviewer_id: sellerId,
      reviewee_id: buyerId,
      role: "seller",
      rating: 4,
      comment: "Good buyer",
    });

    if (error) console.error("Seller review error:", error);
    expect(error).toBeNull();
  });

  it("should block a random user from reviewing the seller", async () => {
    const payload: ResaleReviewInsert = {
      listing_id: listingId,
      reviewer_id: randomId,
      reviewee_id: sellerId,
      role: "buyer",
      rating: 1,
    };
    const { error } = await randomClient.from("resale_reviews").insert(payload);

    expect(error).not.toBeNull();
    expect(error?.message).toMatch(/new row violates row-level security policy/);
  });

  it("should block the buyer from reviewing if they use the wrong role", async () => {
    const payload: ResaleReviewInsert = {
      listing_id: listingId,
      reviewer_id: buyerId,
      reviewee_id: sellerId,
      role: "seller", // Incorrect role for the buyer
      rating: 5,
    };
    const { error } = await buyerClient.from("resale_reviews").insert(payload);

    expect(error).not.toBeNull();
    expect(error?.message).toMatch(/new row violates row-level security policy/);
  });
});
