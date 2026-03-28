import { AlertCircle, CalendarClock } from "lucide-react";

// ─── Domain types ────────────────────────────────────────────────────────────

export type Role = "student" | "parent" | "professional";
export type Mode = "cheeky" | "positive" | "literal";
export type Priority = "low" | "medium" | "high";
export type EnergyRequired = "low" | "medium" | "high";

export interface TaskStep {
  id: string;
  text: string;
  done: boolean;
}

export interface Task {
  id: number;
  title: string;
  notes?: string | null;
  roleContext: string;
  status: string;
  priority: Priority;
  energyRequired: EnergyRequired;
  dueDate?: string | null;
  xpReward: number;
  steps?: TaskStep[] | null;
  recurrenceType?: string | null;
  recurrenceDays?: string | null;
  parentTaskId?: number | null;
}

export interface Achievement {
  id: number;
  slug: string;
  icon?: string;
  title?: string;
  description?: string;
}

// ─── Role configuration ───────────────────────────────────────────────────────

import { GraduationCap, Users, Briefcase } from "lucide-react";

export const ROLE_CONFIG: Record<
  Role,
  { icon: React.ElementType; label: string; color: string; bg: string; tagline: string }
> = {
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

// ─── Personality mode messages ────────────────────────────────────────────────

export const MODE_MESSAGES: Record<Mode, { empty: string; complete: string; streak: string }> = {
  cheeky: {
    empty:
      "Wow, look at that empty list. Either you're a productivity god, or you're in denial. Add something.",
    complete: "Look at you, actually doing the thing! Your future self is mildly impressed.",
    streak: "You've been showing up. Honestly didn't think you had it in you. Proud of you though.",
  },
  positive: {
    empty:
      "Your task list is clear! Add something you want to accomplish today — every journey starts with one step.",
    complete: "Amazing work! You completed a task! Every single win counts, and this one absolutely does.",
    streak: "You've been showing up consistently. That's the real superpower — keep going!",
  },
  literal: {
    empty: "No tasks found. To add a task: click the 'Add Task' button. Enter a title. Click Save.",
    complete: "Task status changed to: Done. XP has been added to your account.",
    streak: "Current streak: active. You have completed tasks on consecutive days.",
  },
};

// ─── Priority configuration ───────────────────────────────────────────────────

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; dot: string }> = {
  high: { label: "High", color: "text-rose-600 bg-rose-50 border-rose-200", dot: "bg-rose-500" },
  medium: { label: "Medium", color: "text-amber-600 bg-amber-50 border-amber-200", dot: "bg-amber-500" },
  low: { label: "Low", color: "text-green-600 bg-green-50 border-green-200", dot: "bg-green-500" },
};

// ─── Energy configuration ─────────────────────────────────────────────────────

export const ENERGY_CONFIG: Record<EnergyRequired, { label: string; icon: string }> = {
  high: { label: "High energy", icon: "⚡" },
  medium: { label: "Medium energy", icon: "🔋" },
  low: { label: "Low energy", icon: "🌿" },
};

// ─── Due-date helpers ─────────────────────────────────────────────────────────

export type DueDateStatus = "overdue" | "today" | "tomorrow" | null;

export function getDueDateStatus(dueDate: string | null | undefined): DueDateStatus {
  if (!dueDate) return null;
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

export const DUE_CHIP: Record<
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

// ─── XP helpers ───────────────────────────────────────────────────────────────

export function xpForLevel(level: number): number {
  return level * 100;
}

export function xpProgress(xp: number, level: number): number {
  let threshold = 0;
  for (let l = 1; l < level; l++) threshold += xpForLevel(l);
  const needed = xpForLevel(level);
  const current = xp - threshold;
  return Math.min((current / needed) * 100, 100);
}

// ─── Urgency sort helpers ─────────────────────────────────────────────────────

export function urgencyWeight(task: Task): number {
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

export function isDueThisWeek(task: Task): boolean {
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
