"use client";

export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`p-4 border rounded-xl bg-card space-y-3 animate-pulse ${className}`}>
      <div className="flex justify-between items-center">
        <div className="h-4 bg-muted rounded w-1/3" />
        <div className="h-4 bg-muted rounded w-1/4" />
      </div>
      <div className="h-3 bg-muted/60 rounded w-3/4" />
      <div className="h-3 bg-muted/40 rounded w-1/2" />
    </div>
  );
}

export function StatsCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`p-4 border rounded-xl bg-card space-y-2 animate-pulse ${className}`}>
      <div className="flex justify-between items-center">
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="w-6 h-6 rounded-full bg-muted/60" />
      </div>
      <div className="h-6 bg-muted rounded w-1/3" />
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  className = "",
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={`border rounded-xl bg-card overflow-hidden animate-pulse ${className}`}>
      <div className="p-4 border-b bg-secondary/20 flex gap-4">
        <div className="h-4 bg-muted rounded w-1/4" />
        <div className="h-4 bg-muted rounded w-1/4" />
        <div className="h-4 bg-muted rounded w-1/4" />
        <div className="h-4 bg-muted rounded w-1/4" />
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex gap-4">
            <div className="h-4 bg-muted/60 rounded w-1/4" />
            <div className="h-4 bg-muted/50 rounded w-1/4" />
            <div className="h-4 bg-muted/40 rounded w-1/4" />
            <div className="h-4 bg-muted/30 rounded w-1/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListSkeleton({
  items = 3,
  className = "",
}: {
  items?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
