import { ReactNode } from "react";

interface DashboardGridProps {
  leftColumn: ReactNode;
  rightColumn: ReactNode;
}

export function DashboardGrid({ leftColumn, rightColumn }: DashboardGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-8 space-y-8">
        {leftColumn}
      </div>
      <div className="lg:col-span-4 space-y-8">
        {rightColumn}
      </div>
    </div>
  );
}
