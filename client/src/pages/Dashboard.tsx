import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import {
  Brain,
  GraduationCap,
  Users,
  Briefcase,
  Plus,
  CheckCircle2,
  Circle,
  Flame,
  Star,
  Trophy,
  Zap,
  Settings,
  LogOut,
  ChevronDown,
  Trash2,
  Pencil,
  Loader2,
  Sparkles,
  Target,
  ChevronRight,
  Wand2,
  Mic,
  MicOff,
  CalendarClock,
  AlertCircle,
} from "lucide-react";
import { getLoginUrl } from "@/const";
import { useVoiceInput } from "@/hooks/useVoiceInput";

type Role = "student" | "parent" | "professional";
type Mode = "cheeky" | "positive" | "literal";
type Priority = "low" | "medium" | "high";
type EnergyRequired = "low" | "medium" | "high";

interface Task {
  id: number;
  title: string;
  notes?: string | null;
  roleContext: string;
  status: string;
  priority: Priority;
  energyRequired: EnergyRequired;
  dueDate?: string | null;
  xpReward: number;
  steps?: { id: string; text: string; done: boolean }[] | null;
}

const ROLE_CONFIG: Record<Role, { icon: React.ElementType; label: string; color: string; bg: string; tagline: string }> = {
  student: {
    icon: GraduationCap,
    label: "Student",
    color: "text-violet-600",
    bg: "bg-violet-100",
    tagline: "One step at a time.",
  },
  parent: {
    icon: Users,
    label: "Parent",
    color: "text-rose-600",
    bg: "bg-rose-100",
    tagline: "You're doing great.",
  },
  professional: {
    icon: Briefcase,
    label: "Professional",
    color: "text-indigo-600",
    bg: "bg-indigo-100",
    tagline: "Stay in the zone.",
  },
};

const MODE_MESSAGES: Record<Mode, { empty: string; complete: string; streak: string }> = {
  cheeky: {
    empty: "Wow, look at that empty list. Either you're a productivity god, or you're in denial. Add something.",
    complete: "Look at you, actually doing the thing! Your future self is mildly impressed.",
    streak: "You've been showing up. Honestly didn't think you had it in you. Proud of you though.",
  },
  positive: {
    empty: "Your task list is clear! Add something you want to accomplish today — every journey starts with one step.",
    complete: "Amazing work! You completed a task! Every single win counts, and this one absolutely does.",
    streak: "You've been showing up consistently. That's the real superpower — keep going!",
  },
  literal: {
    empty: "No tasks found. To add a task: click the 'Add Task' button. Enter a title. Click Save.",
    complete: "Task status changed to: Done. XP has been added to your account.",
    streak: "Current streak: active. You have completed tasks on consecutive days.",
  },
};

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; dot: string }> = {
  high: { label: "High", color: "text-rose-600 bg-rose-50 border-rose-200", dot: "bg-rose-500" },
  medium: { label: "Medium", color: "text-amber-600 bg-amber-50 border-amber-200", dot: "bg-amber-500" },
  low: { label: "Low", color: "text-green-600 bg-green-50 border-green-200", dot: "bg-green-500" },
};

// ─── Due-date chip helper ────────────────────────────────────────────────────
type DueDateStatus = "overdue" | "today" | "tomorrow" | null;

function getDueDateStatus(dueDate: string | null | undefined): DueDateStatus {
  if (!dueDate) return null;
  // Get today and tomorrow in the user's local timezone as YYYY-MM-DD
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  const today = fmt(new Date());
  const tomorrow = fmt(new Date(Date.now() + 86_400_000));
  if (dueDate < today) return "overdue";
  if (dueDate === today) return "today";
  if (dueDate === tomorrow) return "tomorrow";
  return null;
}

const DUE_CHIP: Record<
  Exclude<DueDateStatus, null>,
  { label: string; className: string; icon: React.ElementType }
> = {
  overdue: {
    label: "Overdue",
    className:
      "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
    icon: AlertCircle,
  },
  today: {
    label: "Due Today",
    className:
      "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
    icon: CalendarClock,
  },
  tomorrow: {
    label: "Due Tomorrow",
    className:
      "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    icon: CalendarClock,
  },
};

const ENERGY_CONFIG: Record<EnergyRequired, { label: string; icon: string }> = {
  high: { label: "High energy", icon: "⚡" },
  medium: { label: "Medium energy", icon: "🔋" },
  low: { label: "Low energy", icon: "🌿" },
};

function xpForLevel(level: number): number {
  return level * 100;
}

function xpProgress(xp: number, level: number): number {
  let threshold = 0;
  for (let l = 1; l < level; l++) threshold += xpForLevel(l);
  const needed = xpForLevel(level);
  const current = xp - threshold;
  return Math.min((current / needed) * 100, 100);
}

export default function Dashboard() {
  const { user: authUser, loading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [filter, setFilter] = useState<"all" | "todo" | "done" | "week">("all");
  const [dueDatePopoverTaskId, setDueDatePopoverTaskId] = useState<number | null>(null);
  const [xpFlash, setXpFlash] = useState<number | null>(null);
  const [expandingTaskId, setExpandingTaskId] = useState<number | null>(null);
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<number>>(new Set());

  // Voice input for task title
  const voice = useVoiceInput({
    onTranscript: (text) => setNewTitle((prev) => (prev ? `${prev} ${text}` : text)),
  });

  const voiceNotes = useVoiceInput({
    onTranscript: (text) => setNewNotes((prev) => (prev ? `${prev} ${text}` : text)),
  });

  // New task form state
  const [newTitle, setNewTitle] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("medium");
  const [newEnergy, setNewEnergy] = useState<EnergyRequired>("medium");
  const [newDueDate, setNewDueDate] = useState("");

  const utils = trpc.useUtils();

  // Queries
  const { data: profile, isLoading: profileLoading } = trpc.user.getProfile.useQuery(undefined, {
    enabled: !!authUser,
  });

  const activeRole = (profile?.activeRole ?? "professional") as Role;
  const personalityMode = (profile?.personalityMode ?? "positive") as Mode;

  const { data: tasks = [], isLoading: tasksLoading } = trpc.tasks.list.useQuery(
    { roleContext: activeRole },
    { enabled: !!authUser }
  );

  const { data: achievements = [] } = trpc.achievements.list.useQuery(undefined, {
    enabled: !!authUser,
  });

  // Mutations
  const createTask = trpc.tasks.create.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
      setShowAddTask(false);
      resetForm();
      toast.success("Task added!");
    },
    onError: () => toast.error("Failed to add task"),
  });

  const completeTask = trpc.tasks.complete.useMutation({
    onMutate: async ({ id }) => {
      await utils.tasks.list.cancel();
      const prev = utils.tasks.list.getData({ roleContext: activeRole });
      utils.tasks.list.setData({ roleContext: activeRole }, (old) =>
        old?.map((t) => t.id === id ? { ...t, status: "done" } : t)
      );
      return { prev };
    },
    onSuccess: (data) => {
      utils.tasks.list.invalidate();
      utils.user.getProfile.invalidate();
      utils.achievements.list.invalidate();
      if (data.xpGained) {
        setXpFlash(data.xpGained);
        setTimeout(() => setXpFlash(null), 2000);
        toast.success(MODE_MESSAGES[personalityMode].complete, { duration: 3000 });
      }
      if (data.newAchievements?.length) {
        data.newAchievements.forEach((slug: string) => {
          const ach = achievements.find((a: { slug: string }) => a.slug === slug);
          if (ach) toast.success(`🏆 Achievement unlocked: ${ach.title}!`, { duration: 5000 });
        });
      }
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev) utils.tasks.list.setData({ roleContext: activeRole }, ctx.prev);
      toast.error("Failed to complete task");
    },
  });

  const deleteTask = trpc.tasks.delete.useMutation({
    onMutate: async ({ id }) => {
      await utils.tasks.list.cancel();
      const prev = utils.tasks.list.getData({ roleContext: activeRole });
      utils.tasks.list.setData({ roleContext: activeRole }, (old) =>
        old?.filter((t) => t.id !== id)
      );
      return { prev };
    },
    onSuccess: () => {
      utils.tasks.list.invalidate();
      toast.success("Task removed");
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev) utils.tasks.list.setData({ roleContext: activeRole }, ctx.prev);
      toast.error("Failed to delete task");
    },
  });

  const expandTask = trpc.tasks.expand.useMutation({
    onMutate: ({ taskId }) => setExpandingTaskId(taskId),
    onSuccess: (data, variables) => {
      utils.tasks.list.invalidate();
      setExpandingTaskId(null);
      setExpandedTaskIds((prev) => new Set(Array.from(prev).concat(variables.taskId)));
      toast.success(`Broken into ${data.steps.length} steps!`);
    },
    onError: () => {
      setExpandingTaskId(null);
      toast.error("Couldn't generate steps. Try again.");
    },
  });

  const toggleStep = trpc.tasks.toggleStep.useMutation({
    onMutate: async ({ taskId, stepId, done }) => {
      await utils.tasks.list.cancel();
      const prev = utils.tasks.list.getData({ roleContext: activeRole });
      utils.tasks.list.setData({ roleContext: activeRole }, (old) =>
        old?.map((t) =>
          t.id === taskId
            ? {
                ...t,
                steps: (t.steps ?? []).map((s: { id: string; text: string; done: boolean }) =>
                  s.id === stepId ? { ...s, done } : s
                ),
              }
            : t
        )
      );
      return { prev };
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev) utils.tasks.list.setData({ roleContext: activeRole }, ctx.prev);
      toast.error("Couldn't update step");
    },
    onSettled: () => utils.tasks.list.invalidate(),
  });

  // Edit task state
  const [editTitle, setEditTitle] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editPriority, setEditPriority] = useState<Priority>("medium");
  const [editEnergy, setEditEnergy] = useState<EnergyRequired>("medium");
  const [editDueDate, setEditDueDate] = useState("");

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditNotes(task.notes ?? "");
    setEditPriority(task.priority);
    setEditEnergy(task.energyRequired);
    setEditDueDate(task.dueDate ?? "");
  };

  const closeEditDialog = () => {
    setEditingTask(null);
    setEditTitle("");
    setEditNotes("");
    setEditPriority("medium");
    setEditEnergy("medium");
    setEditDueDate("");
  };

  const editTask = trpc.tasks.update.useMutation({
    onMutate: async (input) => {
      await utils.tasks.list.cancel();
      const prev = utils.tasks.list.getData({ roleContext: activeRole });
      utils.tasks.list.setData({ roleContext: activeRole }, (old) =>
        old?.map((t) =>
          t.id === input.id
            ? {
                ...t,
                title: input.title ?? t.title,
                notes: input.notes ?? t.notes,
                priority: (input.priority ?? t.priority) as Priority,
                energyRequired: (input.energyRequired ?? t.energyRequired) as EnergyRequired,
                dueDate: input.dueDate !== undefined ? (input.dueDate || null) : t.dueDate,
                xpReward: input.priority === "high" ? 20 : input.priority === "medium" ? 10 : input.priority === "low" ? 5 : t.xpReward,
              }
            : t
        )
      );
      return { prev };
    },
    onSuccess: () => {
      utils.tasks.list.invalidate();
      closeEditDialog();
      toast.success("Task updated!");
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev) utils.tasks.list.setData({ roleContext: activeRole }, ctx.prev);
      toast.error("Failed to update task");
    },
  });

  const handleEditTask = () => {
    if (!editingTask || !editTitle.trim()) return;
    editTask.mutate({
      id: editingTask.id,
      title: editTitle.trim(),
      notes: editNotes || undefined,
      priority: editPriority,
      energyRequired: editEnergy,
      dueDate: editDueDate || "",
    });
  };

  const updateDueDate = trpc.tasks.update.useMutation({
    onMutate: async ({ id, dueDate }) => {
      await utils.tasks.list.cancel();
      const prev = utils.tasks.list.getData({ roleContext: activeRole });
      utils.tasks.list.setData({ roleContext: activeRole }, (old) =>
        old?.map((t) => t.id === id ? { ...t, dueDate: dueDate ?? null } : t)
      );
      return { prev };
    },
    onSuccess: () => {
      utils.tasks.list.invalidate();
      setDueDatePopoverTaskId(null);
      toast.success("Due date updated");
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev) utils.tasks.list.setData({ roleContext: activeRole }, ctx.prev);
      toast.error("Failed to update due date");
    },
  });

  const updateSettings = trpc.user.updateSettings.useMutation({
    onSuccess: () => {
      utils.user.getProfile.invalidate();
      utils.tasks.list.invalidate();
      setShowSettings(false);
      toast.success("Settings updated");
    },
  });

  const resetForm = () => {
    setNewTitle("");
    setNewNotes("");
    setNewPriority("medium");
    setNewEnergy("medium");
    setNewDueDate("");
  };

  const handleAddTask = () => {
    if (!newTitle.trim()) return;
    createTask.mutate({
      title: newTitle.trim(),
      notes: newNotes || undefined,
      roleContext: activeRole,
      priority: newPriority,
      energyRequired: newEnergy,
      dueDate: newDueDate || undefined,
    });
  };

  const handleRoleSwitch = (role: Role) => {
    updateSettings.mutate({ activeRole: role });
  };

  // Auto-detect and silently save timezone when profile first loads
  // Only updates if the stored timezone is still the default "UTC"
  useEffect(() => {
    if (!profile) return;
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const stored = (profile as typeof profile & { timezone?: string }).timezone ?? "UTC";
    if (detected && detected !== stored) {
      updateSettings.mutate({ timezone: detected });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]); // Run once when profile first loads (profile.id stable)

  // Auth guard
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Brain className="mx-auto text-primary" size={48} />
          <h1 className="text-2xl font-bold text-foreground">Sign in to Get It Done!</h1>
          <Button onClick={() => (window.location.href = getLoginUrl())} size="lg">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (profile && !profile.onboardingComplete) {
    setLocation("/onboarding");
    return null;
  }

  const roleConfig = ROLE_CONFIG[activeRole];
  const RoleIcon = roleConfig.icon;

  // ─── Urgency sort weight ────────────────────────────────────────────────────
  // Overdue=0, Today=1, Tomorrow=2, This week=3, Future/no date=4, Done=5
  function urgencyWeight(task: Task): number {
    if (task.status === "done") return 5;
    const status = getDueDateStatus(task.dueDate);
    if (status === "overdue") return 0;
    if (status === "today") return 1;
    if (status === "tomorrow") return 2;
    if (task.dueDate) {
      const fmt = (d: Date) =>
        new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
      const weekEnd = fmt(new Date(Date.now() + 7 * 86_400_000));
      if (task.dueDate <= weekEnd) return 3;
      return 4;
    }
    return 4;
  }

  // ─── "Due this week" boundary ────────────────────────────────────────────────
  function isDueThisWeek(task: Task): boolean {
    if (!task.dueDate || task.status === "done") return false;
    const fmt = (d: Date) =>
      new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
    const today = fmt(new Date());
    const weekEnd = fmt(new Date(Date.now() + 7 * 86_400_000));
    return task.dueDate >= today && task.dueDate <= weekEnd;
  }

  const filteredTasks = (tasks as Task[])
    .filter((t) => {
      if (filter === "todo") return t.status !== "done";
      if (filter === "done") return t.status === "done";
      if (filter === "week") return isDueThisWeek(t);
      return true;
    })
    .sort((a, b) => urgencyWeight(a) - urgencyWeight(b));

  const todoCount = (tasks as Task[]).filter((t) => t.status !== "done").length;
  const doneCount = (tasks as Task[]).filter((t) => t.status === "done").length;
  const currentXpProgress = profile ? xpProgress(profile.xp, profile.level) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Top navigation */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Brain className="text-primary-foreground" size={16} />
            </div>
            <span className="font-bold text-foreground">Get It Done!</span>
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
                  onClick={() => handleRoleSwitch(role)}
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
            {/* XP flash */}
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
              onClick={logout}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column: Stats */}
          <div className="space-y-4">
            {/* User card */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl ${roleConfig.bg} flex items-center justify-center`}>
                  <RoleIcon className={roleConfig.color} size={24} />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{authUser.name || "User"}</p>
                  <p className={`text-sm ${roleConfig.color} font-medium`}>{roleConfig.tagline}</p>
                </div>
              </div>

              {/* Level & XP */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Star size={14} className="text-amber-500" /> Level {profile?.level ?? 1}
                  </span>
                  <span className="text-muted-foreground">{profile?.xp ?? 0} XP</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full transition-all duration-700"
                    style={{ width: `${currentXpProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Streak card */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="text-orange-500" size={20} />
                <span className="font-semibold text-foreground">Streak</span>
              </div>
              <div className="text-4xl font-bold text-foreground mb-1">
                {profile?.currentStreak ?? 0}
                <span className="text-lg font-normal text-muted-foreground ml-1">days</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Best: {profile?.longestStreak ?? 0} days
              </p>
              {(profile?.currentStreak ?? 0) > 0 && (
                <p className="text-sm text-orange-600 font-medium mt-2">
                  {MODE_MESSAGES[personalityMode].streak}
                </p>
              )}
            </div>

            {/* Achievements */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="text-amber-500" size={20} />
                <span className="font-semibold text-foreground">Achievements</span>
                <Badge variant="secondary" className="ml-auto">{achievements.length}</Badge>
              </div>
              {achievements.length === 0 ? (
                <p className="text-sm text-muted-foreground">Complete tasks to unlock achievements!</p>
              ) : (
                <div className="space-y-2">
                  {achievements.slice(0, 4).map((ach: { id: number; slug: string; icon?: string; title?: string; description?: string }) => (
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
          </div>

          {/* Right column: Tasks */}
          <div className="lg:col-span-2 space-y-4">
            {/* Task header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {roleConfig.label} Tasks
                </h1>
                <p className="text-sm text-muted-foreground">
                  {todoCount} to do · {doneCount} done
                </p>
              </div>
              <Button onClick={() => setShowAddTask(true)} className="gap-2">
                <Plus size={16} /> Add Task
              </Button>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 flex-wrap">
              {([
                { id: "all", label: "All" },
                { id: "todo", label: "To Do" },
                { id: "week", label: "This Week" },
                { id: "done", label: "Done" },
              ] as const).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    filter === f.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Task list */}
            {tasksLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-muted-foreground" size={24} />
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-10 text-center">
                <Target className="mx-auto text-muted-foreground mb-4" size={40} />
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  {filter === "done"
                    ? "No completed tasks yet. Go get something done!"
                    : MODE_MESSAGES[personalityMode].empty}
                </p>
                  {filter !== "done" && filter !== "week" && (
                  <Button onClick={() => setShowAddTask(true)} variant="outline" className="mt-4 gap-2">
                    <Plus size={14} /> Add your first task
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => {
                  const isDone = task.status === "done";
                  const priorityCfg = PRIORITY_CONFIG[task.priority as Priority];
                  const energyCfg = ENERGY_CONFIG[task.energyRequired as EnergyRequired];
                  return (
                    <div
                      key={task.id}
                      className={`bg-card border rounded-2xl p-4 transition-all duration-200 group ${
                        isDone ? "border-border opacity-60" : "border-border hover:border-primary/30 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Complete button */}
                        <button
                          onClick={() => !isDone && completeTask.mutate({ id: task.id })}
                          disabled={isDone || completeTask.isPending}
                          className={`mt-0.5 shrink-0 transition-all ${isDone ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                        >
                          {isDone ? (
                            <CheckCircle2 size={22} className="text-primary" />
                          ) : (
                            <Circle size={22} />
                          )}
                        </button>

                        {/* Task content */}
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-foreground ${isDone ? "line-through text-muted-foreground" : ""}`}>
                            {task.title}
                          </p>
                          {task.notes && (
                            <p className="text-sm text-muted-foreground mt-0.5 truncate">{task.notes}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${priorityCfg.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${priorityCfg.dot}`} />
                              {priorityCfg.label}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {energyCfg.icon} {energyCfg.label}
                            </span>
                            {task.dueDate && (() => {
                              const status = getDueDateStatus(task.dueDate);
                              if (status && !isDone) {
                                const chip = DUE_CHIP[status];
                                const ChipIcon = chip.icon;
                                return (
                                  <span className={chip.className}>
                                    <ChipIcon size={11} />
                                    {chip.label}
                                  </span>
                                );
                              }
                              // For future dates or completed tasks, show plain date
                              return (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <CalendarClock size={11} />
                                  {task.dueDate}
                                </span>
                              );
                            })()}
                            <span className="text-xs text-amber-600 font-medium ml-auto">
                              +{task.xpReward} XP
                            </span>
                          </div>
                        </div>

                        {/* Inline due-date popover */}
                        {!isDone && (
                          <Popover
                            open={dueDatePopoverTaskId === task.id}
                            onOpenChange={(open) =>
                              setDueDatePopoverTaskId(open ? task.id : null)
                            }
                          >
                            <PopoverTrigger asChild>
                              <button
                                title="Change due date"
                                className="mt-0.5 shrink-0 p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <CalendarClock size={15} />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                              <div className="p-2 border-b border-border flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground px-1">Set due date</span>
                                {task.dueDate && (
                                  <button
                                    onClick={() =>
                                      updateDueDate.mutate({ id: task.id, dueDate: "" })
                                    }
                                    className="text-xs text-destructive hover:underline px-1"
                                  >
                                    Clear
                                  </button>
                                )}
                              </div>
                              <Calendar
                                mode="single"
                                selected={
                                  task.dueDate
                                    ? new Date(task.dueDate + "T12:00:00")
                                    : undefined
                                }
                                onSelect={(date) => {
                                  if (!date) return;
                                  const iso = new Intl.DateTimeFormat("en-CA", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                  }).format(date);
                                  updateDueDate.mutate({ id: task.id, dueDate: iso });
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        )}

                        {/* Actions */}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          {!isDone && (
                            <button
                              onClick={() => expandTask.mutate({
                                taskId: task.id,
                                title: task.title,
                                notes: task.notes ?? undefined,
                                role: task.roleContext as "student" | "parent" | "professional" | "all",
                              })}
                              disabled={expandingTaskId === task.id}
                              title="AI: Break into steps"
                              className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                            >
                              {expandingTaskId === task.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Wand2 size={14} />
                              )}
                            </button>
                          )}
                          {!isDone && (
                            <button
                              onClick={() => openEditDialog(task)}
                              title="Edit task"
                              className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Pencil size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteTask.mutate({ id: task.id })}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* AI-generated micro-steps */}
                      {task.steps && task.steps.length > 0 && (
                        <div className="mt-3 ml-8">
                          <button
                            onClick={() => setExpandedTaskIds((prev) => {
                              const arr = Array.from(prev);
                              if (prev.has(task.id)) {
                                return new Set(arr.filter(id => id !== task.id));
                              }
                              return new Set(arr.concat(task.id));
                            })}
                            className="flex items-center gap-1 text-xs text-primary font-medium mb-2 hover:opacity-80 transition-opacity"
                          >
                            <ChevronRight
                              size={12}
                              className={`transition-transform ${expandedTaskIds.has(task.id) ? "rotate-90" : ""}`}
                            />
                            {task.steps.filter(s => s.done).length}/{task.steps.length} steps done
                          </button>
                          {expandedTaskIds.has(task.id) && (
                            <div className="space-y-1.5 border-l-2 border-primary/20 pl-3">
                              {task.steps.map((step) => (
                                <button
                                  key={step.id}
                                  onClick={() => toggleStep.mutate({
                                    taskId: task.id,
                                    stepId: step.id,
                                    done: !step.done,
                                  })}
                                  className="flex items-start gap-2 text-sm w-full text-left group/step hover:bg-primary/5 rounded-md px-1 py-0.5 transition-colors"
                                >
                                  <span className={`shrink-0 mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                    step.done
                                      ? "bg-primary border-primary text-primary-foreground"
                                      : "border-border group-hover/step:border-primary/50"
                                  }`}>
                                    {step.done && (
                                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                        <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    )}
                                  </span>
                                  <span className={`leading-snug ${
                                    step.done ? "line-through text-muted-foreground" : "text-foreground"
                                  }`}>
                                    {step.text}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Task Dialog */}
      <Dialog open={showAddTask} onOpenChange={(open) => { setShowAddTask(open); if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles size={18} className="text-primary" />
              Add a Task
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder={
                      voice.isRecording
                        ? "Listening…"
                        : voice.isProcessing
                        ? "Transcribing…"
                        : "What needs to get done?"
                    }
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                    disabled={voice.isProcessing}
                    className={`text-base ${voice.isRecording ? "border-primary ring-1 ring-primary/30" : ""}`}
                    autoFocus
                  />
                  {voice.isRecording && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-0.5">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-0.5 h-3 bg-primary rounded-full animate-pulse"
                          style={{ animationDelay: `${i * 150}ms` }}
                        />
                      ))}
                    </span>
                  )}
                </div>
                {voice.isSupported && (
                  <button
                    type="button"
                    onClick={() => voice.toggle()}
                    disabled={voice.isProcessing}
                    title={voice.isRecording ? "Stop recording" : "Dictate task title"}
                    className={`p-2 rounded-xl border transition-all shrink-0 ${
                      voice.isRecording
                        ? "bg-primary text-primary-foreground border-primary"
                        : voice.isProcessing
                        ? "bg-muted text-muted-foreground border-border cursor-not-allowed"
                        : "border-border text-muted-foreground hover:text-primary hover:border-primary/40 bg-transparent"
                    }`}
                  >
                    {voice.isProcessing ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : voice.isRecording ? (
                      <MicOff size={16} />
                    ) : (
                      <Mic size={16} />
                    )}
                  </button>
                )}
              </div>
            </div>
            <div>
              <div className="relative">
                <Textarea
                  placeholder={
                    voiceNotes.isRecording
                      ? "Listening…"
                      : voiceNotes.isProcessing
                      ? "Transcribing…"
                      : "Notes (optional)"
                  }
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={2}
                  disabled={voiceNotes.isProcessing}
                  className={`resize-none pr-8 ${voiceNotes.isRecording ? "border-primary ring-1 ring-primary/30" : ""}`}
                />
                {voiceNotes.isSupported && (
                  <button
                    type="button"
                    onClick={() => voiceNotes.toggle()}
                    disabled={voiceNotes.isProcessing}
                    title={voiceNotes.isRecording ? "Stop recording" : "Dictate notes"}
                    className={`absolute right-2 top-2 p-1 rounded-md transition-colors ${
                      voiceNotes.isRecording
                        ? "text-primary"
                        : voiceNotes.isProcessing
                        ? "text-muted-foreground cursor-not-allowed"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {voiceNotes.isProcessing ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : voiceNotes.isRecording ? (
                      <MicOff size={14} />
                    ) : (
                      <Mic size={14} />
                    )}
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Priority</label>
                <Select value={newPriority} onValueChange={(v) => setNewPriority(v as Priority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Energy needed</label>
                <Select value={newEnergy} onValueChange={(v) => setNewEnergy(v as EnergyRequired)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🌿 Low</SelectItem>
                    <SelectItem value="medium">🔋 Medium</SelectItem>
                    <SelectItem value="high">⚡ High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Due date (optional)</label>
              <Input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setShowAddTask(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleAddTask} disabled={!newTitle.trim() || createTask.isPending} className="gap-2">
              {createTask.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={(open) => { if (!open) closeEditDialog(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil size={18} className="text-primary" />
              Edit Task
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Input
                placeholder="Task title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEditTask()}
                className="text-base"
                autoFocus
              />
            </div>
            <div>
              <Textarea
                placeholder="Notes (optional)"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Priority</label>
                <Select value={editPriority} onValueChange={(v) => setEditPriority(v as Priority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Energy needed</label>
                <Select value={editEnergy} onValueChange={(v) => setEditEnergy(v as EnergyRequired)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🌿 Low</SelectItem>
                    <SelectItem value="medium">🔋 Medium</SelectItem>
                    <SelectItem value="high">⚡ High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Due date (optional)</label>
              <Input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeEditDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleEditTask}
              disabled={!editTitle.trim() || editTask.isPending}
              className="gap-2"
            >
              {editTask.isPending ? <Loader2 size={14} className="animate-spin" /> : <Pencil size={14} />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Motivation Style</label>
              <div className="space-y-2">
                {(["cheeky", "positive", "literal"] as Mode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => updateSettings.mutate({ personalityMode: mode })}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all capitalize font-medium text-sm ${
                      personalityMode === mode
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {mode === "cheeky" ? "😏 Cheeky" : mode === "positive" ? "💛 Positive" : "📋 Literal"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowSettings(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
