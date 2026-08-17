import type { Metadata } from "next";
import { getUser } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { SellForm } from "@/components/resale/SellForm";

export const metadata: Metadata = {
  title: "Sell an Item · UniVerse Resale",
  description: "List your second-hand items for fellow students on UniVerse Resale. Turn things you no longer need into value.",
};

/**
 * /dashboard/marketplace/sell — Phase 2B
 *
 * Server Component: validates auth server-side, then renders the SellForm
 * client component. Auth is re-validated inside each service function
 * (defence-in-depth) — seller_id is NEVER accepted from the client.
 */
export default async function SellPage() {
  const {
    data: { user },
    error: authError,
  } = await getUser();

  if (authError || !user) {
    redirect(ROUTES.LOGIN);
  }

  return <SellForm />;
}
