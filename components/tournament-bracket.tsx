"use client";

import { BracketMatch } from "@/lib/tournament-bracket";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TournamentBracketProps {
  matches: BracketMatch[];
  rounds: number;
  isEditable?: boolean;
  onMatchClick?: (match: BracketMatch) => void;
}

export function TournamentBracket({ 
  matches, 
  rounds, 
  isEditable = false, 
  onMatchClick 
}: TournamentBracketProps) {
  const getRoundMatches = (round: number) => {
    return matches.filter(m => m.round === round);
  };

  const getMatchStatusColor = (status: BracketMatch['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'ongoing':
        return 'bg-blue-50 border-blue-200';
      case 'bye':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getStatusBadge = (status: BracketMatch['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-200">完了</Badge>;
      case 'ongoing':
        return <Badge variant="outline" className="text-blue-600 border-blue-200">進行中</Badge>;
      case 'bye':
        return <Badge variant="outline" className="text-gray-600 border-gray-200">不戦勝</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-600 border-gray-200">待機中</Badge>;
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-flex gap-4 md:gap-8 p-2 md:p-4 min-w-max">
        {Array.from({ length: rounds }, (_, roundIndex) => {
          const round = roundIndex + 1;
          const roundMatches = getRoundMatches(round);
          
          return (
            <div key={round} className="flex flex-col items-center">
              <h3 className="text-sm md:text-lg font-semibold mb-2 md:mb-4 text-center">
                {round === rounds ? '決勝' : `${round}回戦`}
              </h3>
              
              <div className="flex flex-col gap-2 md:gap-4">
                {roundMatches.map((match, index) => (
                  <Card
                    key={match.id}
                    className={cn(
                      "w-52 md:w-64 cursor-pointer transition-all hover:shadow-md",
                      getMatchStatusColor(match.status),
                      isEditable && "hover:scale-105"
                    )}
                    onClick={() => isEditable && onMatchClick?.(match)}
                  >
                    <CardContent className="p-2 md:p-4">
                      <div className="flex justify-between items-center mb-2 md:mb-3">
                        <span className="text-xs md:text-sm font-medium text-gray-600">
                          第{match.matchNumber}試合
                        </span>
                        {getStatusBadge(match.status)}
                      </div>
                      
                      <div className="space-y-1 md:space-y-2">
                        {/* Player 1 */}
                        <div className={cn(
                          "flex justify-between items-center p-1 md:p-2 rounded",
                          match.winner?.id === match.player1?.id 
                            ? "bg-green-100 border border-green-200" 
                            : "bg-gray-50"
                        )}>
                          <div className="flex items-center gap-1 md:gap-2 min-w-0">
                            {match.player1?.seed && (
                              <span className="text-xs bg-gray-200 rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center flex-shrink-0">
                                {match.player1.seed}
                              </span>
                            )}
                            <span className={cn(
                              "text-xs md:text-sm truncate",
                              match.winner?.id === match.player1?.id ? "font-semibold" : ""
                            )}>
                              {match.player1?.name || '待機中'}
                            </span>
                          </div>
                          {match.player1Score !== undefined && (
                            <span className="text-xs md:text-sm font-mono flex-shrink-0">
                              {match.player1Score}
                            </span>
                          )}
                        </div>
                        
                        {/* VS */}
                        <div className="text-center text-xs text-gray-400">
                          VS
                        </div>
                        
                        {/* Player 2 */}
                        <div className={cn(
                          "flex justify-between items-center p-1 md:p-2 rounded",
                          match.winner?.id === match.player2?.id 
                            ? "bg-green-100 border border-green-200" 
                            : "bg-gray-50"
                        )}>
                          <div className="flex items-center gap-1 md:gap-2 min-w-0">
                            {match.player2?.seed && (
                              <span className="text-xs bg-gray-200 rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center flex-shrink-0">
                                {match.player2.seed}
                              </span>
                            )}
                            <span className={cn(
                              "text-xs md:text-sm truncate",
                              match.winner?.id === match.player2?.id ? "font-semibold" : ""
                            )}>
                              {match.player2?.name || '待機中'}
                            </span>
                          </div>
                          {match.player2Score !== undefined && (
                            <span className="text-xs md:text-sm font-mono flex-shrink-0">
                              {match.player2Score}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {match.scheduledAt && (
                        <div className="mt-2 md:mt-3 text-xs text-gray-500 text-center">
                          予定: {new Date(match.scheduledAt).toLocaleString('ja-JP', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      )}
                      
                      {isEditable && match.status === 'pending' && match.player1 && match.player2 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2 md:mt-3 text-xs md:text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMatchClick?.(match);
                          }}
                        >
                          結果入力
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}