"use client";

import { useState } from "react";
import { BracketMatch } from "@/lib/tournament-bracket";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface MatchResultDialogProps {
  match: BracketMatch | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (winnerId: string, player1Score?: number, player2Score?: number) => void;
}

export function MatchResultDialog({
  match,
  isOpen,
  onClose,
  onSave
}: MatchResultDialogProps) {
  const [winnerId, setWinnerId] = useState<string>("");
  const [player1Score, setPlayer1Score] = useState<string>("");
  const [player2Score, setPlayer2Score] = useState<string>("");

  const handleSave = () => {
    if (!winnerId) return;
    
    const p1Score = player1Score ? parseInt(player1Score) : undefined;
    const p2Score = player2Score ? parseInt(player2Score) : undefined;
    
    onSave(winnerId, p1Score, p2Score);
    
    // フォームをリセット
    setWinnerId("");
    setPlayer1Score("");
    setPlayer2Score("");
    onClose();
  };

  const handleClose = () => {
    setWinnerId("");
    setPlayer1Score("");
    setPlayer2Score("");
    onClose();
  };

  if (!match) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>試合結果入力</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-lg font-semibold mb-2">
              第{match.matchNumber}試合 ({match.round}回戦)
            </div>
            <div className="text-sm text-gray-600">
              {match.player1?.name} vs {match.player2?.name}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">勝者を選択</Label>
              <RadioGroup value={winnerId} onValueChange={setWinnerId} className="mt-2">
                {match.player1 && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={match.player1.id} id={match.player1.id} />
                    <Label htmlFor={match.player1.id} className="cursor-pointer">
                      {match.player1.name}
                      {match.player1.seed && (
                        <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">
                          シード {match.player1.seed}
                        </span>
                      )}
                    </Label>
                  </div>
                )}
                {match.player2 && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={match.player2.id} id={match.player2.id} />
                    <Label htmlFor={match.player2.id} className="cursor-pointer">
                      {match.player2.name}
                      {match.player2.seed && (
                        <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">
                          シード {match.player2.seed}
                        </span>
                      )}
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="player1Score">
                  {match.player1?.name} のスコア
                </Label>
                <Input
                  id="player1Score"
                  type="number"
                  min="0"
                  value={player1Score}
                  onChange={(e) => setPlayer1Score(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="player2Score">
                  {match.player2?.name} のスコア
                </Label>
                <Input
                  id="player2Score"
                  type="number"
                  min="0"
                  value={player2Score}
                  onChange={(e) => setPlayer2Score(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={!winnerId}>
            結果を保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}