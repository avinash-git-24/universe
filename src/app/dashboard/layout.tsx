import { ReactNode } from "react";
import { getUser } from "@/lib/supabase/queries";
import { RealtimeProvider } from "@/providers/RealtimeProvider";
import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

import { Sidebar } from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { data: { user }, error } = await getUser();

  if (error || !user) {
    redirect(ROUTES.LOGIN);
  }

  return (
    <div className="min-h-screen bg-[#050A07] flex flex-col lg:flex-row text-white relative">
      <Sidebar />
      <main className="flex-1 w-full lg:ml-[240px] min-w-0 transition-all duration-200">
        {children}
      </main>
    </div>
  );
}
