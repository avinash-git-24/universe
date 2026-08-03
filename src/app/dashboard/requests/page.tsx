import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getStudentRequests } from "@/lib/database/requests";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { RequestList } from "@/components/requests/RequestList";
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
    <div className="min-h-screen bg-secondary/30 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">My Requests</h1>
            <p className="text-muted-foreground mt-1">View, track, and manage your delivery history.</p>
          </div>
          
          <div className="flex gap-2">
            <Link href="/dashboard/requests">
              <Button variant="secondary" size="icon">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/request/new">
              <Button>
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
