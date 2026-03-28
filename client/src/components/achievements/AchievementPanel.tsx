import { Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Achievement } from "@/types/dashboard";

interface AchievementPanelProps {
  achievements: Achievement[];
}

export default function AchievementPanel({ achievements }: AchievementPanelProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="text-amber-500" size={20} />
        <span className="font-semibold text-foreground">Achievements</span>
        <Badge variant="secondary" className="ml-auto">
          {achievements.length}
        </Badge>
      </div>

      {achievements.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Complete tasks to unlock achievements!
        </p>
      ) : (
        <div className="space-y-2">
          {achievements.slice(0, 4).map((ach) => (
            <div key={ach.id} className="flex items-center gap-2 text-sm">
              <span className="text-lg">{ach.icon ?? "🏅"}</span>
              <div>
                <p className="font-medium text-foreground leading-none">{ach.title ?? ach.slug}</p>
                <p className="text-xs text-muted-foreground">{ach.description}</p>
              </div>
            </div>
          ))}
          {achievements.length > 4 && (
            <p className="text-xs text-muted-foreground">+{achievements.length - 4} more</p>
          )}
        </div>
      )}
    </div>
  );
}
