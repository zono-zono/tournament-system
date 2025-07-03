"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface RealtimeMatch {
  id: string;
  tournament_id: string;
  round_number: number;
  match_number_in_round: number;
  player1_id: string | null;
  player2_id: string | null;
  winner_id: string | null;
  player1_score: number | null;
  player2_score: number | null;
  status: string;
  scheduled_at: string | null;
  completed_at: string | null;
  created_at: string;
}

interface UseRealtimeMatchesProps {
  tournamentId: string;
  initialMatches?: any[];
}

export function useRealtimeMatches({ 
  tournamentId, 
  initialMatches = [] 
}: UseRealtimeMatchesProps) {
  const [matches, setMatches] = useState(initialMatches);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const supabase = createClient();
    let channel: RealtimeChannel;

    const setupRealtimeSubscription = async () => {
      try {
        // チャンネルを作成してリアルタイム更新をリッスン
        channel = supabase
          .channel(`tournament-${tournamentId}-matches`)
          .on(
            'postgres_changes',
            {
              event: '*', // INSERT, UPDATE, DELETE の全てのイベント
              schema: 'public',
              table: 'matches',
              filter: `tournament_id=eq.${tournamentId}`
            },
            (payload) => {
              console.log('Realtime match update:', payload);
              
              switch (payload.eventType) {
                case 'INSERT':
                  setMatches(prev => [...prev, payload.new as RealtimeMatch]);
                  break;
                  
                case 'UPDATE':
                  setMatches(prev => 
                    prev.map(match => 
                      match.id === payload.new.id 
                        ? { ...match, ...payload.new }
                        : match
                    )
                  );
                  break;
                  
                case 'DELETE':
                  setMatches(prev => 
                    prev.filter(match => match.id !== payload.old.id)
                  );
                  break;
              }
            }
          )
          .subscribe((status) => {
            console.log('Realtime subscription status:', status);
            
            if (status === 'SUBSCRIBED') {
              setIsConnected(true);
              setError(null);
            } else if (status === 'CHANNEL_ERROR') {
              setIsConnected(false);
              setError('リアルタイム接続でエラーが発生しました');
            } else if (status === 'TIMED_OUT') {
              setIsConnected(false);
              setError('リアルタイム接続がタイムアウトしました');
            } else if (status === 'CLOSED') {
              setIsConnected(false);
            }
          });

      } catch (err) {
        console.error('Error setting up realtime subscription:', err);
        setError('リアルタイム接続の設定に失敗しました');
      }
    };

    setupRealtimeSubscription();

    // クリーンアップ
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [tournamentId]);

  // 初期データの更新
  useEffect(() => {
    setMatches(initialMatches);
  }, [initialMatches]);

  const refreshMatches = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          player1:participants!matches_player1_id_fkey(
            id,
            seed,
            user:users(username)
          ),
          player2:participants!matches_player2_id_fkey(
            id,
            seed,
            user:users(username)
          ),
          winner:participants!matches_winner_id_fkey(
            id,
            user:users(username)
          )
        `)
        .eq('tournament_id', tournamentId)
        .order('round_number')
        .order('match_number_in_round');

      if (error) throw error;
      setMatches(data || []);
    } catch (err) {
      console.error('Error refreshing matches:', err);
      setError('試合データの更新に失敗しました');
    }
  };

  return {
    matches,
    isConnected,
    error,
    refreshMatches
  };
}