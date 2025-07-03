export interface BracketMatch {
  id: string;
  round: number;
  matchNumber: number;
  player1?: {
    id: string;
    name: string;
    seed?: number;
  };
  player2?: {
    id: string;
    name: string;
    seed?: number;
  };
  winner?: {
    id: string;
    name: string;
  };
  player1Score?: number;
  player2Score?: number;
  status: 'pending' | 'ongoing' | 'completed' | 'bye';
  scheduledAt?: Date;
  completedAt?: Date;
}

export interface TournamentBracket {
  matches: BracketMatch[];
  rounds: number;
  totalParticipants: number;
}

/**
 * シングルエリミネーション方式のトーナメント表を生成
 */
export function generateSingleEliminationBracket(
  participants: Array<{
    id: string;
    name: string;
    seed?: number;
  }>
): TournamentBracket {
  if (participants.length < 2) {
    throw new Error('参加者は最低2名必要です');
  }

  // 2の累乗に調整（4, 8, 16, 32...）
  const powerOfTwo = Math.pow(2, Math.ceil(Math.log2(participants.length)));
  const totalRounds = Math.log2(powerOfTwo);
  
  // シードに基づいてソート
  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.seed && b.seed) return a.seed - b.seed;
    if (a.seed && !b.seed) return -1;
    if (!a.seed && b.seed) return 1;
    return 0;
  });

  const matches: BracketMatch[] = [];
  let matchId = 1;

  // 1回戦のマッチを生成
  for (let i = 0; i < powerOfTwo / 2; i++) {
    const player1 = sortedParticipants[i];
    const player2 = sortedParticipants[powerOfTwo - 1 - i];

    const match: BracketMatch = {
      id: `match-${matchId}`,
      round: 1,
      matchNumber: i + 1,
      player1: player1 || undefined,
      player2: player2 || undefined,
      status: (!player1 || !player2) ? 'bye' : 'pending'
    };

    // 一方の選手がいない場合はBye（不戦勝）
    if (!player2 && player1) {
      match.winner = player1;
      match.status = 'bye';
    } else if (!player1 && player2) {
      match.winner = player2;
      match.status = 'bye';
    }

    matches.push(match);
    matchId++;
  }

  // 2回戦以降のマッチを生成
  for (let round = 2; round <= totalRounds; round++) {
    const matchesInRound = Math.pow(2, totalRounds - round);
    
    for (let i = 0; i < matchesInRound; i++) {
      const match: BracketMatch = {
        id: `match-${matchId}`,
        round,
        matchNumber: i + 1,
        status: 'pending'
      };

      matches.push(match);
      matchId++;
    }
  }

  return {
    matches,
    rounds: totalRounds,
    totalParticipants: participants.length
  };
}

/**
 * 試合結果を更新し、次の試合に勝者を進出させる
 */
export function updateMatchResult(
  bracket: TournamentBracket,
  matchId: string,
  winnerId: string,
  player1Score?: number,
  player2Score?: number
): TournamentBracket {
  const matches = [...bracket.matches];
  const matchIndex = matches.findIndex(m => m.id === matchId);
  
  if (matchIndex === -1) {
    throw new Error('試合が見つかりません');
  }

  const match = matches[matchIndex];
  
  // 勝者を設定
  if (match.player1?.id === winnerId) {
    match.winner = match.player1;
  } else if (match.player2?.id === winnerId) {
    match.winner = match.player2;
  } else {
    throw new Error('無効な勝者IDです');
  }

  // スコアと状態を更新
  match.player1Score = player1Score;
  match.player2Score = player2Score;
  match.status = 'completed';
  match.completedAt = new Date();

  // 次の試合に勝者を進出させる
  if (match.round < bracket.rounds) {
    const nextRound = match.round + 1;
    const nextMatchNumber = Math.ceil(match.matchNumber / 2);
    const nextMatchIndex = matches.findIndex(
      m => m.round === nextRound && m.matchNumber === nextMatchNumber
    );

    if (nextMatchIndex !== -1) {
      const nextMatch = matches[nextMatchIndex];
      
      // 奇数番目の試合の勝者は次の試合のplayer1、偶数番目はplayer2
      if (match.matchNumber % 2 === 1) {
        nextMatch.player1 = match.winner;
      } else {
        nextMatch.player2 = match.winner;
      }
    }
  }

  return {
    ...bracket,
    matches
  };
}

/**
 * トーナメントの進行状況を取得
 */
export function getTournamentProgress(bracket: TournamentBracket): {
  totalMatches: number;
  completedMatches: number;
  remainingMatches: number;
  currentRound: number;
  isComplete: boolean;
} {
  const totalMatches = bracket.matches.length;
  const completedMatches = bracket.matches.filter(m => m.status === 'completed').length;
  const remainingMatches = totalMatches - completedMatches;
  
  // 現在のラウンドを計算
  let currentRound = 1;
  for (let round = 1; round <= bracket.rounds; round++) {
    const roundMatches = bracket.matches.filter(m => m.round === round);
    const roundCompleted = roundMatches.every(m => m.status === 'completed');
    
    if (!roundCompleted) {
      currentRound = round;
      break;
    }
    currentRound = round + 1;
  }

  const isComplete = bracket.matches.every(m => m.status === 'completed');

  return {
    totalMatches,
    completedMatches,
    remainingMatches,
    currentRound: Math.min(currentRound, bracket.rounds),
    isComplete
  };
}