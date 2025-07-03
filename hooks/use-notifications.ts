"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  NotificationData, 
  sendBrowserNotification, 
  checkNotificationPermission,
  requestNotificationPermission 
} from "@/lib/notifications";
import { useToast } from "@/components/toast-container";

interface UseNotificationsOptions {
  userId: string;
  enableBrowserNotifications?: boolean;
}

export function useNotifications({ 
  userId, 
  enableBrowserNotifications = true 
}: UseNotificationsOptions) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const { success, info, warning } = useToast();

  // ブラウザ通知の権限確認と要求
  useEffect(() => {
    if (!enableBrowserNotifications) return;

    const permission = checkNotificationPermission();
    setHasPermission(permission === "granted");

    if (permission === "default") {
      requestNotificationPermission().then((result) => {
        setHasPermission(result === "granted");
      });
    }
  }, [enableBrowserNotifications]);

  // リアルタイム通知の購読
  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as any;
          const notification: NotificationData = {
            id: newNotification.id,
            title: newNotification.title,
            message: newNotification.message,
            type: newNotification.type,
            userId: newNotification.user_id,
            tournamentId: newNotification.tournament_id,
            matchId: newNotification.match_id,
            read: newNotification.read,
            createdAt: newNotification.created_at,
          };

          // 通知リストに追加
          setNotifications(prev => [notification, ...prev]);

          // トースト通知
          switch (notification.type) {
            case "tournament_start":
            case "tournament_complete":
              success(notification.title, notification.message);
              break;
            case "match_ready":
            case "match_result":
              info(notification.title, notification.message);
              break;
            case "system":
              warning(notification.title, notification.message);
              break;
            default:
              info(notification.title, notification.message);
          }

          // ブラウザ通知
          if (enableBrowserNotifications && hasPermission) {
            sendBrowserNotification(notification.title, {
              body: notification.message,
              tag: notification.id,
              requireInteraction: notification.type === "match_ready",
            });
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, enableBrowserNotifications, hasPermission, success, info, warning]);

  const requestPermission = useCallback(async () => {
    if (!enableBrowserNotifications) return false;
    
    const permission = await requestNotificationPermission();
    const granted = permission === "granted";
    setHasPermission(granted);
    return granted;
  }, [enableBrowserNotifications]);

  return {
    notifications,
    isConnected,
    hasPermission,
    requestPermission,
  };
}