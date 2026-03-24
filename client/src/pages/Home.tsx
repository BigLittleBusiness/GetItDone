import { useState, useEffect } from 'react';
import RoleExplorer from '@/components/RoleExplorer';
import FeedbackModal from '@/components/FeedbackModal';
import { useAuth } from '@/_core/hooks/useAuth';
import { ArrowRight, Brain, Menu, Mic, Trophy, ShieldCheck, Sparkles, Zap, Layout, Heart, BookOpen, Users } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Home() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  // Trigger feedback modal after 45 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFeedbackOpen(true);
    }, 45000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#3B4A6B] text-white overflow-x-hidden selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#3B4A6B]/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Brain className="text-white" size={24} />
            </div>
            <span className="font-serif text-xl font-semibold tracking-tight">Get It Done!</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-indigo-100">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#mission" className="hover:text-white transition-colors">Our Mission</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            {isAuthenticated ? (
              <button
                onClick={() => setLocation('/dashboard')}
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

          <button className="md:hidden p-2 text-white">
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-medium text-indigo-100">Accepting Early Access Users</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif font-medium leading-[1.1] mb-8 animate-fade-in-up [animation-delay:200ms]">
            The Productivity OS for <br />
            <span className="text-gradient italic">Neurodivergent Minds</span>
          </h1>
          
          <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:400ms]">
            Stop fighting your brain. Start working with it. A smart, empathetic task manager designed for ADHD, Autism, and the way you actually think.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up [animation-delay:600ms]">
            <button 
              onClick={() => setIsFeedbackOpen(true)}
              className="w-full sm:w-auto bg-white text-[#3B4A6B] px-8 py-4 rounded-full font-semibold text-lg hover:bg-indigo-50 transition-all hover:scale-105 flex items-center justify-center gap-2 group shadow-xl shadow-indigo-900/20"
            >
              Get Early Access
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 rounded-full font-medium text-white border border-white/20 hover:bg-white/5 transition-colors">
              Watch the Demo
            </button>
          </div>
        </div>
      </section>

      {/* Role Explorer Section */}
      <section id="features" className="bg-[#3B4A6B] relative py-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-transparent pointer-events-none" />
        <RoleExplorer />
      </section>

      {/* The Getting Started Section */}
      <section className="py-24 px-6 bg-[#323F5D] relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur-3xl opacity-20" />
                <div className="glass-card p-8 rounded-3xl relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400">
                      <Mic size={24} />
                    </div>
                    <div>
                      <div className="text-sm text-indigo-200 uppercase tracking-wider font-semibold">Voice Capture</div>
                      <div className="font-serif text-xl">"Remind me to buy milk..."</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 bg-white/10 rounded-full w-full" />
                    <div className="h-2 bg-white/10 rounded-full w-3/4" />
                    <div className="h-2 bg-white/10 rounded-full w-1/2" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="order-1 md:order-2">
              <h2 className="text-4xl font-serif mb-6">Build Your Bridge to Getting Started</h2>
              <p className="text-lg text-indigo-100 leading-relaxed mb-8">
                For a neurodivergent brain, the first step is often the hardest. We make that step so small it almost takes care of itself.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 p-1 rounded-full bg-green-400/20 text-green-400">
                    <Zap size={16} />
                  </div>
                  <div>
                    <strong className="block text-white">Voice-First Entry</strong>
                    <span className="text-indigo-200">Dump your mental load by speaking. No typing required.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 p-1 rounded-full bg-blue-400/20 text-blue-400">
                    <Layout size={16} />
                  </div>
                  <div>
                    <strong className="block text-white">Smart Breakdown</strong>
                    <span className="text-indigo-200">AI breaks overwhelming projects into tiny, non-threatening steps.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Dopamine Section */}
      <section className="py-24 px-6 bg-[#2A354F]">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-serif mb-6">Dopamine on Demand</h2>
          <p className="text-lg text-indigo-200 max-w-2xl mx-auto">
            We use gamification not to addict you, but to provide the chemical spark your brain needs to get started.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="glass-card p-8 rounded-3xl hover:bg-white/5 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 flex items-center justify-center text-yellow-400 mb-6">
              <Trophy size={28} />
            </div>
            <h3 className="text-xl font-serif mb-3">Visual Streaks</h3>
            <p className="text-indigo-200">
              See your consistency build up. Don't break the chain.
            </p>
          </div>

          <div className="glass-card p-8 rounded-3xl hover:bg-white/5 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-6">
              <Sparkles size={28} />
            </div>
            <h3 className="text-xl font-serif mb-3">Personality Modes</h3>
            <p className="text-indigo-200">
              Choose "Cheeky" for a roast, "Positive" for a hug, or "Literal" for clarity.
            </p>
          </div>

          <div className="glass-card p-8 rounded-3xl hover:bg-white/5 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-400 mb-6">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-xl font-serif mb-3">Shame-Free Zone</h3>
            <p className="text-indigo-200">
              Missed a day? No red text. No guilt trips. Just a fresh start.
            </p>
          </div>
        </div>
      </section>

      {/* For Parents & Carers Section */}
      <section id="parents" className="py-24 px-6 bg-[#323F5D] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">

            {/* Text side */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/15 text-purple-300 text-sm font-medium mb-6">
                <Heart size={14} />
                For Parents &amp; Carers
              </div>
              <h2 className="text-4xl font-serif mb-6 leading-tight">
                Supporting someone you care about
              </h2>
              <p className="text-lg text-indigo-100 leading-relaxed mb-8">
                You know the person in your life is capable. Sometimes they just need the right tools to get going — and a little less friction between thinking and doing.
              </p>
              <p className="text-lg text-indigo-100 leading-relaxed mb-10">
                Get It Done! is designed to work with how neurodivergent brains actually operate, not against them. That means fewer reminders that feel like nagging, and more moments that feel like wins.
              </p>
              <button
                onClick={() => setIsFeedbackOpen(true)}
                className="inline-flex items-center gap-2 bg-white text-[#3B4A6B] px-7 py-3.5 rounded-full font-semibold hover:bg-indigo-50 transition-colors"
              >
                Join the Waitlist <ArrowRight size={18} />
              </button>
            </div>

            {/* Cards side */}
            <div className="space-y-4">
              <div className="glass-card p-6 rounded-2xl flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 shrink-0">
                  <BookOpen size={22} />
                </div>
                <div>
                  <h3 className="font-serif text-lg mb-1">Designed for how they think</h3>
                  <p className="text-indigo-200 text-sm leading-relaxed">
                    Tasks are broken into small, concrete steps — so the next action is always obvious, not overwhelming.
                  </p>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 shrink-0">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="font-serif text-lg mb-1">No pressure, no penalties</h3>
                  <p className="text-indigo-200 text-sm leading-relaxed">
                    Missing a day resets gently. There is no streak-shame, no red warnings — just an easy path back to momentum.
                  </p>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-green-500/20 flex items-center justify-center text-green-300 shrink-0">
                  <Users size={22} />
                </div>
                <div>
                  <h3 className="font-serif text-lg mb-1">Built with the community</h3>
                  <p className="text-indigo-200 text-sm leading-relaxed">
                    We work directly with neurodivergent people and their families to make sure the app reflects real experiences, not assumptions.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
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
          
          <form className="max-w-md mx-auto flex gap-2 p-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 bg-transparent border-none px-6 py-3 text-white placeholder:text-indigo-300 focus:outline-none"
            />
            <button className="bg-white text-[#3B4A6B] px-8 py-3 rounded-full font-semibold hover:bg-indigo-50 transition-colors">
              Join
            </button>
          </form>
          <p className="mt-4 text-sm text-indigo-300">
            Free for personal use • No credit card required
          </p>
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
