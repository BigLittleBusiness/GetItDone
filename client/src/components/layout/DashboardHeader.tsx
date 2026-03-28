import { Brain, Zap, Settings, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { ROLE_CONFIG, type Role } from "@/types/dashboard";

interface DashboardHeaderProps {
  activeRole: Role;
  xpFlash: number | null;
  onRoleSwitch: (role: Role) => void;
  onLogout: () => void;
}

export default function DashboardHeader({
  activeRole,
  xpFlash,
  onRoleSwitch,
  onLogout,
}: DashboardHeaderProps) {
  const [, setLocation] = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Brain className="text-primary-foreground" size={16} />
          </div>
          <span className="font-bold text-foreground">Taskbloom</span>
        </div>

        {/* Role switcher */}
        <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
          {(Object.keys(ROLE_CONFIG) as Role[]).map((role) => {
            const cfg = ROLE_CONFIG[role];
            const Icon = cfg.icon;
            const isActive = activeRole === role;
            return (
              <button
                key={role}
                onClick={() => onRoleSwitch(role)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{cfg.label}</span>
              </button>
            );
          })}
        </div>

        {/* User menu */}
        <div className="flex items-center gap-2">
          {xpFlash && (
            <div className="flex items-center gap-1 text-amber-600 font-bold text-sm animate-bounce">
              <Zap size={14} />+{xpFlash} XP
            </div>
          )}
          <button
            onClick={() => setLocation("/settings")}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            title="Settings"
          >
            <Settings size={18} />
          </button>
          <button
            onClick={onLogout}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
