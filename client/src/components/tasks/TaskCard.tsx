import {
  CheckCircle2,
  Circle,
  Pencil,
  Trash2,
  Wand2,
  Loader2,
  CalendarClock,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  PRIORITY_CONFIG,
  ENERGY_CONFIG,
  getDueDateStatus,
  DUE_CHIP,
  type Task,
  type Priority,
  type EnergyRequired,
} from "@/types/dashboard";

interface TaskCardProps {
  task: Task;
  isExpanded: boolean;
  isExpanding: boolean;
  dueDatePopoverOpen: boolean;
  onComplete: (id: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onExpand: (task: Task) => void;
  onToggleStep: (taskId: number, stepId: string, done: boolean) => void;
  onToggleExpanded: (id: number) => void;
  onDueDatePopoverChange: (id: number | null) => void;
  onUpdateDueDate: (id: number, dueDate: string) => void;
}

export default function TaskCard({
  task,
  isExpanded,
  isExpanding,
  dueDatePopoverOpen,
  onComplete,
  onEdit,
  onDelete,
  onExpand,
  onToggleStep,
  onToggleExpanded,
  onDueDatePopoverChange,
  onUpdateDueDate,
}: TaskCardProps) {
  const isDone = task.status === "done";
  const priorityCfg = PRIORITY_CONFIG[task.priority as Priority];
  const energyCfg = ENERGY_CONFIG[task.energyRequired as EnergyRequired];

  return (
    <div
      className={`bg-card border rounded-2xl p-4 transition-all duration-200 group ${
        isDone
          ? "border-border opacity-60"
          : "border-border hover:border-primary/30 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Complete button */}
        <button
          onClick={() => !isDone && onComplete(task.id)}
          disabled={isDone}
          className={`mt-0.5 shrink-0 transition-all ${
            isDone ? "text-primary" : "text-muted-foreground hover:text-primary"
          }`}
        >
          {isDone ? (
            <CheckCircle2 size={22} className="text-primary" />
          ) : (
            <Circle size={22} />
          )}
        </button>

        {/* Task content */}
        <div className="flex-1 min-w-0">
          <p
            className={`font-medium text-foreground ${
              isDone ? "line-through text-muted-foreground" : ""
            }`}
          >
            {task.title}
          </p>
          {task.notes && (
            <p className="text-sm text-muted-foreground mt-0.5 truncate">{task.notes}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {/* Priority chip */}
            <span
              className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${priorityCfg.color}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${priorityCfg.dot}`} />
              {priorityCfg.label}
            </span>

            {/* Energy chip */}
            <span className="text-xs text-muted-foreground">
              {energyCfg.icon} {energyCfg.label}
            </span>

            {/* Due date chip */}
            {task.dueDate &&
              (() => {
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
                return (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <CalendarClock size={11} />
                    {task.dueDate}
                  </span>
                );
              })()}

            {/* XP reward */}
            <span className="text-xs text-amber-600 font-medium ml-auto">
              +{task.xpReward} XP
            </span>

            {/* Recurrence chip */}
            {task.recurrenceType && !isDone && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium text-violet-600 bg-violet-50 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800">
                <RefreshCw size={10} />
                {task.recurrenceType === "daily"
                  ? "Daily"
                  : task.recurrenceType === "weekly"
                  ? "Weekly"
                  : task.recurrenceType === "monthly"
                  ? "Monthly"
                  : task.recurrenceType === "after_completion"
                  ? "Repeats after done"
                  : task.recurrenceType === "days_of_week"
                  ? "Custom days"
                  : "Repeats"}
              </span>
            )}
          </div>
        </div>

        {/* Inline due-date popover */}
        {!isDone && (
          <Popover
            open={dueDatePopoverOpen}
            onOpenChange={(open) => onDueDatePopoverChange(open ? task.id : null)}
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
                    onClick={() => onUpdateDueDate(task.id, "")}
                    className="text-xs text-destructive hover:underline px-1"
                  >
                    Clear
                  </button>
                )}
              </div>
              <Calendar
                mode="single"
                selected={task.dueDate ? new Date(task.dueDate + "T12:00:00") : undefined}
                onSelect={(date) => {
                  if (!date) return;
                  const iso = new Intl.DateTimeFormat("en-CA", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  }).format(date);
                  onUpdateDueDate(task.id, iso);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )}

        {/* Action buttons */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {!isDone && (
            <button
              onClick={() => onExpand(task)}
              disabled={isExpanding}
              title="AI: Break into steps"
              className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
            >
              {isExpanding ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Wand2 size={14} />
              )}
            </button>
          )}
          {!isDone && (
            <button
              onClick={() => onEdit(task)}
              title="Edit task"
              className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
            >
              <Pencil size={14} />
            </button>
          )}
          <button
            onClick={() => onDelete(task.id)}
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
            onClick={() => onToggleExpanded(task.id)}
            className="flex items-center gap-1 text-xs text-primary font-medium mb-2 hover:opacity-80 transition-opacity"
          >
            <ChevronRight
              size={12}
              className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
            />
            {task.steps.filter((s) => s.done).length}/{task.steps.length} steps done
          </button>
          {isExpanded && (
            <div className="space-y-1.5 border-l-2 border-primary/20 pl-3">
              {task.steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => onToggleStep(task.id, step.id, !step.done)}
                  className="flex items-start gap-2 text-sm w-full text-left group/step hover:bg-primary/5 rounded-md px-1 py-0.5 transition-colors"
                >
                  <span
                    className={`shrink-0 mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      step.done
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-border group-hover/step:border-primary/50"
                    }`}
                  >
                    {step.done && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path
                          d="M1 4L3.5 6.5L9 1"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <span
                    className={`leading-snug ${
                      step.done ? "line-through text-muted-foreground" : "text-foreground"
                    }`}
                  >
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
}
