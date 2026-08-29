import { getUser } from "@/lib/supabase/queries";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getStudentRequestDetails } from "@/lib/database/requests";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { RequestDetails } from "@/components/requests/RequestDetails";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request Details · UniVerse",
  description: "View the details of your delivery request.",
};

interface RequestPageProps {
  params: {
    id: string;
  };
}

export default async function RequestDetailsPage({ params }: RequestPageProps) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await getUser();

  if (authError || !user) {
    redirect(ROUTES.LOGIN);
  }

  const request = await getStudentRequestDetails(supabase, params.id, user.id);

  if (!request) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#080b09] text-white pt-4 sm:pt-8 pb-12 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex items-center">
          <Link href="/dashboard/requests">
            <Button variant="ghost" size="sm" className="px-0 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Requests
            </Button>
          </Link>
        </div>

        <RequestDetails request={request} />

      </div>
    </div>
  );
}
