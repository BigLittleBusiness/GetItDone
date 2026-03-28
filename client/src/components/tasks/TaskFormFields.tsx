import { Loader2, Mic, MicOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Priority, EnergyRequired } from "@/types/dashboard";

interface VoiceState {
  isSupported: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  toggle: () => void;
}

interface TaskFormFieldsProps {
  title: string;
  notes: string;
  priority: Priority;
  energy: EnergyRequired;
  dueDate: string;
  recurrenceType: string;
  recurrenceDays: string[];
  voiceTitle?: VoiceState;
  voiceNotes?: VoiceState;
  onTitleChange: (v: string) => void;
  onNotesChange: (v: string) => void;
  onPriorityChange: (v: Priority) => void;
  onEnergyChange: (v: EnergyRequired) => void;
  onDueDateChange: (v: string) => void;
  onRecurrenceTypeChange: (v: string) => void;
  onRecurrenceDaysChange: (days: string[]) => void;
  onTitleKeyDown?: (e: React.KeyboardEvent) => void;
}

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function TaskFormFields({
  title,
  notes,
  priority,
  energy,
  dueDate,
  recurrenceType,
  recurrenceDays,
  voiceTitle,
  voiceNotes,
  onTitleChange,
  onNotesChange,
  onPriorityChange,
  onEnergyChange,
  onDueDateChange,
  onRecurrenceTypeChange,
  onRecurrenceDaysChange,
  onTitleKeyDown,
}: TaskFormFieldsProps) {
  return (
    <div className="space-y-4 py-2">
      {/* Title field with optional voice input */}
      <div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder={
                voiceTitle?.isRecording
                  ? "Listening…"
                  : voiceTitle?.isProcessing
                  ? "Transcribing…"
                  : "What needs to get done?"
              }
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              onKeyDown={onTitleKeyDown}
              disabled={voiceTitle?.isProcessing}
              className={`text-base ${
                voiceTitle?.isRecording ? "border-primary ring-1 ring-primary/30" : ""
              }`}
              autoFocus
            />
            {voiceTitle?.isRecording && (
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
          {voiceTitle?.isSupported && (
            <button
              type="button"
              onClick={() => voiceTitle.toggle()}
              disabled={voiceTitle.isProcessing}
              title={voiceTitle.isRecording ? "Stop recording" : "Dictate task title"}
              className={`p-2 rounded-xl border transition-all shrink-0 ${
                voiceTitle.isRecording
                  ? "bg-primary text-primary-foreground border-primary"
                  : voiceTitle.isProcessing
                  ? "bg-muted text-muted-foreground border-border cursor-not-allowed"
                  : "border-border text-muted-foreground hover:text-primary hover:border-primary/40 bg-transparent"
              }`}
            >
              {voiceTitle.isProcessing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : voiceTitle.isRecording ? (
                <MicOff size={16} />
              ) : (
                <Mic size={16} />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Notes field with optional voice input */}
      <div>
        <div className="relative">
          <Textarea
            placeholder={
              voiceNotes?.isRecording
                ? "Listening…"
                : voiceNotes?.isProcessing
                ? "Transcribing…"
                : "Notes (optional)"
            }
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={2}
            disabled={voiceNotes?.isProcessing}
            className={`resize-none pr-8 ${
              voiceNotes?.isRecording ? "border-primary ring-1 ring-primary/30" : ""
            }`}
          />
          {voiceNotes?.isSupported && (
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

      {/* Priority & Energy */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Priority</label>
          <Select value={priority} onValueChange={(v) => onPriorityChange(v as Priority)}>
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
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Energy needed
          </label>
          <Select value={energy} onValueChange={(v) => onEnergyChange(v as EnergyRequired)}>
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

      {/* Due date */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Due date (optional)
        </label>
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => onDueDateChange(e.target.value)}
        />
      </div>

      {/* Recurrence */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Repeat</label>
        <Select
          value={recurrenceType || "none"}
          onValueChange={(v) => {
            onRecurrenceTypeChange(v === "none" ? "" : v);
            onRecurrenceDaysChange([]);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Does not repeat" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Does not repeat</SelectItem>
            <SelectItem value="daily">Every day</SelectItem>
            <SelectItem value="days_of_week">Specific days of the week</SelectItem>
            <SelectItem value="weekly">Every week</SelectItem>
            <SelectItem value="monthly">Every month</SelectItem>
            <SelectItem value="after_completion">After I finish this one</SelectItem>
          </SelectContent>
        </Select>

        {recurrenceType === "days_of_week" && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {DAY_LABELS.map((label, i) => {
              const dayStr = String(i);
              const selected = recurrenceDays.includes(dayStr);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() =>
                    onRecurrenceDaysChange(
                      selected
                        ? recurrenceDays.filter((d) => d !== dayStr)
                        : [...recurrenceDays, dayStr]
                    )
                  }
                  className={`w-9 h-9 rounded-full text-xs font-semibold border transition-all ${
                    selected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {recurrenceType === "after_completion" && (
          <p className="text-xs text-muted-foreground mt-1.5">
            A new copy appears the day after you complete this one — no pile-up.
          </p>
        )}
      </div>
    </div>
  );
}
