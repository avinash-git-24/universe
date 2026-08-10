import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/constants/routes";
import { getUserAnalytics } from "@/lib/database/analytics";
import { AnalyticsClientWrapper } from "@/components/analytics/AnalyticsClientWrapper";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics · UniVerse",
  description: "View your analytics and performance reports.",
};

export default async function UserAnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(ROUTES.LOGIN);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile) redirect(ROUTES.LOGIN);

  const role = profile.role as "student" | "runner";
  
  // Fetch Analytics (now fetches 90 days of data by default)
  const analytics = await getUserAnalytics(supabase, user.id, role);
  
  return (
    <AnalyticsClientWrapper 
      role={role}
      initialData={{
        requestsData: analytics.requestsData,
        assignmentsData: analytics.assignmentsData,
        transactionsData: analytics.transactionsData
      }}
    />
  );
}
