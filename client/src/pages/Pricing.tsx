import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import FeedbackModal from "@/components/FeedbackModal";
import MarketingNav from "@/components/MarketingNav";
import BackToTop from "@/components/BackToTop";
import CookieConsent from "@/components/CookieConsent";
import MarketingFooter from "@/components/MarketingFooter";

import {
  ArrowRight,
  Brain,
  Check,
  X,
  Sparkles,
  Zap,
  Trophy,
  Mic,
  ShieldCheck,
  Heart,
  Clock,
  ChevronDown,
  ChevronUp,
  Star,
} from "lucide-react";

const OG_IMAGE = 'https://d2xsxph8kpxj0f.cloudfront.net/310419663031090894/maeA52JBNKsvSZamfPFaVJ/og-default-YNa3mC77hEt2hgiJBT4kDE.png';
const SITE_URL = 'https://getitdone-maea52jb.manus.space';

// ── Feature comparison data ────────────────────────────────────────────────────

type FeatureRow = {
  label: string;
  free: boolean | string;
  pro: boolean | string;
  tooltip?: string;
};

const FEATURE_ROWS: FeatureRow[] = [
  // Core task management
  { label: "Unlimited tasks", free: true, pro: true },
  { label: "Role contexts (Student / Parent / Professional)", free: true, pro: true },
  { label: "Task priority & energy levels", free: true, pro: true },
  { label: "Due dates & due times", free: true, pro: true },
  { label: "Due Today / Due Tomorrow / Overdue chips", free: true, pro: true },
  { label: "Urgency-based auto-sort", free: true, pro: true },
  { label: "Inline due-date calendar editing", free: true, pro: true },
  { label: "Due This Week filter", free: true, pro: true },
  // AI
  { label: "AI task breakdown (micro-steps)", free: "5 per day", pro: "Unlimited" },
  { label: "Voice-to-task capture", free: "10 per day", pro: "Unlimited" },
  // Gamification
  { label: "XP, levels & streaks", free: true, pro: true },
  { label: "Achievement badges", free: true, pro: true },
  // Personality & customisation
  { label: "Personality modes (Cheeky / Positive / Literal)", free: true, pro: true },
  { label: "Custom reminder time & timezone", free: true, pro: true },
  { label: "Due-date & streak notifications", free: true, pro: true },
  // Pro-only
  { label: "Priority support", free: false, pro: true },
  { label: "Early access to new features", free: false, pro: true },
  { label: "Offline mode", free: false, pro: "Coming soon" },
  { label: "Calendar sync (Google / Apple)", free: false, pro: "Coming soon" },
  { label: "Shared task lists & collaboration", free: false, pro: "Coming soon" },
  { label: "Advanced analytics & insights", free: false, pro: "Coming soon" },
];

// ── FAQ data ───────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "Is the free tier really free forever?",
    a: "Yes. Core features — unlimited tasks, AI breakdown (5/day), voice capture (10/day), gamification, personality modes, and notifications — will always be free for personal use. We believe access to tools that support neurodivergent productivity should not be gated behind a paywall.",
  },
  {
    q: "When will the Pro tier be available?",
    a: "We are currently in early access. Pro is in active development and will launch once we have validated the core experience with our community. Everyone on the waitlist will be notified first and offered a founding-member discount.",
  },
  {
    q: "Will my data be safe if I stay on the free tier?",
    a: "Absolutely. We do not sell personal data or use your task content to train external AI models — on any tier. Your tasks are yours.",
  },
  {
    q: "What counts as an 'AI breakdown' or 'voice capture' use?",
    a: "Each time you tap 'Break into steps' on a task, that counts as one AI breakdown use. Each voice recording you submit counts as one voice capture use. Limits reset at midnight in your local timezone.",
  },
  {
    q: "Can I use Get It Done! for my child or someone I care for?",
    a: "Yes. The app is designed to be used directly by neurodivergent individuals of all ages, and parents or carers are welcome to set it up on behalf of someone they support. Each account is personal, so each person would need their own free account.",
  },
  {
    q: "Is there a student discount on Pro?",
    a: "We are planning a reduced rate for students. Join the waitlist and let us know you are a student — we will make sure you hear about it first.",
  },
];

// ── Cell helper ────────────────────────────────────────────────────────────────

function Cell({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="mx-auto text-green-400" size={18} />;
  if (value === false) return <X className="mx-auto text-white/20" size={18} />;
  return <span className="text-indigo-200 text-sm">{value}</span>;
}

// ── FAQ item ───────────────────────────────────────────────────────────────────

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

// ── Page ───────────────────────────────────────────────────────────────────────

export default function Pricing() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#3B4A6B] text-white overflow-x-hidden selection:bg-indigo-500/30">
      <Helmet>
        <title>Pricing — Get It Done!</title>
        <meta name="description" content="Get It Done! is free for personal use. See what's included in the free tier and what's coming in the Pro plan for power users." />
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/pricing`} />
        <meta property="og:title" content="Pricing — Get It Done!" />
        <meta property="og:description" content="Get It Done! is free for personal use. See what's included in the free tier and what's coming in the Pro plan for power users." />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Get It Done!" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={`${SITE_URL}/pricing`} />
        <meta name="twitter:title" content="Pricing — Get It Done!" />
        <meta name="twitter:description" content="Get It Done! is free for personal use. See what's included in the free tier and what's coming in the Pro plan for power users." />
        <meta name="twitter:image" content={OG_IMAGE} />
      </Helmet>

      {/* Navigation */}
      <MarketingNav onJoinWaitlist={() => setIsFeedbackOpen(true)} />

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in-up">
            <ShieldCheck size={14} className="text-green-400" />
            <span className="text-sm font-medium text-indigo-100">Free for personal use, always</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-serif font-medium leading-[1.1] mb-6 animate-fade-in-up [animation-delay:200ms]">
            Simple, honest<br />
            <span className="text-gradient italic">pricing.</span>
          </h1>

          <p className="text-xl text-indigo-100 mb-4 max-w-xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:400ms]">
            Everything you need to get started is free. Pro unlocks unlimited AI, advanced integrations, and priority support — coming soon.
          </p>
        </div>
      </section>

      {/* ── Tier Cards ────────────────────────────────────────────────────────── */}
      <section className="pb-24 px-6 relative z-10">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">

          {/* Free Tier */}
          <div className="glass-card rounded-3xl p-8 flex flex-col">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-300 text-xs font-semibold mb-4">
                <Check size={12} /> Available Now
              </div>
              <h2 className="font-serif text-3xl mb-2">Free</h2>
              <div className="flex items-end gap-1 mb-3">
                <span className="text-5xl font-bold">$0</span>
                <span className="text-indigo-300 mb-2">/ forever</span>
              </div>
              <p className="text-indigo-200 text-sm leading-relaxed">
                Full access to the core experience. No credit card. No expiry. No catch.
              </p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {[
                { icon: Check, color: "text-green-400", text: "Unlimited tasks across all role contexts" },
                { icon: Zap, color: "text-yellow-400", text: "AI task breakdown — 5 per day" },
                { icon: Mic, color: "text-pink-400", text: "Voice-to-task capture — 10 per day" },
                { icon: Trophy, color: "text-amber-400", text: "XP, levels, streaks & achievement badges" },
                { icon: Sparkles, color: "text-purple-400", text: "Cheeky, Positive & Literal personality modes" },
                { icon: Clock, color: "text-blue-400", text: "Smart due-date chips, urgency sort & reminders" },
                { icon: ShieldCheck, color: "text-green-400", text: "Privacy-first — your data is never sold" },
              ].map(({ icon: Icon, color, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <Icon className={`shrink-0 mt-0.5 ${color}`} size={16} />
                  <span className="text-indigo-100 text-sm leading-snug">{text}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="w-full py-3.5 rounded-full font-semibold border border-white/20 text-white hover:bg-white/5 transition-colors"
            >
              Get Started Free
            </button>
          </div>

          {/* Pro Tier */}
          <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400">
            <div className="bg-[#2A354F] rounded-3xl p-8 flex flex-col h-full">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4">
                  <Star size={12} /> Coming Soon
                </div>
                <h2 className="font-serif text-3xl mb-2">Pro</h2>
                <div className="flex items-end gap-1 mb-3">
                  <span className="text-5xl font-bold text-gradient">TBA</span>
                </div>
                <p className="text-indigo-200 text-sm leading-relaxed">
                  Unlimited AI, calendar sync, collaboration, and priority support. Join the waitlist to be notified first and receive a founding-member rate.
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  { icon: Zap, color: "text-yellow-400", text: "Unlimited AI task breakdowns" },
                  { icon: Mic, color: "text-pink-400", text: "Unlimited voice-to-task capture" },
                  { icon: Heart, color: "text-pink-400", text: "Priority support from the team" },
                  { icon: Sparkles, color: "text-purple-400", text: "Early access to every new feature" },
                  { icon: Clock, color: "text-blue-400", text: "Offline mode (coming soon)" },
                  { icon: Check, color: "text-green-400", text: "Calendar sync — Google & Apple (coming soon)" },
                  { icon: Check, color: "text-green-400", text: "Shared task lists & collaboration (coming soon)" },
                  { icon: Check, color: "text-green-400", text: "Advanced analytics & insights (coming soon)" },
                ].map(({ icon: Icon, color, text }) => (
                  <li key={text} className="flex items-start gap-3">
                    <Icon className={`shrink-0 mt-0.5 ${color}`} size={16} />
                    <span className="text-indigo-100 text-sm leading-snug">{text}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setIsFeedbackOpen(true)}
                className="w-full py-3.5 rounded-full font-semibold bg-white text-[#3B4A6B] hover:bg-indigo-50 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 group"
              >
                Join the Waitlist
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ── Feature Comparison Table ──────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#323F5D]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif mb-4">Full feature comparison</h2>
            <p className="text-indigo-200">Everything that is available today, and what is coming with Pro.</p>
          </div>

          <div className="glass-card rounded-3xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-3 px-6 py-4 border-b border-white/10 bg-white/5">
              <div className="text-sm font-semibold text-indigo-200 uppercase tracking-wider">Feature</div>
              <div className="text-center text-sm font-semibold text-green-300 uppercase tracking-wider">Free</div>
              <div className="text-center text-sm font-semibold text-indigo-300 uppercase tracking-wider">Pro</div>
            </div>

            {/* Rows */}
            {FEATURE_ROWS.map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-3 px-6 py-3.5 items-center ${i % 2 === 0 ? "" : "bg-white/[0.02]"} border-b border-white/5 last:border-0`}
              >
                <span className="text-sm text-indigo-100 pr-4">{row.label}</span>
                <div className="text-center"><Cell value={row.free} /></div>
                <div className="text-center"><Cell value={row.pro} /></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Strip ───────────────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-[#2A354F]">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          {[
            {
              icon: ShieldCheck,
              color: "text-green-400",
              bg: "bg-green-500/10",
              title: "No credit card required",
              body: "Sign up and start using the app immediately. We will never ask for payment details to access the free tier.",
            },
            {
              icon: Heart,
              color: "text-pink-400",
              bg: "bg-pink-500/10",
              title: "Cancel anytime",
              body: "When Pro launches, subscriptions will be month-to-month with no lock-in. Cancel whenever you like.",
            },
            {
              icon: Sparkles,
              color: "text-purple-400",
              bg: "bg-purple-500/10",
              title: "Founding member rate",
              body: "Waitlist members will receive a permanently discounted rate when Pro launches — locked in for as long as you stay subscribed.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex flex-col items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.bg}`}>
                  <Icon className={item.color} size={26} />
                </div>
                <h3 className="font-serif text-lg">{item.title}</h3>
                <p className="text-indigo-200 text-sm leading-relaxed">{item.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#323F5D]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif mb-4">Frequently asked questions</h2>
            <p className="text-indigo-200">Honest answers to the questions we hear most often.</p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#3B4A6B] to-[#2A354F]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px]" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-serif mb-8">
            Start free.<br />
            <span className="italic text-indigo-200">Upgrade when you're ready.</span>
          </h2>
          <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto">
            Join the waitlist to get early access and lock in a founding-member rate on Pro.
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
