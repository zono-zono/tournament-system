import { ScheduleConfig } from "@/components/create-schedule-form";
import { ScheduleSettings } from "@/components/schedule-settings-form";

export interface MatchAssignment {
  matchId: string;
  timeSlot: string;
  court: string;
  scheduled_time: string;
  scheduled_date: string;
  venue: string;
}

export class ScheduleOptimizer {
  private settings: ScheduleSettings;
  private config: ScheduleConfig;
  private matches: any[];

  constructor(settings: ScheduleSettings, config: ScheduleConfig, matches: any[]) {
    this.settings = settings;
    this.config = config;
    this.matches = matches;
  }

  /**
   * メインの自動配置メソッド
   */
  public generateSchedule(): MatchAssignment[] {
    console.log('スケジュール生成開始:', {
      strategy: this.config.strategy,
      matches: this.matches.length,
      settings: this.settings
    });
    
    const result = (() => {
      switch (this.config.strategy) {
        case 'balanced':
          return this.balancedScheduling();
        case 'sequential':
          return this.sequentialScheduling();
        case 'random':
          return this.randomScheduling();
        default:
          return this.balancedScheduling();
      }
    })();
    
    console.log('生成結果:', result);
    return result;
  }

  /**
   * バランス配置: コートと時間を均等に使用
   */
  private balancedScheduling(): MatchAssignment[] {
    const assignments: MatchAssignment[] = [];
    const availableSlots = this.getAvailableSlots();
    
    // ラウンド順に試合をソート
    const sortedMatches = [...this.matches].sort((a, b) => {
      if (a.round_number !== b.round_number) {
        return a.round_number - b.round_number;
      }
      return a.match_number_in_round - b.match_number_in_round;
    });

    let slotIndex = 0;
    
    for (const match of sortedMatches) {
      if (slotIndex >= availableSlots.length) break;
      
      const slot = availableSlots[slotIndex];
      assignments.push({
        matchId: match.id,
        timeSlot: slot.timeSlot,
        court: slot.court,
        scheduled_time: this.createDateTime(slot.timeSlot),
        scheduled_date: this.config.startDate,
        venue: slot.court
      });
      
      slotIndex++;
    }

    return assignments;
  }

  /**
   * 順次配置: ラウンドごとに連続配置
   */
  private sequentialScheduling(): MatchAssignment[] {
    const assignments: MatchAssignment[] = [];
    const availableSlots = this.getAvailableSlots();
    
    // ラウンドごとにグループ化
    const matchesByRound = this.groupMatchesByRound();
    
    let slotIndex = 0;
    
    for (const [round, roundMatches] of matchesByRound.entries()) {
      const courtsPerTimeSlot = this.settings.courts.length;
      const requiredSlots = Math.ceil(roundMatches.length / courtsPerTimeSlot);
      
      // 同じ時間枠内にできるだけ多くの試合を配置
      for (let timeSlotOffset = 0; timeSlotOffset < requiredSlots; timeSlotOffset++) {
        for (let courtIndex = 0; courtIndex < courtsPerTimeSlot; courtIndex++) {
          const matchIndex = timeSlotOffset * courtsPerTimeSlot + courtIndex;
          if (matchIndex >= roundMatches.length) break;
          
          const slotIndexToUse = slotIndex + timeSlotOffset * courtsPerTimeSlot + courtIndex;
          if (slotIndexToUse >= availableSlots.length) break;
          
          const slot = availableSlots[slotIndexToUse];
          const match = roundMatches[matchIndex];
          
          assignments.push({
            matchId: match.id,
            timeSlot: slot.timeSlot,
            court: slot.court,
            scheduled_time: this.createDateTime(slot.timeSlot),
            scheduled_date: this.config.startDate,
            venue: slot.court
          });
        }
      }
      
      slotIndex += requiredSlots * courtsPerTimeSlot;
      if (slotIndex >= availableSlots.length) break;
    }

    return assignments;
  }

  /**
   * ランダム配置
   */
  private randomScheduling(): MatchAssignment[] {
    const assignments: MatchAssignment[] = [];
    const availableSlots = [...this.getAvailableSlots()];
    
    // Fisher-Yates shuffle
    for (let i = availableSlots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableSlots[i], availableSlots[j]] = [availableSlots[j], availableSlots[i]];
    }
    
    for (let i = 0; i < Math.min(this.matches.length, availableSlots.length); i++) {
      const match = this.matches[i];
      const slot = availableSlots[i];
      
      assignments.push({
        matchId: match.id,
        timeSlot: slot.timeSlot,
        court: slot.court,
        scheduled_time: this.createDateTime(slot.timeSlot),
        scheduled_date: this.config.startDate,
        venue: slot.court
      });
    }

    return assignments;
  }

  /**
   * 利用可能なスロットを取得
   */
  private getAvailableSlots(): Array<{ timeSlot: string; court: string }> {
    const slots: Array<{ timeSlot: string; court: string }> = [];
    
    // 優先コートがある場合は優先、なければ全コート
    const courtsToUse = this.config.preferences.preferredCourts?.length 
      ? this.config.preferences.preferredCourts 
      : this.settings.courts;
    
    // 除外時間枠を考慮
    const timeSlotsToUse = this.settings.timeSlots.filter(
      slot => !this.config.preferences.avoidTimeSlots?.includes(slot)
    );
    
    for (const timeSlot of timeSlotsToUse) {
      for (const court of courtsToUse) {
        slots.push({ timeSlot, court });
      }
    }
    
    return slots;
  }

  /**
   * ラウンドごとに試合をグループ化
   */
  private groupMatchesByRound(): Map<number, any[]> {
    const grouped = new Map<number, any[]>();
    
    for (const match of this.matches) {
      const round = match.round_number;
      if (!grouped.has(round)) {
        grouped.set(round, []);
      }
      grouped.get(round)!.push(match);
    }
    
    // 各ラウンド内でソート
    for (const [round, matches] of grouped.entries()) {
      matches.sort((a, b) => a.match_number_in_round - b.match_number_in_round);
    }
    
    return grouped;
  }

  /**
   * 時間文字列からDateTimeを作成
   */
  private createDateTime(timeSlot: string): string {
    return `${this.config.startDate}T${timeSlot}:00`;
  }
}

/**
 * 自動スケジュール生成のメインファンクション
 */
export function generateAutoSchedule(
  settings: ScheduleSettings,
  config: ScheduleConfig,
  matches: any[]
): MatchAssignment[] {
  const optimizer = new ScheduleOptimizer(settings, config, matches);
  return optimizer.generateSchedule();
}