import { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { RealtimeProvider } from "@/providers/RealtimeProvider";
import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect(ROUTES.LOGIN);
  }

  return (
    <RealtimeProvider userId={user.id}>
      {children}
    </RealtimeProvider>
  );
}
