import { Star } from "lucide-react";
import { ROLE_CONFIG, xpProgress, type Role } from "@/types/dashboard";

interface UserStatsCardProps {
  userName: string;
  activeRole: Role;
  level: number;
  xp: number;
}

export default function UserStatsCard({ userName, activeRole, level, xp }: UserStatsCardProps) {
  const roleConfig = ROLE_CONFIG[activeRole];
  const RoleIcon = roleConfig.icon;
  const progress = xpProgress(xp, level);

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-xl ${roleConfig.bg} flex items-center justify-center`}>
          <RoleIcon className={roleConfig.color} size={24} />
        </div>
        <div>
          <p className="font-semibold text-foreground">{userName || "User"}</p>
          <p className={`text-sm ${roleConfig.color} font-medium`}>{roleConfig.tagline}</p>
        </div>
      </div>

      {/* Level & XP */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <Star size={14} className="text-amber-500" /> Level {level}
          </span>
          <span className="text-muted-foreground">{xp} XP</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
