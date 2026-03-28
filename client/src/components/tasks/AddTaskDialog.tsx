import { Loader2, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TaskFormFields from "./TaskFormFields";
import type { Priority, EnergyRequired } from "@/types/dashboard";

interface VoiceState {
  isSupported: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  toggle: () => void;
}

interface AddTaskDialogProps {
  open: boolean;
  isPending: boolean;
  title: string;
  notes: string;
  priority: Priority;
  energy: EnergyRequired;
  dueDate: string;
  recurrenceType: string;
  recurrenceDays: string[];
  voiceTitle: VoiceState;
  voiceNotes: VoiceState;
  onOpenChange: (open: boolean) => void;
  onTitleChange: (v: string) => void;
  onNotesChange: (v: string) => void;
  onPriorityChange: (v: Priority) => void;
  onEnergyChange: (v: EnergyRequired) => void;
  onDueDateChange: (v: string) => void;
  onRecurrenceTypeChange: (v: string) => void;
  onRecurrenceDaysChange: (days: string[]) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function AddTaskDialog({
  open,
  isPending,
  title,
  notes,
  priority,
  energy,
  dueDate,
  recurrenceType,
  recurrenceDays,
  voiceTitle,
  voiceNotes,
  onOpenChange,
  onTitleChange,
  onNotesChange,
  onPriorityChange,
  onEnergyChange,
  onDueDateChange,
  onRecurrenceTypeChange,
  onRecurrenceDaysChange,
  onSubmit,
  onCancel,
}: AddTaskDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            Add a Task
          </DialogTitle>
        </DialogHeader>
        <TaskFormFields
          title={title}
          notes={notes}
          priority={priority}
          energy={energy}
          dueDate={dueDate}
          recurrenceType={recurrenceType}
          recurrenceDays={recurrenceDays}
          voiceTitle={voiceTitle}
          voiceNotes={voiceNotes}
          onTitleChange={onTitleChange}
          onNotesChange={onNotesChange}
          onPriorityChange={onPriorityChange}
          onEnergyChange={onEnergyChange}
          onDueDateChange={onDueDateChange}
          onRecurrenceTypeChange={onRecurrenceTypeChange}
          onRecurrenceDaysChange={onRecurrenceDaysChange}
          onTitleKeyDown={(e) => e.key === "Enter" && onSubmit()}
        />
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!title.trim() || isPending}
            className="gap-2"
          >
            {isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            Add Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
