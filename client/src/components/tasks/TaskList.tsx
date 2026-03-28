import { Loader2, Target, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import TaskCard from "./TaskCard";
import { MODE_MESSAGES, type Task, type Mode } from "@/types/dashboard";
import type { FilterId } from "./TaskFilterBar";

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  filter: FilterId;
  personalityMode: Mode;
  expandedTaskIds: Set<number>;
  expandingTaskId: number | null;
  dueDatePopoverTaskId: number | null;
  onComplete: (id: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onExpand: (task: Task) => void;
  onToggleStep: (taskId: number, stepId: string, done: boolean) => void;
  onToggleExpanded: (id: number) => void;
  onDueDatePopoverChange: (id: number | null) => void;
  onUpdateDueDate: (id: number, dueDate: string) => void;
  onAddTask: () => void;
}

export default function TaskList({
  tasks,
  isLoading,
  filter,
  personalityMode,
  expandedTaskIds,
  expandingTaskId,
  dueDatePopoverTaskId,
  onComplete,
  onEdit,
  onDelete,
  onExpand,
  onToggleStep,
  onToggleExpanded,
  onDueDatePopoverChange,
  onUpdateDueDate,
  onAddTask,
}: TaskListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-muted-foreground" size={24} />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-10 text-center">
        <Target className="mx-auto text-muted-foreground mb-4" size={40} />
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          {filter === "done"
            ? "No completed tasks yet. Go get something done!"
            : MODE_MESSAGES[personalityMode].empty}
        </p>
        {filter !== "done" && filter !== "week" && (
          <Button onClick={onAddTask} variant="outline" className="mt-4 gap-2">
            <Plus size={14} /> Add your first task
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          isExpanded={expandedTaskIds.has(task.id)}
          isExpanding={expandingTaskId === task.id}
          dueDatePopoverOpen={dueDatePopoverTaskId === task.id}
          onComplete={onComplete}
          onEdit={onEdit}
          onDelete={onDelete}
          onExpand={onExpand}
          onToggleStep={onToggleStep}
          onToggleExpanded={onToggleExpanded}
          onDueDatePopoverChange={onDueDatePopoverChange}
          onUpdateDueDate={onUpdateDueDate}
        />
      ))}
    </div>
  );
}
