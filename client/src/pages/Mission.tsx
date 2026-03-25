import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import FeedbackModal from "@/components/FeedbackModal";
import {
  Brain,
  ArrowRight,
  Heart,
  Users,
  ShieldCheck,
  Lightbulb,
  BookOpen,
  Zap,
  Menu,
  AlertCircle,
  CheckCircle2,
  Quote,
} from "lucide-react";

export default function Mission() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#3B4A6B] text-white overflow-x-hidden selection:bg-indigo-500/30">

      {/* Navigation — identical to Home */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#3B4A6B]/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Brain className="text-white" size={24} />
            </div>
            <span className="font-serif text-xl font-semibold tracking-tight">Get It Done!</span>
          </a>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-indigo-100">
            <a href="/#features" className="hover:text-white transition-colors">Features</a>
            <a href="/mission" className="text-white border-b border-white/40 pb-0.5">Our Mission</a>
            <a href="/pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="/parents" className="hover:text-white transition-colors">For Parents &amp; Carers</a>
            {isAuthenticated ? (
              <button
                onClick={() => setLocation("/dashboard")}
                className="bg-white text-[#3B4A6B] px-5 py-2.5 rounded-full hover:bg-indigo-50 transition-colors font-semibold"
              >
                Go to App →
              </button>
            ) : (
              <button
                onClick={() => setIsFeedbackOpen(true)}
                className="bg-white text-[#3B4A6B] px-5 py-2.5 rounded-full hover:bg-indigo-50 transition-colors font-semibold"
              >
                Join Waitlist
              </button>
            )}
          </div>

          {/* Mobile menu */}
          <div className="md:hidden flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => setLocation("/dashboard")}
                className="text-sm bg-white text-[#3B4A6B] px-4 py-2 rounded-full font-semibold"
              >
                Go to App
              </button>
            ) : (
              <button
                onClick={() => setIsFeedbackOpen(true)}
                className="text-sm bg-white text-[#3B4A6B] px-4 py-2 rounded-full font-semibold"
              >
                Join Waitlist
              </button>
            )}
            <details className="relative group">
              <summary className="list-none p-2 text-white cursor-pointer">
                <Menu size={24} />
              </summary>
              <div className="absolute right-0 top-full mt-2 w-56 bg-[#2A354F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                <a href="/#features" className="block px-5 py-3 text-sm text-indigo-100 hover:bg-white/5 hover:text-white transition-colors">Features</a>
                <a href="/mission" className="block px-5 py-3 text-sm text-white bg-white/5">Our Mission</a>
                <a href="/pricing" className="block px-5 py-3 text-sm text-indigo-100 hover:bg-white/5 hover:text-white transition-colors">Pricing</a>
                <a href="/parents" className="block px-5 py-3 text-sm text-indigo-100 hover:bg-white/5 hover:text-white transition-colors border-t border-white/5">For Parents &amp; Carers</a>
              </div>
            </details>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="pt-40 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in-up">
            <Heart size={14} className="text-pink-400" />
            <span className="text-sm font-medium text-indigo-100">Built with purpose, not just product</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-serif font-medium leading-[1.1] mb-8 animate-fade-in-up [animation-delay:200ms]">
            We believe every brain<br />
            <span className="text-gradient italic">deserves to thrive.</span>
          </h1>

          <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:400ms]">
            Get It Done! exists because the world's productivity tools were built for a specific kind of mind — and that mind isn't yours. We're here to change that.
          </p>
        </div>
      </section>

      {/* ── The Problem ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#323F5D] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-300 text-sm font-medium mb-6">
              <AlertCircle size={14} />
              The Problem
            </div>
            <h2 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">
              The tools weren't built for you.
            </h2>
            <p className="text-lg text-indigo-200 max-w-3xl mx-auto leading-relaxed">
              Conventional productivity systems assume a brain that plans linearly, feels motivated by deadlines, and can simply "decide" to start. For the estimated 1 in 7 people who are neurodivergent, those assumptions create daily friction — and daily shame.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                label: "Task paralysis",
                body: "Knowing what needs to be done but being unable to begin — not laziness, but a genuine neurological barrier that standard to-do lists make worse.",
                color: "bg-red-500/10 text-red-300",
              },
              {
                label: "Time blindness",
                body: "Difficulty sensing how long tasks take or how close a deadline really is. Calendars and timers help neurotypical brains; they often add anxiety to neurodivergent ones.",
                color: "bg-amber-500/10 text-amber-300",
              },
              {
                label: "Shame spirals",
                body: "Missing a task triggers guilt. Guilt makes starting the next one harder. Most apps punish missed streaks — we think that's exactly backwards.",
                color: "bg-purple-500/10 text-purple-300",
              },
            ].map((item) => (
              <div key={item.label} className="glass-card p-7 rounded-3xl">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 ${item.color}`}>
                  {item.label}
                </div>
                <p className="text-indigo-200 leading-relaxed text-sm">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Belief ───────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#2A354F]">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/15 text-indigo-300 text-sm font-medium mb-6">
                <Lightbulb size={14} />
                Our Belief
              </div>
              <h2 className="text-4xl font-serif mb-6 leading-tight">
                Neurodivergence is not a deficit.<br />
                <span className="text-gradient">It is a different operating system.</span>
              </h2>
              <p className="text-lg text-indigo-100 leading-relaxed mb-6">
                ADHD, Autism, dyslexia, and related conditions are not flaws to be corrected. They are different ways of processing the world — with genuine strengths and specific support needs.
              </p>
              <p className="text-lg text-indigo-100 leading-relaxed">
                Our job is not to make neurodivergent people work like everyone else. It is to build tools that work the way they already do.
              </p>
            </div>

            {/* Pull quote */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl" />
              <div className="glass-card p-10 rounded-3xl relative">
                <Quote className="text-indigo-400 mb-6" size={36} />
                <p className="text-2xl font-serif leading-relaxed text-white mb-6">
                  "The right tool doesn't change who you are. It lets you show up as who you already are."
                </p>
                <p className="text-indigo-300 text-sm font-medium">— The Get It Done! Team</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Principles ───────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#323F5D]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-300 text-sm font-medium mb-6">
              <CheckCircle2 size={14} />
              How We Build
            </div>
            <h2 className="text-4xl font-serif mb-6">The principles behind every decision</h2>
            <p className="text-lg text-indigo-200 max-w-2xl mx-auto">
              Every feature, every word, and every interaction in Get It Done! is guided by the same five commitments.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                icon: ShieldCheck,
                color: "bg-green-500/20 text-green-400",
                title: "No shame, ever",
                body: "We do not punish missed days, incomplete tasks, or slow progress. Every session begins with a clean slate. Encouragement is not conditional on performance.",
              },
              {
                icon: Zap,
                color: "bg-yellow-500/20 text-yellow-400",
                title: "The smallest possible next step",
                body: "Paralysis shrinks when the next action is concrete and tiny. Our AI breaks every task into steps so small that starting becomes the easiest thing on the list.",
              },
              {
                icon: BookOpen,
                color: "bg-blue-500/20 text-blue-400",
                title: "Clarity over cleverness",
                body: "Ambiguity is cognitively expensive. We use plain language, predictable layouts, and direct instructions — especially in the Literal mode, designed for Autistic users who prefer precision over metaphor.",
              },
              {
                icon: Users,
                color: "bg-purple-500/20 text-purple-400",
                title: "Built with the community, not for it",
                body: "We work directly with neurodivergent people and their families throughout design and development. Lived experience is not a nice-to-have — it is a requirement.",
              },
              {
                icon: Heart,
                color: "bg-pink-500/20 text-pink-400",
                title: "Progress is personal",
                body: "There is no universal definition of a productive day. We celebrate what you get done — whether that is one task or ten — and we never compare you to anyone else.",
              },
            ].map((principle) => {
              const Icon = principle.icon;
              return (
                <div
                  key={principle.title}
                  className="glass-card p-7 rounded-2xl flex items-start gap-5 hover:bg-white/5 transition-colors"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${principle.color}`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl mb-2">{principle.title}</h3>
                    <p className="text-indigo-200 leading-relaxed">{principle.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Who We're Building For ───────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#2A354F] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 pointer-events-none" />
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/15 text-purple-300 text-sm font-medium mb-6">
              <Users size={14} />
              Who We're Building For
            </div>
            <h2 className="text-4xl font-serif mb-6">Real people. Real challenges.</h2>
            <p className="text-lg text-indigo-200 max-w-2xl mx-auto">
              Get It Done! is designed for anyone whose brain makes conventional productivity tools feel like they were built for someone else.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                emoji: "🎓",
                role: "Students",
                body: "Managing assignments, exams, and the paralysis of 'I'll start tomorrow.' We break the work into steps so small that starting is no longer the hard part.",
              },
              {
                emoji: "👨‍👩‍👧",
                role: "Parents & Carers",
                body: "Holding the mental load of a household while managing your own executive function is a lot. Voice-capture tasks the moment they come to mind, so nothing gets lost in the beautiful chaos of family life.",
              },
              {
                emoji: "💼",
                role: "Professionals",
                body: "Context-switching between work and home, managing email overwhelm, and showing up prepared — without the three-day guilt spiral when something slips.",
              },
            ].map((card) => (
              <div key={card.role} className="glass-card p-8 rounded-3xl text-center hover:bg-white/5 transition-colors">
                <div className="text-5xl mb-5">{card.emoji}</div>
                <h3 className="font-serif text-xl mb-3">{card.role}</h3>
                <p className="text-indigo-200 text-sm leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Commitment ───────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#323F5D]">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-5">
              {[
                {
                  icon: ShieldCheck,
                  color: "text-green-400",
                  bg: "bg-green-500/10",
                  title: "Free for personal use",
                  body: "Core features will always be free. We believe access to tools that support mental wellbeing should not be gated behind a subscription.",
                },
                {
                  icon: BookOpen,
                  color: "text-blue-400",
                  bg: "bg-blue-500/10",
                  title: "Privacy by design",
                  body: "Your tasks, your data. We do not sell personal information or use your task data to train external AI models.",
                },
                {
                  icon: Lightbulb,
                  color: "text-yellow-400",
                  bg: "bg-yellow-500/10",
                  title: "Continuously improving",
                  body: "We are in early access. We will keep listening, keep learning, and keep building — guided by the people who use the app every day.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${item.bg}`}>
                      <Icon className={item.color} size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                      <p className="text-indigo-200 text-sm leading-relaxed">{item.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/15 text-indigo-300 text-sm font-medium mb-6">
                <Heart size={14} />
                Our Commitment
              </div>
              <h2 className="text-4xl font-serif mb-6 leading-tight">
                We're in this for the long run.
              </h2>
              <p className="text-lg text-indigo-100 leading-relaxed mb-8">
                Get It Done! is not a side project or a quick experiment. It is a long-term commitment to building infrastructure for neurodivergent productivity — starting with the tools that matter most and growing with the community that shapes them.
              </p>
              <button
                onClick={() => setIsFeedbackOpen(true)}
                className="inline-flex items-center gap-2 bg-white text-[#3B4A6B] px-7 py-3.5 rounded-full font-semibold hover:bg-indigo-50 transition-all hover:scale-105 group"
              >
                Join the Waitlist
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#3B4A6B] to-[#2A354F]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px]" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-serif mb-8">
            Ready to work <span className="italic text-indigo-200">with</span> your brain?
          </h2>
          <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto">
            Join the waitlist today and be the first to experience the productivity OS built for you.
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

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />

      {/* Footer */}
      <footer className="bg-[#1E2639] py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-80">
            <Brain size={20} />
            <span className="font-serif font-medium">Get It Done!</span>
          </div>
          <div className="flex gap-8 text-sm text-indigo-300">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <div className="text-sm text-indigo-400">
            © 2026 Get It Done! Built with ❤️ for neurodivergent minds.
          </div>
        </div>
      </footer>
    </div>
  );
}
