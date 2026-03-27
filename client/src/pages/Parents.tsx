import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import FeedbackModal from "@/components/FeedbackModal";
import MarketingNav from "@/components/MarketingNav";
import BackToTop from "@/components/BackToTop";
import CookieConsent from "@/components/CookieConsent";
import MarketingFooter from "@/components/MarketingFooter";
import {
  Brain,
  ArrowRight,
  Heart,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Users,
  Mic,
  Zap,
  Clock,
  Trophy,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";

const DEFAULT_OG_IMAGE = 'https://d2xsxph8kpxj0f.cloudfront.net/310419663031090894/maeA52JBNKsvSZamfPFaVJ/og-default-YNa3mC77hEt2hgiJBT4kDE.png';
const SITE_URL = 'https://taskbloom.app';

// ── Common Questions ──────────────────────────────────────────────────────────

const QUESTIONS = [
  {
    q: "Does my child need a diagnosis to use this app?",
    a: "Not at all. Taskbloom is designed for anyone whose brain works differently — whether that is a formal ADHD or Autism diagnosis, a suspected one, or simply someone who has always found traditional productivity tools frustrating. There is no checklist to pass.",
  },
  {
    q: "Can I set it up on behalf of someone I care for?",
    a: "Yes. Each account is personal and belongs to the individual using it, but there is nothing stopping a parent or carer from helping someone get started, choosing their role context, and setting their preferred personality mode together. Think of it as setting up a new phone — you do it together once, and then it is theirs.",
  },
  {
    q: "Will the app nag them if they miss a day?",
    a: "No. There are no warnings, no guilt messages, and no streak-shame mechanics. If someone misses a day, the app simply picks up where they left off. Reminders are gentle, optional, and set by the user themselves — not pushed on them.",
  },
  {
    q: "Is it suitable for children and teenagers?",
    a: "The app is designed for adults and older teenagers who can manage their own account. Younger children would benefit most from a parent or carer setting it up and using it alongside them rather than independently.",
  },
  {
    q: "Can I see their tasks or progress?",
    a: "Not currently. Each account is private to the individual — this is intentional. Autonomy and ownership are central to how the app builds confidence. A shared view or carer dashboard is something we are exploring for a future release.",
  },
  {
    q: "What if they find the app overwhelming at first?",
    a: "Start small. Encourage them to add just one task, break it into steps using the AI feature, and complete it. The onboarding flow is short and gentle, and the Literal personality mode keeps everything clear and direct if that suits them better.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-7 py-5 text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-medium text-white leading-snug">{q}</span>
        {open ? (
          <ChevronUp className="shrink-0 text-indigo-300" size={18} />
        ) : (
          <ChevronDown className="shrink-0 text-indigo-300" size={18} />
        )}
      </button>
      {open && (
        <div className="px-7 pb-6 text-indigo-200 leading-relaxed text-sm border-t border-white/5 pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Parents() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: logoConfig } = trpc.admin.getLogo.useQuery();
  const ogImage = logoConfig?.ogImageUrl ?? DEFAULT_OG_IMAGE;

  return (
    <div className="min-h-screen bg-[#3B4A6B] text-white overflow-x-hidden selection:bg-indigo-500/30">
      <Helmet>
        <title>For Parents &amp; Carers — Taskbloom</title>
        <meta name="description" content="Supporting a neurodivergent child, partner, or family member? Taskbloom works with their brain, not against it — so you can worry a little less and celebrate a little more." />
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/parents`} />
        <meta property="og:title" content="For Parents &amp; Carers — Taskbloom" />
        <meta property="og:description" content="Supporting a neurodivergent child, partner, or family member? Taskbloom works with their brain, not against it — so you can worry a little less and celebrate a little more." />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Taskbloom" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={`${SITE_URL}/parents`} />
        <meta name="twitter:title" content="For Parents &amp; Carers — Taskbloom" />
        <meta name="twitter:description" content="Supporting a neurodivergent child, partner, or family member? Taskbloom works with their brain, not against it — so you can worry a little less and celebrate a little more." />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>

      {/* Navigation */}
      <MarketingNav onJoinWaitlist={() => setIsFeedbackOpen(true)} />

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px]" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/15 border border-purple-400/20 mb-8 animate-fade-in-up">
            <Heart size={14} className="text-purple-300" />
            <span className="text-sm font-medium text-purple-200">For Parents &amp; Carers</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-serif font-medium leading-[1.1] mb-6 animate-fade-in-up [animation-delay:200ms]">
            You already do<br />
            <span className="text-gradient italic">so much.</span>
          </h1>

          <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:400ms]">
            Supporting a neurodivergent child, partner, or family member takes patience, creativity, and a whole lot of love. Taskbloom is a tool that works <em>with</em> them — so you can worry a little less and celebrate a little more.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up [animation-delay:600ms]">
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="w-full sm:w-auto bg-white text-[#3B4A6B] px-8 py-4 rounded-full font-semibold text-lg hover:bg-indigo-50 transition-all hover:scale-105 flex items-center justify-center gap-2 group shadow-xl shadow-indigo-900/20"
            >
              Join the Waitlist
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="/mission"
              className="w-full sm:w-auto px-8 py-4 rounded-full font-medium text-white border border-white/20 hover:bg-white/5 transition-colors text-center"
            >
              Read Our Mission
            </a>
          </div>
        </div>
      </section>

      {/* ── The Mental Load ───────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#323F5D] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif mb-6">The mental load is real</h2>
            <p className="text-lg text-indigo-200 max-w-2xl mx-auto leading-relaxed">
              Holding the household together while also supporting someone whose brain works differently is not a small thing. It is a constant, invisible effort — and it deserves to be acknowledged.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: MessageCircle,
                color: "text-purple-300",
                bg: "bg-purple-500/15",
                title: "The reminders that feel like nagging",
                body: "You are not nagging. You are trying to help. But the person you love hears it differently, and that gap is exhausting for everyone. A tool that reminds them gently — on their terms — takes that pressure off you both.",
              },
              {
                icon: Clock,
                color: "text-blue-300",
                bg: "bg-blue-500/15",
                title: "The tasks that vanish mid-thought",
                body: "Time blindness and working memory challenges mean that a thought — however important — can disappear in seconds. Voice capture lets them grab it the moment it arrives, before the chaos of family life moves on.",
              },
              {
                icon: Heart,
                color: "text-pink-300",
                bg: "bg-pink-500/15",
                title: "The wins that go unnoticed",
                body: "Getting started on something hard is genuinely difficult for a neurodivergent brain. When they do it, it deserves to be celebrated. The app builds in those moments of recognition so progress feels real — not invisible.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="glass-card p-7 rounded-3xl">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.bg} mb-5`}>
                    <Icon className={item.color} size={24} />
                  </div>
                  <h3 className="font-serif text-lg mb-3">{item.title}</h3>
                  <p className="text-indigo-200 text-sm leading-relaxed">{item.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works For Them ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#2A354F]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/15 text-indigo-200 text-sm font-medium mb-6">
              <Sparkles size={14} />
              Designed for their brain, not a neurotypical one
            </div>
            <h2 className="text-4xl font-serif mb-6">How the app actually helps</h2>
            <p className="text-lg text-indigo-200 max-w-2xl mx-auto">
              Every feature was built around the specific challenges that come with ADHD, Autism, and related conditions — not bolted on as an afterthought.
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                icon: Zap,
                color: "text-yellow-300",
                bg: "bg-yellow-500/15",
                title: "AI breaks tasks into the smallest possible steps",
                body: "Task paralysis often happens not because someone is lazy, but because the gap between \"I need to do this\" and \"I know exactly what to do first\" is too wide. The AI breakdown feature closes that gap instantly — turning any task into a clear sequence of tiny, concrete actions. The next step is always obvious.",
              },
              {
                icon: Mic,
                color: "text-pink-300",
                bg: "bg-pink-500/15",
                title: "Voice capture catches thoughts before they disappear",
                body: "Typing is a barrier. Remembering to open an app is a barrier. Speaking is not. A quick voice note — captured the moment a thought arrives — becomes a task automatically. No friction, no forgetting, no frustration.",
              },
              {
                icon: Trophy,
                color: "text-amber-300",
                bg: "bg-amber-500/15",
                title: "Progress is celebrated, not just tracked",
                body: "Streaks, XP, and achievement badges are not gimmicks — they are designed to create the small dopamine moments that neurodivergent brains often need to stay motivated. Completing a task feels like a win, not just a tick in a box.",
              },
              {
                icon: Sparkles,
                color: "text-purple-300",
                bg: "bg-purple-500/15",
                title: "Personality modes match their communication style",
                body: "Some people need warmth and encouragement. Some need directness without fluff. Some want a bit of humour to take the edge off. Cheeky, Positive, and Literal modes let the app speak in a way that actually lands — and they can change it any time.",
              },
              {
                icon: ShieldCheck,
                color: "text-green-300",
                bg: "bg-green-500/15",
                title: "No penalties, no shame, no pressure",
                body: "Missing a day does not trigger a warning. Falling behind does not result in a lecture. The app simply picks up where they left off, every single time. Because shame is not a productivity tool — it is a barrier.",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="glass-card p-7 rounded-3xl flex gap-6 items-start">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.bg} shrink-0`}>
                    <Icon className={item.color} size={26} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl mb-3">{item.title}</h3>
                    <p className="text-indigo-200 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Reading Theme Callout ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#323F5D] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">

            {/* Left: copy */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/15 border border-purple-400/20 text-purple-200 text-sm font-medium mb-6">
                <BookOpen size={14} />
                Dyslexia &amp; Visual Stress Support
              </div>
              <h2 className="text-4xl font-serif mb-6 leading-tight">
                Reading should feel <span className="text-gradient italic">comfortable</span>, not like hard work
              </h2>
              <p className="text-lg text-indigo-100 leading-relaxed mb-5">
                For many people with dyslexia or visual stress (sometimes called Meares-Irlen syndrome), black text on a white or dark background can cause letters to appear to move, blur, or crowd together. Switching to a softer background colour is one of the simplest and most effective adjustments available.
              </p>
              <p className="text-lg text-indigo-100 leading-relaxed mb-8">
                Taskbloom includes six carefully chosen <strong className="text-white">Reading Themes</strong> — each selected based on research from the British Dyslexia Association and the Irlen Institute. The person using the app chooses the colour that works best for their eyes, and it is applied instantly across every screen.
              </p>
              <div className="space-y-3">
                {[
                  { label: "Cream", hex: "#FFF8F0", note: "Warm off-white — reduces glare" },
                  { label: "Sage", hex: "#E8F5E9", note: "Pale green — most commonly cited" },
                  { label: "Sky", hex: "#E3F2FD", note: "Pale blue — second most cited" },
                  { label: "Dusk", hex: "#F3E5F5", note: "Soft lavender — reduces visual noise" },
                  { label: "Sand", hex: "#FFFDE7", note: "Warm yellow — Irlen Institute research" },
                ].map((t) => (
                  <div key={t.label} className="flex items-center gap-4">
                    <span
                      className="w-8 h-8 rounded-xl border border-white/10 shrink-0"
                      style={{ backgroundColor: t.hex }}
                    />
                    <div>
                      <span className="font-semibold text-white text-sm">{t.label}</span>
                      <span className="text-indigo-300 text-sm ml-2">— {t.note}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: visual demo card */}
            <div className="space-y-4">
              <p className="text-sm text-indigo-300 font-medium uppercase tracking-widest mb-2">How it looks in the app</p>
              {[
                { label: "Default (dark)", hex: "#1e293b", textColor: "#f1f5f9", mutedColor: "#94a3b8" },
                { label: "Sage", hex: "#E8F5E9", textColor: "#14532d", mutedColor: "#4d7c5f" },
                { label: "Sky", hex: "#E3F2FD", textColor: "#1e3a5f", mutedColor: "#3b6a9e" },
                { label: "Cream", hex: "#FFF8F0", textColor: "#292524", mutedColor: "#78716c" },
              ].map((t) => (
                <div
                  key={t.label}
                  className="rounded-2xl p-5 border border-black/10 transition-all"
                  style={{ backgroundColor: t.hex }}
                >
                  <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: t.mutedColor }}>{t.label}</p>
                  <p className="text-sm font-medium mb-1" style={{ color: t.textColor }}>Reply to email from school</p>
                  <p className="text-xs" style={{ color: t.mutedColor }}>Due today &middot; Medium energy</p>
                </div>
              ))}
              <p className="text-xs text-indigo-400 text-center pt-2">
                They choose the colour that feels right for them — one more way you can help them do their best.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How to Introduce It ───────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#323F5D] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-serif mb-6">How to introduce it gently</h2>
            <p className="text-lg text-indigo-200 max-w-2xl mx-auto">
              Suggesting a new tool to someone who has tried and been let down by apps before takes care. Here is an approach that tends to work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                step: "1",
                title: "Let them lead the setup",
                body: "Sit with them while they create their account and choose their role and personality mode. Make it their choices, not yours. Ownership from the start makes a real difference.",
              },
              {
                step: "2",
                title: "Start with one real task",
                body: "Pick something they genuinely need to do — not a test task. Ask the AI to break it into steps together. Seeing it work on something real is far more convincing than any demo.",
              },
              {
                step: "3",
                title: "Celebrate the first completion",
                body: "When they tick off that first task, make a small moment of it. The app will too. Reinforcing that early win helps build the habit before it feels like effort.",
              },
              {
                step: "4",
                title: "Step back and let it be theirs",
                body: "The goal is for the app to become their tool, not something you manage for them. Once they are comfortable, resist the urge to check in — trust the process.",
              },
            ].map((item) => (
              <div key={item.step} className="glass-card p-7 rounded-3xl flex gap-5 items-start">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-serif text-lg font-semibold text-indigo-200">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-serif text-lg mb-2">{item.title}</h3>
                  <p className="text-indigo-200 text-sm leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Design Principles Strip ───────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-[#2A354F]">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-indigo-300 text-sm font-semibold uppercase tracking-widest mb-10">
            What we will never do
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: CheckCircle2, text: "Use shame or guilt as motivation" },
              { icon: CheckCircle2, text: "Send aggressive streak warnings" },
              { icon: CheckCircle2, text: "Sell your data or task content" },
              { icon: CheckCircle2, text: "Design for neurotypical defaults" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.text} className="glass-card rounded-2xl px-5 py-4 flex items-center gap-3">
                  <Icon className="text-green-400 shrink-0" size={18} />
                  <span className="text-sm text-indigo-100 leading-snug">{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Built With the Community ──────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#323F5D]">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/15 text-indigo-200 text-sm font-medium mb-6">
                <Users size={14} />
                Community-built
              </div>
              <h2 className="text-4xl font-serif mb-6 leading-tight">
                Built with families, not just for them
              </h2>
              <p className="text-lg text-indigo-100 leading-relaxed mb-6">
                Every design decision in Taskbloom has been shaped by conversations with neurodivergent people and the families who support them. We do not assume — we ask, listen, and build accordingly.
              </p>
              <p className="text-lg text-indigo-100 leading-relaxed mb-8">
                If you have a perspective to share — as a parent, carer, or someone who supports a neurodivergent person — we genuinely want to hear it. Your experience directly shapes what we build next.
              </p>
              <button
                onClick={() => setIsFeedbackOpen(true)}
                className="inline-flex items-center gap-2 border border-white/20 text-white px-7 py-3.5 rounded-full font-semibold hover:bg-white/5 transition-colors"
              >
                Share Your Perspective <ArrowRight size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {[
                {
                  icon: BookOpen,
                  color: "text-purple-300",
                  bg: "bg-purple-500/15",
                  title: "Designed for how they think",
                  body: "Tasks are broken into small, concrete steps — so the next action is always obvious, not overwhelming.",
                },
                {
                  icon: ShieldCheck,
                  color: "text-green-300",
                  bg: "bg-green-500/15",
                  title: "No pressure, no penalties",
                  body: "Consistency is celebrated, not enforced. There are no warnings — just encouragement to keep going.",
                },
                {
                  icon: Heart,
                  color: "text-pink-300",
                  bg: "bg-pink-500/15",
                  title: "Their tool, their rules",
                  body: "The app belongs to the person using it. Autonomy and ownership are central to how it builds confidence over time.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="glass-card p-6 rounded-2xl flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.bg} shrink-0`}>
                      <Icon className={item.color} size={22} />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg mb-1">{item.title}</h3>
                      <p className="text-indigo-200 text-sm leading-relaxed">{item.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Common Questions ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#2A354F]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif mb-4">Questions we hear from families</h2>
            <p className="text-indigo-200">Honest answers, no jargon.</p>
          </div>
          <div className="space-y-3">
            {QUESTIONS.map((q) => (
              <FaqItem key={q.q} q={q.q} a={q.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#3B4A6B] to-[#2A354F]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[120px]" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-serif mb-6">
            A little less to<br />
            <span className="italic text-indigo-200">worry about.</span>
          </h2>
          <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join the waitlist and be among the first to try Taskbloom — a tool that supports the people you love, in the way they actually need.
          </p>

          <form
            className="max-w-md mx-auto flex gap-2 p-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm"
            onSubmit={(e) => { e.preventDefault(); setIsFeedbackOpen(true); }}
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-transparent border-none px-6 py-3 text-white placeholder:text-indigo-300 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-white text-[#3B4A6B] px-8 py-3 rounded-full font-semibold hover:bg-indigo-50 transition-colors"
            >
              Join
            </button>
          </form>
          <p className="mt-4 text-sm text-indigo-300">Free for personal use · No credit card required</p>
        </div>
      </section>

      <MarketingFooter />

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      <BackToTop />
      <CookieConsent />
    </div>
  );
}
