import { getUser } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/constants/routes";
import { AdminAnalyticsClient } from "@/components/analytics/AdminAnalyticsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics · Admin",
};

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await getUser();

  if (!user) redirect(ROUTES.LOGIN);

  const [profilesRes, requestsRes, assignmentsRes, transactionsRes] = await Promise.all([
    supabase.from("profiles").select("*"),
    supabase.from("delivery_requests").select("*"),
    supabase.from("delivery_assignments").select("*"),
    supabase.from("transactions").select("*").eq("type", "payment"),
  ]);

  return (
    <AdminAnalyticsClient
      initialProfiles={profilesRes.data || []}
      initialRequests={requestsRes.data || []}
      initialAssignments={assignmentsRes.data || []}
      initialTransactions={transactionsRes.data || []}
    />
  );
}
