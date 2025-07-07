"use client";

import { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  closestCenter,
  closestCorners,
  rectIntersection,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Settings, Calendar, List, Grid3X3 } from "lucide-react";

import { DraggableMatch } from "./draggable-match";
import { ScheduleGrid } from "./schedule-grid";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { ScheduleSettingsForm, ScheduleSettings } from "./schedule-settings-form";
import { CreateScheduleForm, ScheduleConfig } from "./create-schedule-form";
import { generateAutoSchedule, MatchAssignment } from "@/lib/schedule-algorithms";
import { updateMatchSchedule } from "@/lib/actions/schedule";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface EnhancedScheduleBoardProps {
  matches: any[];
  onMatchUpdate?: (matchId: string, updates: any) => void;
  isOrganizer?: boolean;
}

// ドラッグ可能な試合カードコンポーネント
function DraggableMatchCard({ match, isOrganizer }: { match: any; isOrganizer: boolean }) {
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
      className={`p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${
        isOrganizer ? 'cursor-grab active:cursor-grabbing' : ''
      } ${isDragging ? 'shadow-lg ring-2 ring-primary/20' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start gap-2">
        {isOrganizer && (
          <GripVertical className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-500 mb-1">
            R{match.round_number || '?'}-{match.match_number_in_round || '?'}
          </div>
          <div className="text-sm font-medium text-gray-900">
            {match.player1_name || match.player1?.username || 'TBD'} 
            <span className="mx-2 text-gray-400">vs</span>
            {match.player2_name || match.player2?.username || 'TBD'}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            ID: {match.id.slice(0, 8)}...
          </div>
          {isOrganizer && (
            <div className="text-xs text-blue-600 mt-2 flex items-center gap-1">
              📍 スケジュール表にドラッグして配置
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 未スケジュール試合エリア（ドロップゾーンとしても機能）
function UnscheduledMatchesArea({ matches, isOrganizer }: { matches: any[]; isOrganizer: boolean }) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'unscheduled-area',
    disabled: !isOrganizer,
    data: {
      type: 'unscheduled-area'
    }
  });

  return (
    <div 
      ref={setNodeRef}
      className={`border-t pt-6 transition-all duration-200 ${
        isOver ? 'bg-blue-50 border-blue-200' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <List className="h-5 w-5" />
          未スケジュール試合 ({matches.length})
        </h3>
        <div className="flex gap-2">
          <Badge variant="outline">
            上のスケジュール表にドラッグして配置
          </Badge>
          {isOrganizer && (
            <Badge variant="secondary">
              ここにドロップでスケジュール解除
            </Badge>
          )}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {matches.map((match) => {
          console.log('未スケジュール試合をレンダリング:', match);
          
          if (!match?.id) {
            return (
              <div key="error" className="p-3 border border-red-300 bg-red-50 text-red-700 text-sm">
                エラー: 試合データが無効です
              </div>
            );
          }
          
          return (
            <DraggableMatchCard
              key={match.id}
              match={match}
              isOrganizer={isOrganizer}
            />
          );
        })}
      </div>
      {isOver && isOrganizer && (
        <div className="text-center py-4 text-blue-600 font-medium">
          🗑️ ここにドロップして未スケジュール状態に戻す
        </div>
      )}
    </div>
  );
}

export function EnhancedScheduleBoard({
  matches: initialMatches,
  onMatchUpdate,
  isOrganizer = false
}: EnhancedScheduleBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [matches, setMatches] = useState(initialMatches);
  const [scheduleSettings, setScheduleSettings] = useState<ScheduleSettings>({
    courts: ["第1コート", "第2コート"],
    timeSlots: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
    startTime: "09:00",
    endTime: "18:00",
    slotDuration: 60
  });

  // propsの変更を監視してローカル状態を更新
  useEffect(() => {
    setMatches(initialMatches);
  }, [initialMatches]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  // 未スケジュールの試合を取得
  const unscheduledMatches = matches.filter(match => 
    !match.scheduled_time || !match.venue
  );

  // スケジュール済みの試合を取得
  const scheduledMatches = matches.filter(match => 
    match.scheduled_time && match.venue
  );
  
  console.log('Enhanced Schedule Board - データ確認:', {
    totalMatches: matches.length,
    unscheduledMatches: unscheduledMatches.length,
    scheduledMatches: scheduledMatches.length,
    sampleMatch: matches[0] || null,
    scheduleSettings
  });

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    console.log('🎯 Drag End Event:', {
      active: {
        id: active.id,
        data: active.data.current
      },
      over: over ? {
        id: over.id,
        data: over.data.current
      } : null,
      isOrganizer
    });

    if (!over || !isOrganizer) {
      console.log('❌ ドロップ失敗: over がない または organizer でない');
      return;
    }

    const matchId = active.id as string;
    const overId = over.id as string;

    console.log('📋 ドロップ詳細:', { matchId, overId, overData: over.data.current });

    // スケジュールスロットへのドロップ
    if (over.data.current?.type === 'schedule-slot') {
      const { timeSlot, court } = over.data.current;
      
      console.log('✅ スケジュールスロットにドロップ:', { timeSlot, court });
      
      try {
        const newScheduledTime = `2000-01-01T${timeSlot}:00`;
        const newScheduledDate = new Date().toISOString().split('T')[0];

        // サーバーアクションを呼び出してスケジュールを更新
        await updateMatchSchedule(matchId, {
          scheduled_time: newScheduledTime,
          venue: court,
          scheduled_date: newScheduledDate
        });

        console.log('🎉 スケジュール更新成功');

        // ローカル状態を即座に更新（移動の場合は元の場所からも削除）
        setMatches(prevMatches => 
          prevMatches.map(match => 
            match.id === matchId 
              ? { 
                  ...match, 
                  scheduled_time: newScheduledTime,
                  venue: court,
                  scheduled_date: newScheduledDate
                }
              : match
          )
        );

        // 親コンポーネントにも通知
        if (onMatchUpdate) {
          onMatchUpdate(matchId, {
            scheduled_time: newScheduledTime,
            venue: court,
            scheduled_date: newScheduledDate
          });
        }

      } catch (error) {
        console.error('❌ スケジュール更新失敗:', error);
      }
    } else if (over.data.current?.type === 'unscheduled-area') {
      console.log('🗑️ 未スケジュールエリアにドロップ');
      
      try {
        // スケジュールをクリア（NULLに設定）
        await updateMatchSchedule(matchId, {
          scheduled_time: null,
          venue: null,
          scheduled_date: null
        });

        console.log('🎉 スケジュールクリア成功');

        // ローカル状態を即座に更新
        setMatches(prevMatches => 
          prevMatches.map(match => 
            match.id === matchId 
              ? { 
                  ...match, 
                  scheduled_time: null,
                  venue: null,
                  scheduled_date: null
                }
              : match
          )
        );

        // 親コンポーネントにも通知
        if (onMatchUpdate) {
          onMatchUpdate(matchId, {
            scheduled_time: null,
            venue: null,
            scheduled_date: null
          });
        }

      } catch (error) {
        console.error('❌ スケジュールクリア失敗:', error);
      }
    } else {
      console.log('❌ 無効なドロップターゲット:', over.data.current?.type);
    }
  }, [isOrganizer, onMatchUpdate]);

  const handleDragOver = (event: DragOverEvent) => {
    // ドラッグオーバー時の処理（必要に応じて実装）
  };

  const handleSettingsChange = (newSettings: ScheduleSettings) => {
    setScheduleSettings(newSettings);
  };

  const handleAutoSchedule = async (config: ScheduleConfig) => {
    try {
      console.log('自動配置開始:', { 
        settings: scheduleSettings, 
        config, 
        unscheduledMatches: unscheduledMatches.length 
      });
      
      // 自動配置を生成
      const assignments = generateAutoSchedule(scheduleSettings, config, unscheduledMatches);
      console.log('生成された配置:', assignments);
      
      // 各配置をサーバーに送信
      for (const assignment of assignments) {
        console.log('配置を更新中:', assignment);
        
        await updateMatchSchedule(assignment.matchId, {
          scheduled_time: assignment.scheduled_time,
          scheduled_date: assignment.scheduled_date,
          venue: assignment.venue
        });

        // ローカル状態を即座に更新
        setMatches(prevMatches => 
          prevMatches.map(match => 
            match.id === assignment.matchId 
              ? { 
                  ...match, 
                  scheduled_time: assignment.scheduled_time,
                  venue: assignment.venue,
                  scheduled_date: assignment.scheduled_date
                }
              : match
          )
        );

        // 親コンポーネントにも通知
        if (onMatchUpdate) {
          onMatchUpdate(assignment.matchId, {
            scheduled_time: assignment.scheduled_time,
            scheduled_date: assignment.scheduled_date,
            venue: assignment.venue
          });
        }
      }
      
      console.log(`自動配置完了: ${assignments.length}試合を配置しました`);
      
    } catch (error) {
      console.error('自動配置エラー:', error);
    }
  };

  const handleManualDrop = async (matchId: string, timeSlot: string, court: string) => {
    try {
      console.log('手動ドロップ処理開始:', { matchId, timeSlot, court });
      
      const scheduled_time = `2000-01-01T${timeSlot}:00`;
      const scheduled_date = new Date().toISOString().split('T')[0];
      
      await updateMatchSchedule(matchId, {
        scheduled_time,
        scheduled_date,
        venue: court
      });

      // ローカル状態を即座に更新
      setMatches(prevMatches => 
        prevMatches.map(match => 
          match.id === matchId 
            ? { 
                ...match, 
                scheduled_time,
                venue: court,
                scheduled_date
              }
            : match
        )
      );

      // 親コンポーネントにも通知
      if (onMatchUpdate) {
        onMatchUpdate(matchId, {
          scheduled_time,
          scheduled_date,
          venue: court
        });
      }
      
      console.log('手動ドロップ完了');
      
    } catch (error) {
      console.error('手動ドロップエラー:', error);
    }
  };

  const activeMatch = activeId ? matches.find(m => m.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">スケジュール管理</h2>
            <p className="text-muted-foreground">
              試合をドラッグ&ドロップしてスケジュールを調整できます
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {unscheduledMatches.length}試合未割当
            </Badge>
            <Badge variant="secondary">
              {scheduledMatches.length}試合スケジュール済み
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="schedule" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              スケジュール
            </TabsTrigger>
            <TabsTrigger value="matches" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              試合一覧
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              設定
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-4">
            {/* 自動配置ボタン */}
            {unscheduledMatches.length > 0 && isOrganizer && (
              <CreateScheduleForm
                settings={scheduleSettings}
                unscheduledMatches={unscheduledMatches}
                onAutoSchedule={handleAutoSchedule}
                isOrganizer={isOrganizer}
              />
            )}
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Grid3X3 className="h-5 w-5" />
                  スケジュール表
                </CardTitle>
                <CardDescription>
                  {scheduleSettings.courts.length}コート × {scheduleSettings.timeSlots.length}時間枠
                  {scheduledMatches.length > 0 && ` | ${scheduledMatches.length}試合配置済み`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* スケジュールグリッド */}
                <ScheduleGrid
                  timeSlots={scheduleSettings.timeSlots}
                  courts={scheduleSettings.courts}
                  matches={matches}
                  onMatchDrop={(matchId, timeSlot, court) => {
                    console.log('Manual drop detected:', { matchId, timeSlot, court });
                    // 手動でupdateMatchScheduleを呼び出し
                    handleManualDrop(matchId, timeSlot, court);
                  }}
                  isOrganizer={isOrganizer}
                />
                
                {/* 未スケジュール試合セクション */}
                {unscheduledMatches.length > 0 && (
                  <UnscheduledMatchesArea 
                    matches={unscheduledMatches}
                    isOrganizer={isOrganizer}
                  />
                )}
                
                {/* 空の状態 */}
                {unscheduledMatches.length === 0 && scheduledMatches.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">スケジュールが空です</p>
                    <p className="text-sm">トーナメント表から試合を生成してください</p>
                  </div>
                )}
                
                {unscheduledMatches.length === 0 && scheduledMatches.length > 0 && (
                  <div className="text-center py-8 text-muted-foreground border-t">
                    <p className="text-sm">✅ すべての試合がスケジュール済みです</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="matches" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* 未スケジュール試合 */}
              <Card>
                <CardHeader>
                  <CardTitle>未スケジュール試合 ({unscheduledMatches.length})</CardTitle>
                  <CardDescription>
                    スケジュール表にドラッグして配置してください
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {console.log('未スケジュール試合表示チェック:', { 
                      unscheduledMatches: unscheduledMatches.length,
                      matches: unscheduledMatches.map(m => ({ 
                        id: m.id, 
                        scheduled_time: m.scheduled_time, 
                        venue: m.venue,
                        player1_name: m.player1_name,
                        player2_name: m.player2_name
                      }))
                    })}
                    {unscheduledMatches.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        すべての試合がスケジュール済みです
                      </div>
                    ) : (
                      unscheduledMatches.map((match) => {
                        console.log('試合コンポーネントをレンダリング中:', match);
                        return (
                          <DraggableMatch
                            key={match.id}
                            match={match}
                            isOrganizer={isOrganizer}
                            isCompact={true}
                          />
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* スケジュール済み試合 */}
              <Card>
                <CardHeader>
                  <CardTitle>スケジュール済み試合</CardTitle>
                  <CardDescription>
                    現在スケジュールされている試合一覧
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {scheduledMatches.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        スケジュール済みの試合はありません
                      </div>
                    ) : (
                      scheduledMatches.map((match) => (
                        <DraggableMatch
                          key={match.id}
                          match={match}
                          isOrganizer={isOrganizer}
                          isCompact={true}
                        />
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <ScheduleSettingsForm
              initialSettings={scheduleSettings}
              onSettingsChange={handleSettingsChange}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* ドラッグオーバーレイ */}
      <DragOverlay>
        {activeMatch ? (
          <DraggableMatchCard
            match={activeMatch}
            isOrganizer={isOrganizer}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}