import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateRequestForm } from "@/components/request/CreateRequestForm";

export default async function NewRequestPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login?redirectTo=/request/new");
  }

  return (
    <div className="min-h-screen bg-secondary/30 pt-24 pb-12 px-4">
      <div className="max-w-xl mx-auto mb-8 text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Create Request</h1>
        <p className="text-muted-foreground">Tell us what you need and where to deliver it.</p>
      </div>
      
      <CreateRequestForm requesterId={user.id} />
    </div>
  );
}
