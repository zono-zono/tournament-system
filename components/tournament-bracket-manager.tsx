"use client";

import { useState } from "react";
import { TournamentBracket } from "@/components/tournament-bracket";
import { MatchResultDialog } from "@/components/match-result-dialog";
import { BracketMatch } from "@/lib/tournament-bracket";
import { updateMatchResult } from "@/lib/actions/matches";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface TournamentBracketManagerProps {
  matches: any[];
  isOrganizer: boolean;
}

export function TournamentBracketManager({ 
  matches, 
  isOrganizer 
}: TournamentBracketManagerProps) {
  const [selectedMatch, setSelectedMatch] = useState<BracketMatch | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

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
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "エラーが発生しました");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
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
    </>
  );
}