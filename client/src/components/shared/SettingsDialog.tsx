import { Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Mode } from "@/types/dashboard";

const MODE_OPTIONS: { id: Mode; label: string; description: string }[] = [
  {
    id: "cheeky",
    label: "Cheeky",
    description: "Sarcastic motivation that somehow works.",
  },
  {
    id: "positive",
    label: "Positive",
    description: "Warm encouragement for every win.",
  },
  {
    id: "literal",
    label: "Literal",
    description: "Just the facts. No fluff.",
  },
];

interface SettingsDialogProps {
  open: boolean;
  personalityMode: Mode;
  onOpenChange: (open: boolean) => void;
  onModeChange: (mode: Mode) => void;
}

export default function SettingsDialog({
  open,
  personalityMode,
  onOpenChange,
  onModeChange,
}: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings size={18} className="text-primary" />
            Personality Mode
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-2">
          {MODE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                onModeChange(opt.id);
                onOpenChange(false);
              }}
              className={`w-full text-left p-3 rounded-xl border transition-all ${
                personalityMode === opt.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <p className="font-medium text-foreground">{opt.label}</p>
              <p className="text-sm text-muted-foreground">{opt.description}</p>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
