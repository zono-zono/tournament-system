"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Users, Target } from "lucide-react";

interface TournamentProgressProps {
  matches: any[];
  totalParticipants: number;
}

export function TournamentProgress({ matches, totalParticipants }: TournamentProgressProps) {
  const progressData = useMemo(() => {
    const totalMatches = matches.length;
    const completedMatches = matches.filter(m => m.status === 'completed').length;
    const ongoingMatches = matches.filter(m => m.status === 'ongoing').length;
    const remainingMatches = totalMatches - completedMatches - ongoingMatches;
    
    // 現在のラウンドを計算
    let currentRound = 1;
    const rounds = Math.max(...matches.map(m => m.round_number), 1);
    
    for (let round = 1; round <= rounds; round++) {
      const roundMatches = matches.filter(m => m.round_number === round);
      const roundCompleted = roundMatches.every(m => m.status === 'completed');
      
      if (!roundCompleted) {
        currentRound = round;
        break;
      }
      currentRound = round + 1;
    }
    
    const progressPercentage = totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0;
    const isComplete = completedMatches === totalMatches && totalMatches > 0;
    
    return {
      totalMatches,
      completedMatches,
      ongoingMatches,
      remainingMatches,
      currentRound: Math.min(currentRound, rounds),
      totalRounds: rounds,
      progressPercentage,
      isComplete
    };
  }, [matches]);

  const getRoundName = (round: number, totalRounds: number) => {
    if (round === totalRounds) return "決勝";
    if (round === totalRounds - 1) return "準決勝";
    return `${round}回戦`;
  };

  const getStatusColor = (isComplete: boolean, hasOngoing: boolean) => {
    if (isComplete) return "text-green-600";
    if (hasOngoing) return "text-blue-600";
    return "text-gray-600";
  };

  return (
    <div className="space-y-4">
      {/* 進行状況サマリー */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5" />
            トーナメント進行状況
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* プログレスバー */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                全体進行率: {progressData.completedMatches}/{progressData.totalMatches} 試合完了
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progressData.progressPercentage)}%
              </span>
            </div>
            <Progress value={progressData.progressPercentage} className="h-2" />
          </div>

          {/* 現在のラウンド */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">現在のラウンド:</span>
            </div>
            <Badge 
              variant={progressData.isComplete ? "outline" : "default"}
              className={getStatusColor(progressData.isComplete, progressData.ongoingMatches > 0)}
            >
              {progressData.isComplete 
                ? "大会終了" 
                : getRoundName(progressData.currentRound, progressData.totalRounds)
              }
            </Badge>
          </div>

          {/* 統計情報 */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">参加者数</span>
              </div>
              <p className="text-lg font-semibold">{totalParticipants}名</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">総ラウンド</span>
              </div>
              <p className="text-lg font-semibold">{progressData.totalRounds}回戦</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 詳細統計 */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {progressData.completedMatches}
            </div>
            <div className="text-sm text-muted-foreground">完了</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {progressData.ongoingMatches}
            </div>
            <div className="text-sm text-muted-foreground">進行中</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">
              {progressData.remainingMatches}
            </div>
            <div className="text-sm text-muted-foreground">未実施</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}