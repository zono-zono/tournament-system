import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateMatchResult } from "@/lib/actions/matches";

type Match = {
  id: string;
  round_number: number;
  match_number_in_round: number;
  status: 'scheduled' | 'in_progress' | 'completed';
  player1: {
    id: string;
    user: { username: string | null } | null;
  } | null;
  player2: {
    id: string;
    user: { username: string | null } | null;
  } | null;
  winner: {
    id: string;
    user: { username: string | null } | null;
  } | null;
};

type TournamentBracketProps = {
  matches: Match[];
  isOrganizer: boolean;
};

function MatchCard({ match, isOrganizer }: { match: Match; isOrganizer: boolean }) {
  const player1Name = match.player1?.user?.username || "TBD";
  const player2Name = match.player2?.user?.username || "TBD";
  const winnerName = match.winner?.user?.username;

  const canUpdateResult = isOrganizer && 
    match.status !== 'completed' && 
    match.player1 && 
    match.player2;

  return (
    <Card className="w-64 mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">
            R{match.round_number}-{match.match_number_in_round}
          </CardTitle>
          <Badge variant={match.status === 'completed' ? 'default' : 'secondary'}>
            {match.status === 'completed' ? '完了' : 
             match.status === 'in_progress' ? '進行中' : '予定'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          <div className={`p-2 rounded text-sm flex items-center justify-between ${
            match.winner?.id === match.player1?.id ? 'bg-green-100 font-semibold' : 'bg-gray-50'
          }`}>
            <span>{player1Name}</span>
            {canUpdateResult && (
              <form action={updateMatchResult.bind(null, match.id, match.player1!.id)}>
                <Button size="sm" variant="outline" type="submit">
                  勝利
                </Button>
              </form>
            )}
          </div>
          
          <div className="text-center text-xs text-muted-foreground">vs</div>
          
          <div className={`p-2 rounded text-sm flex items-center justify-between ${
            match.winner?.id === match.player2?.id ? 'bg-green-100 font-semibold' : 'bg-gray-50'
          }`}>
            <span>{player2Name}</span>
            {canUpdateResult && match.player2 && (
              <form action={updateMatchResult.bind(null, match.id, match.player2.id)}>
                <Button size="sm" variant="outline" type="submit">
                  勝利
                </Button>
              </form>
            )}
          </div>
        </div>
        
        {match.status === 'completed' && winnerName && (
          <div className="text-center text-sm font-semibold text-green-600">
            勝者: {winnerName}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TournamentBracket({ matches, isOrganizer }: TournamentBracketProps) {
  if (matches.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">トーナメント表がまだ生成されていません</p>
      </div>
    );
  }

  // Group matches by round
  const matchesByRound = matches.reduce((acc, match) => {
    if (!acc[match.round_number]) {
      acc[match.round_number] = [];
    }
    acc[match.round_number].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  const rounds = Object.keys(matchesByRound)
    .map(Number)
    .sort((a, b) => a - b);

  const getRoundName = (roundNumber: number, totalRounds: number) => {
    if (roundNumber === totalRounds) return "決勝";
    if (roundNumber === totalRounds - 1) return "準決勝";
    if (roundNumber === totalRounds - 2) return "準々決勝";
    return `${roundNumber}回戦`;
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-8 p-4 min-w-max">
        {rounds.map((roundNumber) => (
          <div key={roundNumber} className="flex flex-col">
            <h3 className="text-lg font-semibold mb-4 text-center">
              {getRoundName(roundNumber, rounds.length)}
            </h3>
            <div className="space-y-4">
              {matchesByRound[roundNumber].map((match) => (
                <MatchCard 
                  key={match.id} 
                  match={match} 
                  isOrganizer={isOrganizer}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}