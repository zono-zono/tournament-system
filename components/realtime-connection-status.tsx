"use client";

import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, AlertCircle } from "lucide-react";

interface RealtimeConnectionStatusProps {
  isConnected: boolean;
  error?: string | null;
  className?: string;
}

export function RealtimeConnectionStatus({ 
  isConnected, 
  error, 
  className 
}: RealtimeConnectionStatusProps) {
  if (error) {
    return (
      <Badge variant="destructive" className={className}>
        <AlertCircle className="h-3 w-3 mr-1" />
        接続エラー
      </Badge>
    );
  }

  if (isConnected) {
    return (
      <Badge variant="outline" className={`border-green-200 text-green-700 ${className}`}>
        <Wifi className="h-3 w-3 mr-1" />
        リアルタイム接続中
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={`border-gray-200 text-gray-600 ${className}`}>
      <WifiOff className="h-3 w-3 mr-1" />
      接続待機中
    </Badge>
  );
}