"use client";

import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`p-10 text-center border border-dashed rounded-xl bg-card/50 flex flex-col items-center justify-center space-y-3 my-4 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-secondary/30 text-muted-foreground flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </div>

      <div className="space-y-1 max-w-sm">
        <h3 className="text-base font-bold text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>

      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction} className="mt-2 text-xs font-semibold">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
