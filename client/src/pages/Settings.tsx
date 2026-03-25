import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Bell, LogOut, Moon, Settings2, Sparkles, Sun, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";

type Role = "student" | "parent" | "professional";
type PersonalityMode = "cheeky" | "positive" | "literal";

const ROLE_OPTIONS: { value: Role; label: string; description: string; emoji: string }[] = [
  {
    value: "student",
    label: "Student",
    description: "Assignments, deadlines, study sessions, and project planning.",
    emoji: "📚",
  },
  {
    value: "parent",
    label: "Parent / Carer",
    description: "Family logistics, appointments, household tasks, and personal goals.",
    emoji: "🏠",
  },
  {
    value: "professional",
    label: "Professional",
    description: "Work tasks, meetings, emails, and career goals.",
    emoji: "💼",
  },
];

const PERSONALITY_OPTIONS: { value: PersonalityMode; label: string; description: string; example: string }[] = [
  {
    value: "cheeky",
    label: "Cheeky",
    description: "Playful nudges with a bit of humour — never mean, always on your side.",
    example: "\"Okay, that task isn't going to do itself. But hey, neither are you — yet. Let's go!\"",
  },
  {
    value: "positive",
    label: "Positive",
    description: "Warm encouragement that celebrates every win, no matter how small.",
    example: "\"You're doing great! One small step at a time — you've got this.\"",
  },
  {
    value: "literal",
    label: "Literal",
    description: "Clear, direct instructions with no fluff. Just the facts.",
    example: "\"Task: Reply to email. Next step: Open your email app.\"",
  },
];

export default function Settings() {
  const [, navigate] = useLocation();
  const { user: authUser, logout } = useAuth();
  const utils = trpc.useUtils();

  const { data: profile, isLoading } = trpc.user.getProfile.useQuery(undefined, {
    enabled: !!authUser,
  });

  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const [activeRole, setActiveRole] = useState<Role>("professional");
  const [personalityMode, setPersonalityMode] = useState<PersonalityMode>("positive");
  const [reminderTime, setReminderTime] = useState<string>("14:00");
  const [isDirty, setIsDirty] = useState(false);

  // Sync local state when profile loads
  useEffect(() => {
    if (profile) {
      setActiveRole((profile.activeRole as Role) ?? "professional");
      setPersonalityMode((profile.personalityMode as PersonalityMode) ?? "positive");
      setReminderTime((profile as typeof profile & { reminderTime?: string }).reminderTime ?? "14:00");
      setIsDirty(false);
    }
  }, [profile]);

  const updateSettings = trpc.user.updateSettings.useMutation({
    onSuccess: () => {
      utils.user.getProfile.invalidate();
      utils.tasks.list.invalidate();
      setIsDirty(false);
      toast.success("Settings saved!");
    },
    onError: () => toast.error("Couldn't save settings. Please try again."),
  });

  const handleRoleChange = (value: Role) => {
    setActiveRole(value);
    setIsDirty(true);
  };

  const handlePersonalityChange = (value: PersonalityMode) => {
    setPersonalityMode(value);
    setIsDirty(true);
  };

  const handleSave = () => {
    updateSettings.mutate({ activeRole, personalityMode, reminderTime });
  };

  // Format HH:MM to a readable label like "2:00 PM"
  const formatTime = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  // Generate half-hour options for the select
  const timeOptions: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      timeOptions.push({ value, label: formatTime(value) });
    }
  }

  if (!authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Please sign in to access settings.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="Back to Dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              <Settings2 size={20} className="text-primary" />
              <h1 className="text-lg font-semibold text-foreground">Settings</h1>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={!isDirty || updateSettings.isPending}
            size="sm"
            className="min-w-[80px]"
          >
            {updateSettings.isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Account info */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <User size={16} className="text-primary" />
              <CardTitle className="text-base">Account</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-10 bg-muted animate-pulse rounded-lg" />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{profile?.name ?? "—"}</p>
                  <p className="text-sm text-muted-foreground">{profile?.email ?? "No email on file"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary">Level {profile?.level ?? 1}</p>
                  <p className="text-xs text-muted-foreground">{profile?.xp ?? 0} XP total</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Streak Reminder */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-primary" />
              <div>
                <CardTitle className="text-base">Daily Streak Reminder</CardTitle>
                <CardDescription className="text-sm mt-0.5">
                  Choose what time you'd like a nudge if you haven't completed a task yet that day.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select
              value={reminderTime}
              onValueChange={(v) => { setReminderTime(v); setIsDirty(true); }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {timeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              You'll receive a reminder at <strong>{formatTime(reminderTime)}</strong> in your local timezone if your streak is at risk.
            </p>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              {isDark ? <Moon size={16} className="text-primary" /> : <Sun size={16} className="text-primary" />}
              <div>
                <CardTitle className="text-base">Appearance</CardTitle>
                <CardDescription className="text-sm mt-0.5">
                  Choose between light and dark mode. Your preference is saved automatically.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sun size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Light</span>
              </div>
              {/* Toggle switch */}
              <button
                onClick={toggleTheme}
                role="switch"
                aria-checked={isDark}
                aria-label="Toggle dark mode"
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  isDark ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                    isDark ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">Dark</span>
                <Moon size={16} className="text-muted-foreground" />
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground text-center">
              Currently using <strong>{isDark ? "dark" : "light"}</strong> mode
            </p>
          </CardContent>
        </Card>

        {/* Active Role */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">🎭</span>
              <div>
                <CardTitle className="text-base">Active Role</CardTitle>
                <CardDescription className="text-sm mt-0.5">
                  Your role shapes which tasks are shown and how the app organises your day.
                  You can switch roles at any time from the dashboard too.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={activeRole} onValueChange={handleRoleChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className="flex items-center gap-2">
                      <span>{opt.emoji}</span>
                      <span>{opt.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Description of selected role */}
            {(() => {
              const selected = ROLE_OPTIONS.find((o) => o.value === activeRole);
              return selected ? (
                <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                  {selected.emoji} <strong>{selected.label}:</strong> {selected.description}
                </p>
              ) : null;
            })()}
          </CardContent>
        </Card>

        {/* Personality Mode */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              <div>
                <CardTitle className="text-base">Motivation Style</CardTitle>
                <CardDescription className="text-sm mt-0.5">
                  Choose how the app speaks to you — from playful to straight-to-the-point.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={personalityMode} onValueChange={handlePersonalityChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERSONALITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Preview of selected mode */}
            {(() => {
              const selected = PERSONALITY_OPTIONS.find((o) => o.value === personalityMode);
              return selected ? (
                <div className="bg-muted/50 rounded-lg px-3 py-3 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {selected.label} — how it sounds
                  </p>
                  <p className="text-sm text-foreground italic">{selected.example}</p>
                </div>
              ) : null;
            })()}
          </CardContent>
        </Card>

        {/* Unsaved changes banner */}
        {isDirty && (
          <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
            <p className="text-sm text-primary font-medium">You have unsaved changes.</p>
            <Button
              onClick={handleSave}
              disabled={updateSettings.isPending}
              size="sm"
            >
              {updateSettings.isPending ? "Saving…" : "Save now"}
            </Button>
          </div>
        )}

        <Separator />

        {/* Sign out */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Sign out</p>
            <p className="text-sm text-muted-foreground">You can sign back in at any time.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => logout()}
            className="flex items-center gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
          >
            <LogOut size={14} />
            Sign out
          </Button>
        </div>

      </main>
    </div>
  );
}
