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
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(ROUTES.LOGIN);
  }

  const requests = await getStudentRequests(supabase, user.id);

  return (
    <div className="min-h-screen bg-[#0a0f0d] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/10 via-[#0a0f0d] to-[#0a0f0d] pt-24 pb-12 px-4 text-white selection:bg-emerald-500/30">
      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">My Requests</h1>
            <p className="text-white/60 mt-2 text-lg">View and manage your delivery requests <span className="text-emerald-400">✦</span></p>
          </div>
          
          <div className="flex gap-2 items-center">
            <NotificationBell />
            <Link href="/dashboard/requests">
              <Button variant="secondary" size="icon" className="bg-white/5 border border-white/10 hover:bg-white/10 text-white">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/request/new">
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(5,150,105,0.2)] border border-emerald-500/50 transition-all duration-300">
                <Plus className="w-4 h-4 mr-2" />
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
