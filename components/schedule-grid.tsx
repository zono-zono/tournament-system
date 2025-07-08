"use client";

import { useDroppable, useDraggable } from "@dnd-kit/core";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, GripVertical } from "lucide-react";
import { CSS } from "@dnd-kit/utilities";

interface Match {
  id: string;
  tournament_id: string;
  round_number: number;
  match_number_in_round: number;
  player1_id?: string;
  player1_name?: string;
  player1?: { username: string };
  player2_id?: string;
  player2_name?: string;
  player2?: { username: string };
  status: 'scheduled' | 'in_progress' | 'completed';
  scheduled_time?: string;
  venue?: string;
}

interface ScheduleSlot {
  timeSlot: string;
  court: string;
  match?: Match;
}

interface ScheduleGridProps {
  timeSlots: string[];
  courts: string[];
  matches: Match[];
  onMatchDrop?: (matchId: string, timeSlot: string, court: string) => void;
  isOrganizer?: boolean;
}

// スケジュール済み試合のドラッグ可能カード
function ScheduledMatchCard({ match, isOrganizer }: { match: Match; isOrganizer?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: match.id,
    disabled: !isOrganizer,
    data: {
      type: 'match',
      match
    }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`space-y-1 ${
        isOrganizer ? 'cursor-grab active:cursor-grabbing' : ''
      } ${isDragging ? 'opacity-50' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center gap-1">
        {isOrganizer && (
          <GripVertical className="h-3 w-3 text-muted-foreground flex-shrink-0" />
        )}
        <div className="text-xs text-muted-foreground flex-1">
          R{match.round_number}-{match.match_number_in_round}
        </div>
      </div>
      <div className="text-sm font-medium">
        {match.player1_name || match.player1?.username || 'TBD'} vs {match.player2_name || match.player2?.username || 'TBD'}
      </div>
      <Badge variant="secondary" className="text-xs">
        {match.status === 'scheduled' ? '予定' : 
         match.status === 'in_progress' ? '進行中' : '完了'}
      </Badge>
      {isOrganizer && (
        <div className="text-xs text-blue-600 mt-1">
          📍 他の枠に移動可能
        </div>
      )}
    </div>
  );
}

function DroppableSlot({ 
  timeSlot, 
  court, 
  match, 
  onMatchDrop, 
  isOrganizer 
}: {
  timeSlot: string;
  court: string;
  match?: Match;
  onMatchDrop?: (matchId: string, timeSlot: string, court: string) => void;
  isOrganizer?: boolean;
}) {
  const slotId = `${timeSlot}-${court}`;
  const { isOver, setNodeRef } = useDroppable({
    id: slotId,
    disabled: !isOrganizer,
    data: {
      type: 'schedule-slot',
      timeSlot,
      court
    }
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('🎯 DroppableSlot 作成:', {
      slotId,
      timeSlot,
      court,
      isOrganizer,
      disabled: !isOrganizer,
      isOver
    });
  }

  const hasMatch = !!match;
  const isConflict = false; // TODO: 実装する

  return (
    <Card
      ref={setNodeRef}
      className={`min-h-[100px] transition-all duration-200 ${
        isOver ? 'ring-2 ring-primary/50 bg-primary/5' : ''
      } ${hasMatch ? 'bg-muted/30' : ''} ${
        isConflict ? 'ring-2 ring-destructive/50 bg-destructive/5' : ''
      }`}
    >
      <CardContent className="p-3 h-full">
        {hasMatch ? (
          <ScheduledMatchCard 
            match={match} 
            isOrganizer={isOrganizer}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <div className="text-xs">空き枠</div>
              {isOrganizer && (
                <div className="text-xs mt-1">試合をドロップ</div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ScheduleGrid({ 
  timeSlots, 
  courts, 
  matches, 
  onMatchDrop, 
  isOrganizer 
}: ScheduleGridProps) {
  // スケジュール済みの試合のみをフィルタリング
  const scheduledMatches = matches.filter(match => 
    match.scheduled_time && match.venue
  );
  
  if (process.env.NODE_ENV === 'development') {
    console.log('ScheduleGrid データ:', {
      totalMatches: matches.length,
      scheduledMatches: scheduledMatches.length,
      sampleScheduledMatch: scheduledMatches[0] || null
    });
  }

  // 試合をスケジュールスロットにマッピング
  const getMatchForSlot = (timeSlot: string, court: string) => {
    const foundMatch = scheduledMatches.find(match => {
      const matchTime = match.scheduled_time;
      const matchVenue = match.venue;
      
      // 時間の形式を確認してマッチング
      const timeMatch = matchTime && (
        matchTime.includes(timeSlot) || 
        new Date(matchTime).toTimeString().slice(0, 5) === timeSlot
      );
      const venueMatch = matchVenue === court;
      
      return timeMatch && venueMatch;
    });
    
    if (foundMatch && process.env.NODE_ENV === 'development') {
      console.log('マッチ発見:', { 
        timeSlot, 
        court, 
        match: foundMatch,
        scheduled_time: foundMatch.scheduled_time,
        venue: foundMatch.venue
      });
    }
    
    return foundMatch;
  };

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="grid gap-2" style={{ 
        gridTemplateColumns: `120px repeat(${courts.length}, 1fr)` 
      }}>
        <div className="font-medium text-sm text-muted-foreground p-2">
          時間
        </div>
        {courts.map((court) => (
          <div key={court} className="text-center">
            <div className="flex items-center justify-center gap-1 p-2 bg-muted rounded-md">
              <MapPin className="h-3 w-3" />
              <span className="text-sm font-medium">{court}</span>
            </div>
          </div>
        ))}
      </div>

      {/* グリッド */}
      <div className="space-y-2">
        {timeSlots.map((timeSlot) => (
          <div 
            key={timeSlot} 
            className="grid gap-2" 
            style={{ 
              gridTemplateColumns: `120px repeat(${courts.length}, 1fr)` 
            }}
          >
            {/* 時間ラベル */}
            <div className="flex items-center justify-center p-2 bg-muted rounded-md">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className="text-sm font-medium">{timeSlot}</span>
              </div>
            </div>

            {/* 各コートのスロット */}
            {courts.map((court) => (
              <DroppableSlot
                key={`${timeSlot}-${court}`}
                timeSlot={timeSlot}
                court={court}
                match={getMatchForSlot(timeSlot, court)}
                onMatchDrop={onMatchDrop}
                isOrganizer={isOrganizer}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}