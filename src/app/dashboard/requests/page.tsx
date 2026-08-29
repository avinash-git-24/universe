import { getUser } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getStudentRequests } from "@/lib/database/requests";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { RequestList } from "@/components/requests/RequestList";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Requests · UniVerse",
  description: "View and manage all your delivery requests.",
};

export default async function MyRequestsPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await getUser();

  if (authError || !user) {
    redirect(ROUTES.LOGIN);
  }

  const requests = await getStudentRequests(supabase, user.id);

  return (
    <div className="min-h-screen bg-[#080b09] pt-4 sm:pt-8 pb-12 px-3 sm:px-6 text-white selection:bg-emerald-500/30">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-2">
              My Requests
              <span className="text-emerald-400 text-2xl sm:text-3xl">✦</span>
            </h1>
            <p className="text-white/60 mt-1 text-xs sm:text-sm lg:text-base">View and manage your delivery requests</p>
          </div>
          
          <div className="flex gap-3 items-center">
            <NotificationBell />
            <Link href="/dashboard/requests">
              <Button variant="secondary" size="icon" className="bg-transparent border border-white/10 hover:bg-white/5 text-white rounded-full h-10 w-10">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/request/new">
              <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg h-10 px-4 transition-colors">
                <Plus className="w-4 h-4 mr-1.5" />
                New Request
              </Button>
            </Link>
          </div>
        </div>

        <RequestList initialRequests={requests} />
        
      </div>
    </div>
  );
}
