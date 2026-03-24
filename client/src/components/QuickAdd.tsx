/**
 * QuickAdd — floating action button visible on all pages for authenticated users.
 *
 * Features:
 * - Single-field task title input (minimal friction)
 * - Voice capture via the Web Speech API (SpeechRecognition)
 * - Falls back gracefully on browsers that don't support voice
 * - Submits via trpc.tasks.create and shows a toast confirmation
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { Plus, Mic, MicOff, X, Loader2, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Extend window for SpeechRecognition (not in all TS lib versions)
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

function getSpeechRecognition(): (new () => SpeechRecognition) | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

export function QuickAdd() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const SpeechRecognitionClass = getSpeechRecognition();
  const voiceSupported = !!SpeechRecognitionClass;

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
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const startListening = useCallback(() => {
    if (!SpeechRecognitionClass) return;
    const recognition = new SpeechRecognitionClass();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setTitle(transcript);
    };

    recognition.onerror = () => {
      setListening(false);
      toast.error("Voice input failed — please type instead");
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [SpeechRecognitionClass]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

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
    if (e.key === "Escape") {
      setOpen(false);
      setTitle("");
    }
  };

  // Only render for authenticated users
  if (!isAuthenticated) return null;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setOpen(false);
            setTitle("");
            stopListening();
          }}
        />
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
                onClick={() => {
                  setOpen(false);
                  setTitle("");
                  stopListening();
                }}
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
                  placeholder={listening ? "Listening…" : "What needs to get done?"}
                  className={`pr-2 text-sm ${listening ? "border-primary ring-1 ring-primary/30" : ""}`}
                />
                {listening && (
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
              {voiceSupported && (
                <button
                  onClick={listening ? stopListening : startListening}
                  title={listening ? "Stop recording" : "Voice input"}
                  className={`p-2 rounded-xl border transition-all shrink-0 ${
                    listening
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-primary hover:border-primary/40 bg-transparent"
                  }`}
                >
                  {listening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              )}
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={!title.trim() || createTask.isPending}
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
