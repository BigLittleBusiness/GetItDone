import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, Brain, Plus } from "lucide-react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { useVoiceInput } from "@/hooks/useVoiceInput";

// Domain sub-components
import DashboardHeader from "@/components/layout/DashboardHeader";
import UserStatsCard from "@/components/tasks/UserStatsCard";
import StreakCard from "@/components/tasks/StreakCard";
import AchievementPanel from "@/components/achievements/AchievementPanel";
import TaskFilterBar from "@/components/tasks/TaskFilterBar";
import TaskList from "@/components/tasks/TaskList";
import AddTaskDialog from "@/components/tasks/AddTaskDialog";
import EditTaskDialog from "@/components/tasks/EditTaskDialog";
import SettingsDialog from "@/components/shared/SettingsDialog";

// Shared types, constants, and helpers
import {
  ROLE_CONFIG,
  MODE_MESSAGES,
  getDueDateStatus,
  xpProgress,
  type Task,
  type Role,
  type Mode,
  type Priority,
  type EnergyRequired,
} from "@/types/dashboard";
import type { FilterId } from "@/components/tasks/TaskFilterBar";

// ─── Urgency sort helpers (local to orchestrator, not needed in sub-components) ─
function urgencyWeight(task: Task): number {
  if (task.status === "done") return 5;
  const status = getDueDateStatus(task.dueDate);
  if (status === "overdue") return 0;
  if (status === "today") return 1;
  if (status === "tomorrow") return 2;
  if (task.dueDate) {
    const fmt = (d: Date) =>
      new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(d);
    const weekEnd = fmt(new Date(Date.now() + 7 * 86_400_000));
    if (task.dueDate <= weekEnd) return 3;
    return 4;
  }
  return 4;
}

function isDueThisWeek(task: Task): boolean {
  if (!task.dueDate || task.status === "done") return false;
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  const today = fmt(new Date());
  const weekEnd = fmt(new Date(Date.now() + 7 * 86_400_000));
  return task.dueDate >= today && task.dueDate <= weekEnd;
}

export default function Dashboard() {
  const { user: authUser, loading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();

  // ─── UI state ────────────────────────────────────────────────────────────────
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [filter, setFilter] = useState<FilterId>("all");
  const [dueDatePopoverTaskId, setDueDatePopoverTaskId] = useState<number | null>(null);
  const [xpFlash, setXpFlash] = useState<number | null>(null);
  const [expandingTaskId, setExpandingTaskId] = useState<number | null>(null);
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<number>>(new Set());

  // ─── Add-task form state ─────────────────────────────────────────────────────
  const [newTitle, setNewTitle] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("medium");
  const [newEnergy, setNewEnergy] = useState<EnergyRequired>("medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [newRecurrenceType, setNewRecurrenceType] = useState<string>("");
  const [newRecurrenceDays, setNewRecurrenceDays] = useState<string[]>([]);

  // ─── Edit-task form state ────────────────────────────────────────────────────
  const [editTitle, setEditTitle] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editPriority, setEditPriority] = useState<Priority>("medium");
  const [editEnergy, setEditEnergy] = useState<EnergyRequired>("medium");
  const [editDueDate, setEditDueDate] = useState("");
  const [editRecurrenceType, setEditRecurrenceType] = useState<string>("");
  const [editRecurrenceDays, setEditRecurrenceDays] = useState<string[]>([]);

  // ─── Voice input ─────────────────────────────────────────────────────────────
  const voiceTitle = useVoiceInput({
    onTranscript: (text) => setNewTitle((prev) => (prev ? `${prev} ${text}` : text)),
  });
  const voiceNotes = useVoiceInput({
    onTranscript: (text) => setNewNotes((prev) => (prev ? `${prev} ${text}` : text)),
  });

  const utils = trpc.useUtils();

  // ─── Queries ─────────────────────────────────────────────────────────────────
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

  // ─── Mutations ───────────────────────────────────────────────────────────────
  const createTask = trpc.tasks.create.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
      setShowAddTask(false);
      resetAddForm();
      toast.success("Task added!");
    },
    onError: () => toast.error("Failed to add task"),
  });

  const completeTask = trpc.tasks.complete.useMutation({
    onMutate: async ({ id }) => {
      await utils.tasks.list.cancel();
      const prev = utils.tasks.list.getData({ roleContext: activeRole });
      utils.tasks.list.setData({ roleContext: activeRole }, (old) =>
        old?.map((t) => (t.id === id ? { ...t, status: "done" } : t))
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
      utils.tasks.list.setData({ roleContext: activeRole }, (old) => old?.filter((t) => t.id !== id));
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

  const editTaskMutation = trpc.tasks.update.useMutation({
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
                xpReward:
                  input.priority === "high"
                    ? 20
                    : input.priority === "medium"
                    ? 10
                    : input.priority === "low"
                    ? 5
                    : t.xpReward,
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

  const updateDueDateMutation = trpc.tasks.update.useMutation({
    onMutate: async ({ id, dueDate }) => {
      await utils.tasks.list.cancel();
      const prev = utils.tasks.list.getData({ roleContext: activeRole });
      utils.tasks.list.setData({ roleContext: activeRole }, (old) =>
        old?.map((t) => (t.id === id ? { ...t, dueDate: dueDate ?? null } : t))
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
    },
  });

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const resetAddForm = () => {
    setNewTitle("");
    setNewNotes("");
    setNewPriority("medium");
    setNewEnergy("medium");
    setNewDueDate("");
    setNewRecurrenceType("");
    setNewRecurrenceDays([]);
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
      recurrenceType:
        (newRecurrenceType as
          | "daily"
          | "weekly"
          | "monthly"
          | "days_of_week"
          | "after_completion"
          | undefined) || undefined,
      recurrenceDays:
        newRecurrenceType === "days_of_week" && newRecurrenceDays.length > 0
          ? newRecurrenceDays.join(",")
          : undefined,
    });
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditNotes(task.notes ?? "");
    setEditPriority(task.priority);
    setEditEnergy(task.energyRequired);
    setEditDueDate(task.dueDate ?? "");
    setEditRecurrenceType(task.recurrenceType ?? "");
    setEditRecurrenceDays(task.recurrenceDays ? task.recurrenceDays.split(",") : []);
  };

  const closeEditDialog = () => {
    setEditingTask(null);
    setEditTitle("");
    setEditNotes("");
    setEditPriority("medium");
    setEditEnergy("medium");
    setEditDueDate("");
    setEditRecurrenceType("");
    setEditRecurrenceDays([]);
  };

  const handleEditTask = () => {
    if (!editingTask || !editTitle.trim()) return;
    editTaskMutation.mutate({
      id: editingTask.id,
      title: editTitle.trim(),
      notes: editNotes || undefined,
      priority: editPriority,
      energyRequired: editEnergy,
      dueDate: editDueDate || "",
      recurrenceType:
        (editRecurrenceType as
          | "daily"
          | "weekly"
          | "monthly"
          | "days_of_week"
          | "after_completion"
          | undefined) || undefined,
      recurrenceDays:
        editRecurrenceType === "days_of_week" && editRecurrenceDays.length > 0
          ? editRecurrenceDays.join(",")
          : undefined,
    });
  };

  const handleExpandTask = (task: Task) => {
    expandTask.mutate({
      taskId: task.id,
      title: task.title,
      notes: task.notes ?? undefined,
      role: task.roleContext as "student" | "parent" | "professional" | "all",
    });
  };

  const handleToggleExpanded = (id: number) => {
    setExpandedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRoleSwitch = (role: Role) => {
    updateSettings.mutate({ activeRole: role });
  };

  const handleModeChange = (mode: Mode) => {
    updateSettings.mutate({ personalityMode: mode });
  };

  // Auto-detect and silently save timezone when profile first loads
  useEffect(() => {
    if (!profile) return;
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const stored = (profile as typeof profile & { timezone?: string }).timezone ?? "UTC";
    if (detected && detected !== stored) {
      updateSettings.mutate({ timezone: detected });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  // ─── Auth guard ───────────────────────────────────────────────────────────────
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
          <h1 className="text-2xl font-bold text-foreground">Sign in to Taskbloom</h1>
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

  // ─── Derived data ─────────────────────────────────────────────────────────────
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

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        activeRole={activeRole}
        xpFlash={xpFlash}
        onRoleSwitch={handleRoleSwitch}
        onLogout={logout}
      />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column: Stats */}
          <div className="space-y-4">
            <UserStatsCard
              userName={authUser.name ?? ""}
              activeRole={activeRole}
              level={profile?.level ?? 1}
              xp={profile?.xp ?? 0}
            />
            <StreakCard
              currentStreak={profile?.currentStreak ?? 0}
              longestStreak={profile?.longestStreak ?? 0}
              personalityMode={personalityMode}
            />
            <AchievementPanel achievements={achievements} />
          </div>

          {/* Right column: Tasks */}
          <div className="lg:col-span-2 space-y-4">
            {/* Task header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {ROLE_CONFIG[activeRole].label} Tasks
                </h1>
                <p className="text-sm text-muted-foreground">
                  {todoCount} to do · {doneCount} done
                </p>
              </div>
              <Button onClick={() => setShowAddTask(true)} className="gap-2">
                <Plus size={16} /> Add Task
              </Button>
            </div>

            <TaskFilterBar filter={filter} onChange={setFilter} />

            <TaskList
              tasks={filteredTasks}
              isLoading={tasksLoading}
              filter={filter}
              personalityMode={personalityMode}
              expandedTaskIds={expandedTaskIds}
              expandingTaskId={expandingTaskId}
              dueDatePopoverTaskId={dueDatePopoverTaskId}
              onComplete={(id) => completeTask.mutate({ id })}
              onEdit={openEditDialog}
              onDelete={(id) => deleteTask.mutate({ id })}
              onExpand={handleExpandTask}
              onToggleStep={(taskId, stepId, done) =>
                toggleStep.mutate({ taskId, stepId, done })
              }
              onToggleExpanded={handleToggleExpanded}
              onDueDatePopoverChange={setDueDatePopoverTaskId}
              onUpdateDueDate={(id, dueDate) =>
                updateDueDateMutation.mutate({ id, dueDate })
              }
              onAddTask={() => setShowAddTask(true)}
            />
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <AddTaskDialog
        open={showAddTask}
        isPending={createTask.isPending}
        title={newTitle}
        notes={newNotes}
        priority={newPriority}
        energy={newEnergy}
        dueDate={newDueDate}
        recurrenceType={newRecurrenceType}
        recurrenceDays={newRecurrenceDays}
        voiceTitle={voiceTitle}
        voiceNotes={voiceNotes}
        onOpenChange={(open) => {
          setShowAddTask(open);
          if (!open) resetAddForm();
        }}
        onTitleChange={setNewTitle}
        onNotesChange={setNewNotes}
        onPriorityChange={setNewPriority}
        onEnergyChange={setNewEnergy}
        onDueDateChange={setNewDueDate}
        onRecurrenceTypeChange={setNewRecurrenceType}
        onRecurrenceDaysChange={setNewRecurrenceDays}
        onSubmit={handleAddTask}
        onCancel={() => {
          setShowAddTask(false);
          resetAddForm();
        }}
      />

      <EditTaskDialog
        open={!!editingTask}
        isPending={editTaskMutation.isPending}
        title={editTitle}
        notes={editNotes}
        priority={editPriority}
        energy={editEnergy}
        dueDate={editDueDate}
        recurrenceType={editRecurrenceType}
        recurrenceDays={editRecurrenceDays}
        onOpenChange={(open) => { if (!open) closeEditDialog(); }}
        onTitleChange={setEditTitle}
        onNotesChange={setEditNotes}
        onPriorityChange={setEditPriority}
        onEnergyChange={setEditEnergy}
        onDueDateChange={setEditDueDate}
        onRecurrenceTypeChange={setEditRecurrenceType}
        onRecurrenceDaysChange={setEditRecurrenceDays}
        onSubmit={handleEditTask}
        onCancel={closeEditDialog}
      />

      <SettingsDialog
        open={showSettings}
        personalityMode={personalityMode}
        onOpenChange={setShowSettings}
        onModeChange={handleModeChange}
      />
    </div>
  );
}
