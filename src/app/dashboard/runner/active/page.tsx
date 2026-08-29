import { getUser } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveRunnerAssignment } from "@/lib/database/requests";
import { ActiveDeliveryClient } from "@/components/runner/ActiveDeliveryClient";

export default async function ActiveDeliveryPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await getUser();

  if (error || !user) {
    redirect("/login?redirectTo=/dashboard/runner/active");
  }

  const activeAssignment = await getActiveRunnerAssignment(supabase, user.id);
  
  if (!activeAssignment) {
    // If no active assignment, bounce back to the main runner dashboard
    redirect("/dashboard/runner");
  }

  return (
    <div className="min-h-screen bg-[#080b09] text-white pt-4 sm:pt-8 pb-12 px-3 sm:px-6">
      <ActiveDeliveryClient initialAssignment={activeAssignment} />
    </div>
  );
}
