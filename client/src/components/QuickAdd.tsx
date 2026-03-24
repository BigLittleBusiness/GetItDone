/**
 * QuickAdd — floating action button visible on all pages for authenticated users.
 *
 * Features:
 * - Single-field task title input (minimal friction)
 * - Voice capture via MediaRecorder + Whisper (cross-browser: Chrome, Firefox, Safari)
 * - Falls back gracefully on browsers that don't support MediaRecorder
 * - Submits via trpc.tasks.create and shows a toast confirmation
 */

import { useState, useRef, useEffect } from "react";
import { Plus, Mic, MicOff, Loader2, X, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function QuickAdd() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const voice = useVoiceInput({
    onTranscript: (text) => setTitle((prev) => (prev ? `${prev} ${text}` : text)),
  });

  const createTask = trpc.tasks.create.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
      toast.success("Task captured! ⚡", { duration: 3000 });
      setTitle("");
      setOpen(false);
    },
    onError: () => toast.error("Couldn't save task — try again"),
  });

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  // Stop recording if panel closes
  useEffect(() => {
    if (!open && voice.isRecording) voice.stopRecording();
  }, [open, voice]);

  const handleClose = () => {
    if (voice.isRecording) voice.stopRecording();
    setOpen(false);
    setTitle("");
  };

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    createTask.mutate({
      title: trimmed,
      roleContext: "all",
      priority: "medium",
      energyRequired: "medium",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") handleClose();
  };

  // Only render for authenticated users
  if (!isAuthenticated) return null;

  const micBusy = voice.isRecording || voice.isProcessing;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-40" onClick={handleClose} />
      )}

      {/* Floating panel */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {open && (
          <div
            className="bg-card border border-border rounded-2xl shadow-2xl p-4 w-80 animate-in slide-in-from-bottom-4 fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-primary" />
                <span className="text-sm font-semibold text-foreground">Quick Add</span>
              </div>
              <button
                onClick={handleClose}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Input row */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    voice.isRecording
                      ? "Listening…"
                      : voice.isProcessing
                      ? "Transcribing…"
                      : "What needs to get done?"
                  }
                  disabled={voice.isProcessing}
                  className={`pr-2 text-sm ${micBusy ? "border-primary ring-1 ring-primary/30" : ""}`}
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

              {/* Voice button */}
              {voice.isSupported && (
                <button
                  onClick={() => voice.toggle()}
                  disabled={voice.isProcessing}
                  title={voice.isRecording ? "Stop recording" : "Voice input"}
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

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={!title.trim() || createTask.isPending || voice.isProcessing}
              className="w-full mt-3 gap-2"
              size="sm"
            >
              {createTask.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}
              Add Task
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-2">
              Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> to save ·{" "}
              <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Esc</kbd> to close
            </p>
          </div>
        )}

        {/* FAB button */}
        <button
          onClick={() => setOpen((v) => !v)}
          title="Quick Add task"
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
            open
              ? "bg-muted text-muted-foreground rotate-45 scale-95"
              : "bg-primary text-primary-foreground hover:scale-110 hover:shadow-primary/30 hover:shadow-xl"
          }`}
        >
          <Plus size={24} />
        </button>
      </div>
    </>
  );
}
