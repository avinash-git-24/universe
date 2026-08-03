import { NotificationBell } from "@/components/notifications/NotificationBell";

interface DashboardHeaderProps {
  displayName: string;
}

export function DashboardHeader({ displayName }: DashboardHeaderProps) {
  return (
    <div className="flex justify-between items-start sm:items-center">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Welcome, {displayName}!</h1>
        <p className="text-muted-foreground mt-1">Here is what&apos;s happening with your deliveries.</p>
      </div>
      <div className="mt-2 sm:mt-0">
        <NotificationBell />
      </div>
    </div>
  );
}
