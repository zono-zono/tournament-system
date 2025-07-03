"use client";

import { useEffect } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import { useToast } from "@/components/toast-container";

interface NotificationManagerProps {
  userId: string;
  enableBrowserNotifications?: boolean;
}

export function NotificationManager({ 
  userId, 
  enableBrowserNotifications = true 
}: NotificationManagerProps) {
  const { isConnected, hasPermission, requestPermission } = useNotifications({
    userId,
    enableBrowserNotifications,
  });
  
  const { info } = useToast();

  // 接続状態の通知
  useEffect(() => {
    if (isConnected) {
      console.log("リアルタイム通知に接続しました");
    }
  }, [isConnected]);

  // ブラウザ通知権限の要求
  useEffect(() => {
    if (enableBrowserNotifications && !hasPermission) {
      const timer = setTimeout(() => {
        info(
          "通知を有効にしますか？",
          "大会の重要な更新をリアルタイムで受け取ることができます。"
        );
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [enableBrowserNotifications, hasPermission, info]);

  // このコンポーネントは表示要素を持たず、通知管理のみを行う
  return null;
}