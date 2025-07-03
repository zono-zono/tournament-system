export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: "tournament_start" | "match_ready" | "match_result" | "tournament_complete" | "system";
  userId: string;
  tournamentId?: string;
  matchId?: string;
  read: boolean;
  createdAt: string;
}

export interface CreateNotificationParams {
  title: string;
  message: string;
  type: NotificationData["type"];
  userId: string;
  tournamentId?: string;
  matchId?: string;
}

// 通知テンプレート
export const notificationTemplates = {
  tournamentStart: (tournamentName: string) => ({
    title: "大会が開始されました",
    message: `${tournamentName}が開始されました。トーナメント表を確認してください。`,
    type: "tournament_start" as const,
  }),

  matchReady: (matchNumber: number, round: number, opponent: string) => ({
    title: "試合の準備ができました",
    message: `第${matchNumber}試合（${round}回戦）vs ${opponent}の準備ができました。`,
    type: "match_ready" as const,
  }),

  matchResult: (matchNumber: number, winner: string, isWin: boolean) => ({
    title: isWin ? "試合に勝利しました！" : "試合結果が更新されました",
    message: `第${matchNumber}試合の結果: ${winner}の勝利`,
    type: "match_result" as const,
  }),

  tournamentComplete: (tournamentName: string, winner: string, isWinner: boolean) => ({
    title: isWinner ? "優勝おめでとうございます！" : "大会が終了しました",
    message: `${tournamentName}が終了しました。優勝: ${winner}`,
    type: "tournament_complete" as const,
  }),

  system: (message: string) => ({
    title: "システム通知",
    message,
    type: "system" as const,
  }),
};

// ブラウザ通知の権限チェック
export function checkNotificationPermission(): "granted" | "denied" | "default" {
  if (!("Notification" in window)) {
    return "denied";
  }
  return Notification.permission;
}

// ブラウザ通知の権限要求
export async function requestNotificationPermission(): Promise<"granted" | "denied" | "default"> {
  if (!("Notification" in window)) {
    return "denied";
  }
  
  const permission = await Notification.requestPermission();
  return permission;
}

// ブラウザ通知の送信
export function sendBrowserNotification(title: string, options?: NotificationOptions) {
  if (checkNotificationPermission() === "granted") {
    new Notification(title, {
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      ...options,
    });
  }
}