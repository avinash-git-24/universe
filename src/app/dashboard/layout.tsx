import { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { RealtimeProvider } from "@/providers/RealtimeProvider";
import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

import { Sidebar } from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect(ROUTES.LOGIN);
  }

  return (
    <RealtimeProvider userId={user.id}>
      <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#050A07" }}>
        <Sidebar />
        <main style={{ flex: 1, marginLeft: "240px", width: "100%" }}>
          {children}
        </main>
      </div>
    </RealtimeProvider>
  );
}
