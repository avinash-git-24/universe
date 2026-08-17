import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { getResaleListingById } from "@/lib/database/resale";
import { ROUTES } from "@/constants/routes";
import { ResaleSkeleton } from "@/components/resale/ResaleSkeleton";
import { EditListingForm } from "@/components/resale/EditListingForm";

export const metadata: Metadata = {
  title: "Edit Listing · UniVerse",
  description: "Update your listing details on UniVerse Resale.",
};

export default async function EditListingPage({
  params,
}: {
  params: { id: string };
}) {
  const {
    data: { user },
    error: authError,
  } = await getUser();

  if (authError || !user) {
    redirect(ROUTES.LOGIN);
  }

  const supabase = await createClient();
  let listing;
  try {
    listing = await getResaleListingById(supabase, params.id);
  } catch (error) {
    console.error("[EditListingPage] Error fetching listing:", error);
    notFound();
  }

  if (!listing) {
    notFound();
  }

  // Security check: Only the owner can edit the listing
  if (listing.seller_id !== user.id) {
    redirect("/dashboard/marketplace/my-listings");
  }

  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", paddingTop: "2rem", paddingBottom: "4rem", paddingLeft: "2rem", paddingRight: "2rem" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <ResaleSkeleton count={1} />
        </div>
      </div>
    }>
      <EditListingForm listing={listing} />
    </Suspense>
  );
}
