"use client";

import { useState } from "react";
import { TournamentBracket } from "@/components/tournament-bracket";
import { MatchResultDialog } from "@/components/match-result-dialog";
import { RealtimeConnectionStatus } from "@/components/realtime-connection-status";
import { BracketMatch } from "@/lib/tournament-bracket";
import { updateMatchResult } from "@/lib/actions/matches";
import { useRealtimeMatches } from "@/hooks/use-realtime-matches";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface TournamentBracketManagerProps {
  tournamentId: string;
  initialMatches: any[];
  isOrganizer: boolean;
}

export function TournamentBracketManager({ 
  tournamentId,
  initialMatches, 
  isOrganizer 
}: TournamentBracketManagerProps) {
  const [selectedMatch, setSelectedMatch] = useState<BracketMatch | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  // リアルタイム更新を使用
  const { matches, isConnected, error } = useRealtimeMatches({
    tournamentId,
    initialMatches
  });

  // データベースの試合データをBracketMatch形式に変換
  const convertToBracketMatches = (dbMatches: any[]): BracketMatch[] => {
    return dbMatches.map(match => ({
      id: match.id,
      round: match.round_number,
      matchNumber: match.match_number_in_round,
      player1: match.player1 ? {
        id: match.player1.id,
        name: match.player1.user?.username || "Unknown",
        seed: match.player1.seed || undefined
      } : undefined,
      player2: match.player2 ? {
        id: match.player2.id,
        name: match.player2.user?.username || "Unknown",
        seed: match.player2.seed || undefined
      } : undefined,
      winner: match.winner ? {
        id: match.winner.id,
        name: match.winner.user?.username || "Unknown"
      } : undefined,
      player1Score: match.player1_score || undefined,
      player2Score: match.player2_score || undefined,
      status: match.status as BracketMatch['status'],
      scheduledAt: match.scheduled_at ? new Date(match.scheduled_at) : undefined,
      completedAt: match.completed_at ? new Date(match.completed_at) : undefined,
    }));
  };

  const bracketMatches = convertToBracketMatches(matches);
  const rounds = Math.max(...bracketMatches.map(m => m.round), 1);

  const handleMatchClick = (match: BracketMatch) => {
    if (!isOrganizer || match.status !== 'pending' || !match.player1 || !match.player2) {
      return;
    }
    setSelectedMatch(match);
    setIsDialogOpen(true);
  };

  const handleSaveResult = async (winnerId: string, player1Score?: number, player2Score?: number) => {
    if (!selectedMatch) return;
    
    setIsUpdating(true);
    try {
      await updateMatchResult(selectedMatch.id, winnerId, player1Score, player2Score);
      toast.success("試合結果を更新しました");
      // リアルタイム更新があるため、router.refresh()は不要
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "エラーが発生しました");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* リアルタイム接続状態の表示 */}
      <div className="flex justify-between items-center">
        <RealtimeConnectionStatus 
          isConnected={isConnected} 
          error={error}
          className="text-xs"
        />
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
      </div>

      <TournamentBracket
        matches={bracketMatches}
        rounds={rounds}
        isEditable={isOrganizer}
        onMatchClick={handleMatchClick}
      />
      
      <MatchResultDialog
        match={selectedMatch}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveResult}
      />
    </div>
  );
}