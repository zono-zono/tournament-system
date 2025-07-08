"use client";

import { EnhancedScheduleBoard } from "./enhanced-schedule-board";

interface TournamentScheduleWrapperProps {
  matches: any[];
  isOrganizer: boolean;
}

export function TournamentScheduleWrapper({ 
  matches, 
  isOrganizer 
}: TournamentScheduleWrapperProps) {
  console.log('TournamentScheduleWrapper データ受信:', {
    matchesCount: matches.length,
    isOrganizer,
    sampleMatch: matches[0] || null,
    sampleMatchKeys: matches[0] ? Object.keys(matches[0]) : [],
    allMatches: matches.map(m => ({
      id: m.id,
      player1_name: m.player1_name,
      player2_name: m.player2_name,
      scheduled_time: m.scheduled_time,
      venue: m.venue,
      allKeys: Object.keys(m)
    }))
  });

  const handleMatchUpdate = (matchId: string, updates: any) => {
    // クライアント側での楽観的更新
    // 実際の更新はEnhancedScheduleBoardで処理される
    console.log('Match updated:', matchId, updates);
  };

  return (
    <EnhancedScheduleBoard 
      matches={matches}
      onMatchUpdate={handleMatchUpdate}
      isOrganizer={isOrganizer}
    />
  );
}