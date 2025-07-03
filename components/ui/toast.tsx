"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning";
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({ 
  id, 
  title, 
  description, 
  variant = "default", 
  duration = 5000,
  onClose 
}: ToastProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300);
  };

  const variantClasses = {
    default: "bg-background border border-border",
    destructive: "bg-destructive border-destructive text-destructive-foreground",
    success: "bg-green-500 border-green-500 text-white",
    warning: "bg-yellow-500 border-yellow-500 text-white"
  };

  return (
    <div
      className={cn(
        "relative pointer-events-auto flex w-full max-w-sm rounded-lg p-4 shadow-lg transition-all duration-300 ease-in-out",
        variantClasses[variant],
        isVisible ? "animate-in slide-in-from-right-full" : "animate-out slide-out-to-right-full"
      )}
    >
      <div className="flex-1 space-y-1">
        {title && (
          <div className="text-sm font-semibold">{title}</div>
        )}
        {description && (
          <div className="text-sm opacity-90">{description}</div>
        )}
      </div>
      <button
        onClick={handleClose}
        className="ml-4 inline-flex h-5 w-5 items-center justify-center rounded-md opacity-70 hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}