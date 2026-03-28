import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLogo } from "@/hooks/useLogo";
import { Button } from "@/components/ui/button";
import { useReadingTheme, type ReadingTheme } from "@/contexts/ReadingThemeContext";
import { useTextSize, type TextSize } from "@/contexts/TextSizeContext";
import {
  Brain,
  GraduationCap,
  Users,
  Briefcase,
  Smile,
  Heart,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

type Role = "student" | "parent" | "professional";
type Mode = "cheeky" | "positive" | "literal";

const ROLES: {
  id: Role;
  icon: React.ElementType;
  label: string;
  tagline: string;
  description: string;
  color: string;
}[] = [
  {
    id: "student",
    icon: GraduationCap,
    label: "Student",
    tagline: "The 13-day panic cycle ends here.",
    description:
      "Assignments, deadlines, and the paralysis of 'I'll start tomorrow.' We break it down into steps so small, you can't say no.",
    color: "from-violet-500 to-purple-600",
  },
  {
    id: "parent",
    icon: Users,
    label: "Parent",
    tagline: "You remembered the dentist. You forgot lunch.",
    description:
      "Managing a household while managing yourself. Voice-capture tasks before they vanish, and never drop the mental load again.",
    color: "from-rose-500 to-pink-600",
  },
  {
    id: "professional",
    icon: Briefcase,
    label: "Professional",
    tagline: "Excellent at your job. Terrified they'll find out.",
    description:
      "Context-switch between work and home. Hide the chaos. Show up prepared. No one needs to know about the three-day email.",
    color: "from-indigo-500 to-blue-600",
  },
];

const MODES: {
  id: Mode;
  icon: React.ElementType;
  label: string;
  example: string;
  description: string;
}[] = [
  {
    id: "cheeky",
    icon: Smile,
    label: "Cheeky",
    example:
      '"Okay, you\'ve been staring at that task for 20 minutes. Time to actually do it, legend."',
    description: "Playful roasts and gentle nudges. For when you need a laugh to get moving.",
  },
  {
    id: "positive",
    icon: Heart,
    label: "Positive",
    example:
      '"You\'ve got this! Every small step counts. Let\'s celebrate that you showed up today."',
    description: "Warm encouragement and genuine celebration of every win, no matter how small.",
  },
  {
    id: "literal",
    icon: BookOpen,
    label: "Literal / Autism-Friendly",
    example:
      '"Task: Reply to email. Step 1: Open email app. Step 2: Click reply. Step 3: Type one sentence."',
    description:
      "Clear, direct, no metaphors. Precise instructions without ambiguity or social subtext.",
  },
];

const READING_THEMES: {
  value: ReadingTheme;
  label: string;
  description: string;
  bg: string;
  text: string;
  border: string;
  preview: string;
}[] = [
  {
    value: "default",
    label: "Default",
    description: "The app's standard dark theme.",
    bg: "bg-slate-800",
    text: "text-slate-100",
    border: "border-slate-600",
    preview: "#1e293b",
  },
  {
    value: "cream",
    label: "Cream",
    description: "Warm off-white — reduces glare for many readers.",
    bg: "bg-[#FFF8F0]",
    text: "text-stone-800",
    border: "border-[#e8d8c0]",
    preview: "#FFF8F0",
  },
  {
    value: "sage",
    label: "Sage",
    description: "Pale green — most commonly cited helpful colour for dyslexia.",
    bg: "bg-[#E8F5E9]",
    text: "text-green-900",
    border: "border-[#b8d8ba]",
    preview: "#E8F5E9",
  },
  {
    value: "sky",
    label: "Sky",
    description: "Pale blue — second most cited helpful colour.",
    bg: "bg-[#E3F2FD]",
    text: "text-blue-900",
    border: "border-[#b0d4f1]",
    preview: "#E3F2FD",
  },
  {
    value: "dusk",
    label: "Dusk",
    description: "Soft lavender — preferred by some with visual stress.",
    bg: "bg-[#F3E5F5]",
    text: "text-purple-900",
    border: "border-[#d0b8d8]",
    preview: "#F3E5F5",
  },
  {
    value: "sand",
    label: "Sand",
    description: "Warm yellow — cited in Irlen Institute research.",
    bg: "bg-[#FFFDE7]",
    text: "text-yellow-900",
    border: "border-[#e8d870]",
    preview: "#FFFDE7",
  },
];

const SAMPLE_TASKS: Record<
  Role,
  { title: string; priority: "low" | "medium" | "high"; energyRequired: "low" | "medium" | "high" }[]
> = {
  student: [
    { title: "Start introduction paragraph for essay", priority: "high", energyRequired: "high" },
    { title: "Review lecture notes from Monday", priority: "medium", energyRequired: "medium" },
    { title: "Email professor about extension", priority: "medium", energyRequired: "low" },
  ],
  parent: [
    { title: "Book dentist appointment for kids", priority: "high", energyRequired: "low" },
    { title: "Prepare school lunches for the week", priority: "medium", energyRequired: "medium" },
    { title: "Pay electricity bill", priority: "high", energyRequired: "low" },
  ],
  professional: [
    { title: "Reply to 3 unanswered emails", priority: "high", energyRequired: "medium" },
    { title: "Prepare agenda for Monday meeting", priority: "medium", energyRequired: "medium" },
    { title: "Update project status in tracker", priority: "low", energyRequired: "low" },
  ],
};

const TEXT_SIZES: {
  value: TextSize;
  label: string;
  description: string;
  previewPx: string;
}[] = [
  {
    value: "small",
    label: "Small",
    description: "Compact text — fits more on screen at once. Good if you prefer a denser view.",
    previewPx: "14px",
  },
  {
    value: "medium",
    label: "Medium",
    description: "The default size — balanced and comfortable for most people.",
    previewPx: "16px",
  },
  {
    value: "large",
    label: "Large",
    description: "Bigger text — easier to read for longer sessions or if you prefer more space.",
    previewPx: "18px",
  },
];

const TOTAL_STEPS = 5;

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
  const [, setLocation] = useLocation();
  const { readingTheme, setReadingTheme } = useReadingTheme();
  const { textSize, setTextSize } = useTextSize();

  const completeOnboarding = trpc.user.completeOnboarding.useMutation({
    onSuccess: () => {
      setLocation("/dashboard");
    },
  });

  const handleComplete = () => {
    if (!selectedRole || !selectedMode) return;
    completeOnboarding.mutate({
      activeRole: selectedRole,
      personalityMode: selectedMode,
      readingTheme,
      textSize,
    });
  };

  const progress = (step / TOTAL_STEPS) * 100;
  const { iconUrl } = useLogo();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center">
            <img src={iconUrl} alt="Taskbloom" className="w-9 h-9 object-contain" />
          </div>
          <span className="font-semibold text-foreground">Taskbloom</span>
        </div>
        <div className="text-sm text-muted-foreground">
          Step {step} of {TOTAL_STEPS}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-border">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">

          {/* ── Step 1: Role Selection ─────────────────────────────────── */}
          {step === 1 && (
            <div className="animate-fade-in-up">
              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-foreground mb-3">
                  Which hat are you wearing most right now?
                </h1>
                <p className="text-muted-foreground text-lg">
                  You can switch between roles any time. Pick your primary one to start.
                </p>
              </div>

              <div className="space-y-4">
                {ROLES.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                          : "border-border bg-card hover:border-primary/40 hover:bg-accent/50"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center shrink-0`}
                        >
                          <Icon className="text-white" size={22} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-foreground text-lg">{role.label}</span>
                            {isSelected && <CheckCircle2 className="text-primary" size={20} />}
                          </div>
                          <p className="text-sm font-medium text-primary mb-1">{role.tagline}</p>
                          <p className="text-sm text-muted-foreground">{role.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!selectedRole}
                  size="lg"
                  className="gap-2"
                >
                  Next <ArrowRight size={18} />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 2: Personality Mode ───────────────────────────────── */}
          {step === 2 && (
            <div className="animate-fade-in-up">
              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-foreground mb-3">
                  How should I talk to you?
                </h1>
                <p className="text-muted-foreground text-lg">
                  Pick the motivation style that actually works for your brain.
                </p>
              </div>

              <div className="space-y-4">
                {MODES.map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = selectedMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setSelectedMode(mode.id)}
                      className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                          : "border-border bg-card hover:border-primary/40 hover:bg-accent/50"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="text-primary" size={22} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-foreground text-lg">{mode.label}</span>
                            {isSelected && <CheckCircle2 className="text-primary" size={20} />}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{mode.description}</p>
                          <div className="bg-muted rounded-xl p-3">
                            <p className="text-sm text-foreground italic">{mode.example}</p>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)} className="gap-2">
                  <ArrowLeft size={18} /> Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!selectedMode}
                  size="lg"
                  className="gap-2"
                >
                  Next <ArrowRight size={18} />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 3: Reading Theme ──────────────────────────────────── */}
          {step === 3 && (
            <div className="animate-fade-in-up">
              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-foreground mb-3">
                  What colour helps you read best?
                </h1>
                <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                  Some people find that a coloured background makes text easier to read and reduces
                  visual stress. Pick what feels comfortable — you can change it any time in Settings.
                </p>
              </div>

              {/* Swatch grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {READING_THEMES.map((t) => {
                  const isSelected = readingTheme === t.value;
                  return (
                    <button
                      key={t.value}
                      onClick={() => setReadingTheme(t.value)}
                      aria-pressed={isSelected}
                      className={`
                        relative flex flex-col gap-2 p-4 rounded-2xl border-2 transition-all duration-200 text-left
                        focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary
                        ${
                          isSelected
                            ? "border-primary ring-2 ring-primary/30 scale-[1.02] shadow-lg shadow-primary/10"
                            : "border-border bg-card hover:border-primary/40"
                        }
                      `}
                    >
                      {/* Colour preview strip */}
                      <div
                        className="w-full h-10 rounded-xl border border-black/10"
                        style={{ backgroundColor: t.preview }}
                      />
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground text-sm">{t.label}</span>
                        {isSelected && (
                          <CheckCircle2 className="text-primary shrink-0" size={16} />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-snug">{t.description}</p>
                    </button>
                  );
                })}
              </div>

              {/* Live preview strip */}
              <div
                className="rounded-2xl border border-black/10 p-4 mb-8 transition-colors duration-300"
                style={{
                  backgroundColor:
                    READING_THEMES.find((t) => t.value === readingTheme)?.preview ?? "#1e293b",
                }}
              >
                <p
                  className="text-sm font-medium mb-1"
                  style={{ color: readingTheme === "default" ? "#f1f5f9" : "#1c1917" }}
                >
                  Preview
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: readingTheme === "default" ? "#cbd5e1" : "#44403c" }}
                >
                  This is how your task list will look. If this background feels comfortable to read,
                  you're all set. If not, try another colour above.
                </p>
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(2)} className="gap-2">
                  <ArrowLeft size={18} /> Back
                </Button>
                <Button onClick={() => setStep(4)} size="lg" className="gap-2">
                  Next <ArrowRight size={18} />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 4: Text Size ──────────────────────────────────────── */}
          {step === 4 && (
            <div className="animate-fade-in-up">
              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-foreground mb-3">
                  How big would you like the text?
                </h1>
                <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                  Choose a text size that feels comfortable. You can change this any time in Settings.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                {TEXT_SIZES.map((opt) => {
                  const isSelected = textSize === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setTextSize(opt.value)}
                      aria-pressed={isSelected}
                      className={`
                        relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200
                        focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary
                        ${
                          isSelected
                            ? "border-primary ring-2 ring-primary/30 bg-primary/5 scale-[1.03] shadow-lg shadow-primary/10"
                            : "border-border bg-card hover:border-primary/40 hover:bg-accent/50"
                        }
                      `}
                    >
                      {/* Live preview of the size */}
                      <span
                        className="font-bold text-foreground leading-none"
                        style={{ fontSize: opt.previewPx }}
                      >
                        Aa
                      </span>
                      <div className="text-center">
                        <p className="font-semibold text-foreground text-sm">{opt.label}</p>
                        <p className="text-xs text-muted-foreground mt-1 leading-snug">{opt.description}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="absolute top-3 right-3 text-primary" size={16} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Live preview sentence */}
              <div className="bg-card border border-border rounded-2xl p-5 mb-8">
                <p className="text-sm text-muted-foreground mb-2">Preview</p>
                <p
                  className="text-foreground leading-relaxed transition-all duration-300"
                  style={{ fontSize: TEXT_SIZES.find((o) => o.value === textSize)?.previewPx ?? "16px" }}
                >
                  Reply to 3 unanswered emails — high priority, medium energy
                </p>
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(3)} className="gap-2">
                  <ArrowLeft size={18} /> Back
                </Button>
                <Button onClick={() => setStep(5)} size="lg" className="gap-2">
                  Next <ArrowRight size={18} />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 5: Preview & Confirm ──────────────────────────────── */}
          {step === 5 && selectedRole && selectedMode && (
            <div className="animate-fade-in-up">
              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-foreground mb-3">
                  Here's your starting point
                </h1>
                <p className="text-muted-foreground text-lg">
                  We've set up some sample tasks to get you going. You can edit or delete these any
                  time.
                </p>
              </div>

              {/* Summary card */}
              <div className="bg-card border border-border rounded-2xl p-5 mb-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-0.5">Your role</p>
                    <p className="font-semibold text-foreground capitalize">{selectedRole}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-0.5">Motivation style</p>
                    <p className="font-semibold text-foreground capitalize">{selectedMode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-0.5">Reading theme</p>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                        style={{
                          backgroundColor:
                            READING_THEMES.find((t) => t.value === readingTheme)?.preview ??
                            "#1e293b",
                        }}
                      />
                      <p className="font-semibold text-foreground capitalize">
                        {READING_THEMES.find((t) => t.value === readingTheme)?.label ?? "Default"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-0.5">Text size</p>
                    <p className="font-semibold text-foreground capitalize">
                      {TEXT_SIZES.find((o) => o.value === textSize)?.label ?? "Medium"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sample tasks preview */}
              <div className="bg-card border border-border rounded-2xl p-5 mb-8">
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  Sample tasks for you
                </p>
                <div className="space-y-2">
                  {SAMPLE_TASKS[selectedRole].map((task, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          task.priority === "high"
                            ? "bg-rose-500"
                            : task.priority === "medium"
                              ? "bg-amber-500"
                              : "bg-green-500"
                        }`}
                      />
                      <span className="text-sm text-foreground">{task.title}</span>
                      <span
                        className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                          task.energyRequired === "high"
                            ? "bg-rose-100 text-rose-700"
                            : task.energyRequired === "medium"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {task.energyRequired} energy
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(4)} className="gap-2">
                  <ArrowLeft size={18} /> Back
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={completeOnboarding.isPending}
                  size="lg"
                  className="gap-2"
                >
                  {completeOnboarding.isPending ? "Setting up..." : "Let's go!"}
                  {!completeOnboarding.isPending && <ArrowRight size={18} />}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
