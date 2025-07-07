"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, Clock, MapPin, Users, Wand2 } from "lucide-react";
import { ScheduleSettings } from "./schedule-settings-form";

interface CreateScheduleFormProps {
  settings: ScheduleSettings;
  unscheduledMatches: any[];
  onAutoSchedule: (config: ScheduleConfig) => void;
  isOrganizer?: boolean;
}

export interface ScheduleConfig {
  name: string;
  description?: string;
  startDate: string;
  strategy: 'balanced' | 'sequential' | 'random';
  breakDuration: number; // minutes between matches
  preferences: {
    preferredCourts?: string[];
    avoidTimeSlots?: string[];
    prioritizeRounds?: boolean;
  };
}

export function CreateScheduleForm({ 
  settings, 
  unscheduledMatches, 
  onAutoSchedule, 
  isOrganizer = false 
}: CreateScheduleFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ScheduleConfig>({
    name: `大会スケジュール ${new Date().toLocaleDateString('ja-JP')}`,
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    strategy: 'balanced',
    breakDuration: 15,
    preferences: {
      preferredCourts: [],
      avoidTimeSlots: [],
      prioritizeRounds: true
    }
  });

  const handleSubmit = () => {
    onAutoSchedule(config);
    setIsOpen(false);
  };

  const getStrategyDescription = (strategy: string) => {
    switch (strategy) {
      case 'balanced':
        return 'コートと時間を均等に配分します';
      case 'sequential':
        return 'ラウンド順に連続して配置します';
      case 'random':
        return 'ランダムに配置します';
      default:
        return '';
    }
  };

  const totalSlots = settings.courts.length * settings.timeSlots.length;
  const canAutoSchedule = unscheduledMatches.length <= totalSlots;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          className="w-full"
          disabled={!isOrganizer || unscheduledMatches.length === 0}
        >
          <Wand2 className="h-4 w-4 mr-2" />
          自動スケジュール作成
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            新規スケジュール作成
          </DialogTitle>
          <DialogDescription>
            {unscheduledMatches.length}試合を自動配置します
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 基本情報 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">スケジュール名</Label>
              <Input
                id="name"
                value={config.name}
                onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                placeholder="スケジュール名を入力"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">説明（任意）</Label>
              <Textarea
                id="description"
                value={config.description}
                onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                placeholder="スケジュールの説明を入力"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">開催日</Label>
              <Input
                id="startDate"
                type="date"
                value={config.startDate}
                onChange={(e) => setConfig(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
          </div>

          {/* 配置戦略 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>配置戦略</Label>
              <Select
                value={config.strategy}
                onValueChange={(value) => 
                  setConfig(prev => ({ 
                    ...prev, 
                    strategy: value as 'balanced' | 'sequential' | 'random' 
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balanced">バランス配置</SelectItem>
                  <SelectItem value="sequential">順次配置</SelectItem>
                  <SelectItem value="random">ランダム配置</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {getStrategyDescription(config.strategy)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="breakDuration">試合間休憩時間（分）</Label>
              <Input
                id="breakDuration"
                type="number"
                min="0"
                max="60"
                step="5"
                value={config.breakDuration}
                onChange={(e) => setConfig(prev => ({ ...prev, breakDuration: Number(e.target.value) }))}
              />
            </div>
          </div>

          {/* 詳細設定 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>優先コート（任意）</Label>
              <div className="flex flex-wrap gap-2">
                {settings.courts.map((court) => {
                  const isSelected = config.preferences.preferredCourts?.includes(court);
                  return (
                    <Badge
                      key={court}
                      variant={isSelected ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const current = config.preferences.preferredCourts || [];
                        const updated = isSelected
                          ? current.filter(c => c !== court)
                          : [...current, court];
                        setConfig(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, preferredCourts: updated }
                        }));
                      }}
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      {court}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>除外時間枠（任意）</Label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {settings.timeSlots.map((timeSlot) => {
                  const isSelected = config.preferences.avoidTimeSlots?.includes(timeSlot);
                  return (
                    <Badge
                      key={timeSlot}
                      variant={isSelected ? "destructive" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const current = config.preferences.avoidTimeSlots || [];
                        const updated = isSelected
                          ? current.filter(t => t !== timeSlot)
                          : [...current, timeSlot];
                        setConfig(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, avoidTimeSlots: updated }
                        }));
                      }}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {timeSlot}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 統計情報 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">配置統計</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">未配置試合:</span>
                <Badge variant="outline">{unscheduledMatches.length}試合</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">利用可能枠:</span>
                <Badge variant="outline">{totalSlots}枠</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">配置可能:</span>
                <Badge variant={canAutoSchedule ? "default" : "destructive"}>
                  {canAutoSchedule ? "可能" : "不可能"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {!canAutoSchedule && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">
                スケジュール枠が不足しています。設定でコート数や時間枠を増やしてください。
              </p>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              キャンセル
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!canAutoSchedule}
              className="flex-1"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              自動配置を実行
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}