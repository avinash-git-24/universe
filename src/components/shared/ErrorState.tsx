"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ErrorStateProps {
  title?: string;
  description?: string;
  icon?: React.ElementType<any>;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  title = "Something Went Wrong",
  description = "An unexpected error occurred while loading this section. Please try again.",
  icon: Icon = AlertTriangle,
  onRetry,
  retryLabel = "Try Again",
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`p-8 text-center border border-red-200 dark:border-red-900/40 rounded-xl bg-red-50/50 dark:bg-red-950/20 space-y-4 max-w-md mx-auto my-6 ${className}`}
      role="alert"
    >
      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
        {(() => {
          const IconComp = Icon as any;
          return <IconComp className="w-6 h-6" />;
        })()}
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>

      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          className="gap-2 text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

export function InlineError({
  message,
  onRetry,
  className = "",
}: {
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={`p-3 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/80 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs flex items-center justify-between gap-2 ${className}`}
      role="alert"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>{message}</span>
      </div>
      {onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="h-7 text-xs px-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 gap-1"
        >
          <RefreshCw className="w-3 h-3" /> Retry
        </Button>
      )}
    </div>
  );
}

export function RetrySection({
  onRetry,
  message = "Failed to load data.",
  className = "",
}: {
  onRetry: () => void;
  message?: string;
  className?: string;
}) {
  return (
    <div className={`p-6 text-center border rounded-xl bg-card space-y-3 ${className}`}>
      <p className="text-xs text-muted-foreground">{message}</p>
      <Button variant="secondary" size="sm" onClick={onRetry} className="gap-1.5 text-xs font-semibold">
        <RefreshCw className="w-3.5 h-3.5" /> Retry Loading
      </Button>
    </div>
  );
}
