import { getUser } from "@/lib/supabase/queries";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getStudentRequestDetails } from "@/lib/database/requests";
import { ROUTES } from "@/constants/routes";
import { RequestLiveTracker } from "@/components/requests/RequestLiveTracker";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Order Tracking · UniVerse",
  description: "Real-time tracking of your campus delivery request.",
};

interface RequestPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RequestDetailsPage({ params }: RequestPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await getUser();

  if (authError || !user) {
    redirect(ROUTES.LOGIN);
  }

  const request = await getStudentRequestDetails(supabase, id, user.id);

  if (!request) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#080b09] text-white pt-4 sm:pt-8 pb-16 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/requests"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 text-xs font-semibold text-[#A7B8B0] hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#00E676]" />
            Back to My Requests
          </Link>

          <span className="text-[11px] font-mono text-emerald-400/80 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            UniVerse Runner Network
          </span>
        </div>

        <RequestLiveTracker initialRequest={request} />
      </div>
    </div>
  );
}
