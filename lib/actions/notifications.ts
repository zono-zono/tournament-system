"use server";

import { createClient } from "@/lib/supabase/server";
import { CreateNotificationParams, NotificationData } from "@/lib/notifications";

export async function createNotification(params: CreateNotificationParams): Promise<NotificationData | null> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        title: params.title,
        message: params.message,
        type: params.type,
        user_id: params.userId,
        tournament_id: params.tournamentId,
        match_id: params.matchId,
        read: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating notification:", error);
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      message: data.message,
      type: data.type,
      userId: data.user_id,
      tournamentId: data.tournament_id,
      matchId: data.match_id,
      read: data.read,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error("Error in createNotification:", error);
    return null;
  }
}

export async function getUserNotifications(userId: string): Promise<NotificationData[]> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }

    return data.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      userId: notification.user_id,
      tournamentId: notification.tournament_id,
      matchId: notification.match_id,
      read: notification.read,
      createdAt: notification.created_at,
    }));
  } catch (error) {
    console.error("Error in getUserNotifications:", error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);

    if (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in markNotificationAsRead:", error);
    return false;
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);

    if (error) {
      console.error("Error marking all notifications as read:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in markAllNotificationsAsRead:", error);
    return false;
  }
}

export async function deleteNotification(notificationId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    if (error) {
      console.error("Error deleting notification:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteNotification:", error);
    return false;
  }
}