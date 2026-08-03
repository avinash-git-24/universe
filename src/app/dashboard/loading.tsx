import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-secondary/30 pt-24 pb-12 px-4 flex flex-col items-center justify-center">
      <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
      <h2 className="text-xl font-bold tracking-tight text-foreground">Loading Dashboard...</h2>
      <p className="text-muted-foreground mt-2">Fetching your requests and profile</p>
    </div>
  );
}
