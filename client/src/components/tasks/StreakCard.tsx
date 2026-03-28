import { Flame } from "lucide-react";
import { MODE_MESSAGES, type Mode } from "@/types/dashboard";

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  personalityMode: Mode;
}

export default function StreakCard({ currentStreak, longestStreak, personalityMode }: StreakCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="text-orange-500" size={20} />
        <span className="font-semibold text-foreground">Streak</span>
      </div>
      <div className="text-4xl font-bold text-foreground mb-1">
        {currentStreak}
        <span className="text-lg font-normal text-muted-foreground ml-1">days</span>
      </div>
      <p className="text-sm text-muted-foreground">Best: {longestStreak} days</p>
      {currentStreak > 0 && (
        <p className="text-sm text-orange-600 font-medium mt-2">
          {MODE_MESSAGES[personalityMode].streak}
        </p>
      )}
    </div>
  );
}
