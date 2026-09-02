import { getUser } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateRequestForm } from "@/components/request/CreateRequestForm";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { Plus, Zap } from "lucide-react";
import Link from "next/link";
import { RealtimeProvider } from "@/providers/RealtimeProvider";

export default async function NewRequestPage() {
  const { data: { user }, error } = await getUser();

  if (error || !user) {
    redirect("/login?redirectTo=/request/new");
  }

  // Ensure user profile exists in public.profiles to satisfy foreign keys
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
  if (!profile) {
    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Student";
    const enrollmentNumber =
      user.user_metadata?.enrollment_number ||
      (user.email?.includes("@") ? user.email.split("@")[0] : null);

    await supabase.from("profiles").upsert(
      {
        id: user.id,
        full_name: fullName,
        enrollment_number: enrollmentNumber,
        role: "student",
      },
      { onConflict: "id" }
    );
  }

  return (
    <div className="flex min-h-screen bg-[#050805] px-3 py-4 sm:px-6 sm:py-8 lg:p-10">
      <main className="flex-1 w-full max-w-4xl mx-auto">
        
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6 sm:mb-10">
          
          {/* Logo */}
          <Link href="/dashboard" className="no-underline">
            <div className="flex items-center gap-2">
              <div className="bg-[#00E676] rounded-md p-1 flex items-center justify-center">
                <Zap size={16} color="#050805" fill="#050805" />
              </div>
              <span className="text-white font-extrabold text-lg sm:text-xl tracking-tight">UniVerse</span>
            </div>
          </Link>

          {/* Right Actions */}
          <div className="flex gap-3 sm:gap-5 items-center">
            {/* Bell */}
            <div className="relative bg-[#0a0f0c]/40 border border-[#66ffb2]/10 p-2 sm:p-2.5 rounded-xl backdrop-blur-md">
              <NotificationBell />
            </div>
            {/* Button */}
            <Link href="/request/new" className="no-underline hidden sm:inline-block">
              <button className="flex items-center gap-2 bg-[#00E676]/15 text-[#00E676] font-bold text-xs sm:text-sm border border-[#00E676]/30 rounded-xl px-3.5 sm:px-5 py-2.5 sm:py-3 cursor-pointer">
                <Plus size={16} /> New Request
              </button>
            </Link>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-2 tracking-tight">
            Create <span className="text-[#00E676]">Request</span>
          </h1>
          <p className="text-[#A7B8B0] text-xs sm:text-sm lg:text-[0.95rem]">
            Tell us what you need and where to deliver it.
          </p>
        </div>
        
        {/* Main Form */}
        <CreateRequestForm requesterId={user.id} />
      </main>
    </div>
  );
}
