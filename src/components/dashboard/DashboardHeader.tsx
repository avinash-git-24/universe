interface DashboardHeaderProps {
  displayName: string;
}

export function DashboardHeader({ displayName }: DashboardHeaderProps) {
  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Welcome, {displayName}!</h1>
      <p className="text-muted-foreground mt-1">Here is what&apos;s happening with your deliveries.</p>
    </div>
  );
}
