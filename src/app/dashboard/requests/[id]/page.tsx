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
    <div className="relative min-h-screen bg-[#050806] text-white pt-4 sm:pt-8 pb-20 px-3 sm:px-6 overflow-hidden">
      {/* Background Cyberpunk Ambient Glows & Grid */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(0,230,118,0.18),transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#00E676_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.06]" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-[radial-gradient(ellipse_50%_50%_at_50%_100%,rgba(0,230,118,0.1),transparent)]" />

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/requests"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 hover:border-emerald-500/40 text-xs font-semibold text-[#A7B8B0] hover:text-white transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_20px_rgba(0,230,118,0.2)] active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#00E676]" />
            Back to My Requests
          </Link>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/25 shadow-[0_0_15px_rgba(0,230,118,0.15)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse" />
              CAMPUS MESH v2.4
            </span>
          </div>
        </div>

        <RequestLiveTracker initialRequest={request} />
      </div>
    </div>
  );
}
