"use client";

import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";

interface PageLoadingProps {
  message?: string;
  className?: string;
}

export function PageLoading({ message = "読み込み中...", className }: PageLoadingProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[400px] space-y-4",
      className
    )}>
      <LoadingSpinner size="lg" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export function FullPageLoading({ message = "読み込み中..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}