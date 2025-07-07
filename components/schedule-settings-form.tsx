"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Minus, Settings } from "lucide-react";

export interface ScheduleSettings {
  courts: string[];
  timeSlots: string[];
  startTime: string;
  endTime: string;
  slotDuration: number; // minutes
}

interface ScheduleSettingsFormProps {
  initialSettings?: ScheduleSettings;
  onSettingsChange: (settings: ScheduleSettings) => void;
}

export function ScheduleSettingsForm({ initialSettings, onSettingsChange }: ScheduleSettingsFormProps) {
  const [courts, setCourts] = useState<string[]>(
    initialSettings?.courts || ["第1コート", "第2コート"]
  );
  const [startTime, setStartTime] = useState(initialSettings?.startTime || "09:00");
  const [endTime, setEndTime] = useState(initialSettings?.endTime || "18:00");
  const [slotDuration, setSlotDuration] = useState(initialSettings?.slotDuration || 60);

  const addCourt = () => {
    const newCourtNumber = courts.length + 1;
    setCourts([...courts, `第${newCourtNumber}コート`]);
  };

  const removeCourt = (index: number) => {
    if (courts.length > 1) {
      setCourts(courts.filter((_, i) => i !== index));
    }
  };

  const updateCourt = (index: number, name: string) => {
    const newCourts = [...courts];
    newCourts[index] = name;
    setCourts(newCourts);
  };

  const generateTimeSlots = () => {
    const slots: string[] = [];
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    
    let current = new Date(start);
    while (current < end) {
      slots.push(current.toTimeString().slice(0, 5));
      current.setMinutes(current.getMinutes() + slotDuration);
    }
    
    return slots;
  };

  const applySettings = () => {
    const timeSlots = generateTimeSlots();
    const settings: ScheduleSettings = {
      courts,
      timeSlots,
      startTime,
      endTime,
      slotDuration
    };
    onSettingsChange(settings);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          スケジュール設定
        </CardTitle>
        <CardDescription>
          コート数と時間枠を設定してスケジュール表をカスタマイズできます
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* コート設定 */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">コート設定</Label>
          {courts.map((court, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={court}
                onChange={(e) => updateCourt(index, e.target.value)}
                placeholder={`第${index + 1}コート`}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeCourt(index)}
                disabled={courts.length <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCourt}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            コートを追加
          </Button>
        </div>

        {/* 時間設定 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startTime">開始時間</Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endTime">終了時間</Label>
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slotDuration">枠の長さ（分）</Label>
            <Input
              id="slotDuration"
              type="number"
              min="15"
              max="180"
              step="15"
              value={slotDuration}
              onChange={(e) => setSlotDuration(Number(e.target.value))}
            />
          </div>
        </div>

        {/* プレビュー */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">プレビュー</Label>
          <div className="text-sm text-muted-foreground border rounded p-3">
            <div className="mb-2">
              <strong>コート:</strong> {courts.join(", ")}
            </div>
            <div>
              <strong>時間枠:</strong> {generateTimeSlots().length}枠 
              ({startTime} - {endTime}, {slotDuration}分間隔)
            </div>
          </div>
        </div>

        <Button onClick={applySettings} className="w-full">
          設定を適用
        </Button>
      </CardContent>
    </Card>
  );
}