import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import RoleExplorer from '@/components/tasks/RoleExplorer';
import FeedbackModal from '@/components/shared/FeedbackModal';
import MarketingNav from '@/components/layout/MarketingNav';
import BackToTop from '@/components/shared/BackToTop';
import CookieConsent from '@/components/shared/CookieConsent';
import MarketingFooter from '@/components/layout/MarketingFooter';
import { useAuth } from '@/_core/hooks/useAuth';
import { ArrowRight, Brain, Mic, Trophy, ShieldCheck, Sparkles, Zap, Layout, Heart, BookOpen, Users } from 'lucide-react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';

const DEFAULT_OG_IMAGE = 'https://d2xsxph8kpxj0f.cloudfront.net/310419663031090894/maeA52JBNKsvSZamfPFaVJ/og-default-YNa3mC77hEt2hgiJBT4kDE.png';
const SITE_URL = 'https://taskbloom.app';

/** Smoothly scrolls to an element by id, accounting for the 80px fixed nav. */
function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Home() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: logoConfig } = trpc.admin.getLogo.useQuery(undefined, { staleTime: 5 * 60 * 1000 });
  const ogImage = logoConfig?.ogImageUrl ?? DEFAULT_OG_IMAGE;

  // Bottom CTA waitlist form state
  const [ctaEmail, setCtaEmail] = useState('');
  const [ctaStatus, setCtaStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const submitWaitlist = trpc.survey.submit.useMutation();

  const handleCtaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ctaEmail.trim()) return;
    setCtaStatus('loading');
    try {
      await submitWaitlist.mutateAsync({ email: ctaEmail.trim() });
      setCtaStatus('success');
      setCtaEmail('');
    } catch {
      setCtaStatus('error');
    }
  };
  
  // Trigger feedback modal after 45 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFeedbackOpen(true);
    }, 45000);
    return () => clearTimeout(timer);
  }, []);

  // Handle in-page anchor clicks from the nav (e.g. /#features) so they
  // scroll smoothly instead of triggering a full page reload.
  useEffect(() => {
    function handleAnchorClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute('href') ?? '';
      // Only intercept same-page hash links like "#features" or "/#features"
      const hashMatch = href.match(/^\/?#(.+)$/);
      if (!hashMatch) return;
      const id = hashMatch[1];
      const section = document.getElementById(id);
      if (!section) return;
      e.preventDefault();
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  return (
    <div className="min-h-screen bg-[#3B4A6B] text-white overflow-x-hidden selection:bg-indigo-500/30">
      <Helmet>
        <title>Taskbloom — The Productivity OS for Neurodivergent Minds</title>
        <meta name="description" content="A smart, empathetic task manager designed for ADHD, Autism, and the way you actually think. Voice capture, AI task breakdown, streaks, and more." />
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content="Taskbloom — The Productivity OS for Neurodivergent Minds" />
        <meta property="og:description" content="A smart, empathetic task manager designed for ADHD, Autism, and the way you actually think. Voice capture, AI task breakdown, streaks, and more." />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Taskbloom" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={SITE_URL} />
        <meta name="twitter:title" content="Taskbloom — The Productivity OS for Neurodivergent Minds" />
        <meta name="twitter:description" content="A smart, empathetic task manager designed for ADHD, Autism, and the way you actually think. Voice capture, AI task breakdown, streaks, and more." />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>
      {/* Navigation */}
      <MarketingNav onJoinWaitlist={() => setIsFeedbackOpen(true)} />

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
            Your brain works differently. So does this app. A smart, empathetic task manager designed for ADHD, Autism, and the way you actually think.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up [animation-delay:600ms]">
            <button 
              onClick={() => setIsFeedbackOpen(true)}
              className="w-full sm:w-auto bg-white text-[#3B4A6B] px-8 py-4 rounded-full font-semibold text-lg hover:bg-indigo-50 transition-all hover:scale-105 flex items-center justify-center gap-2 group shadow-xl shadow-indigo-900/20"
            >
              Get Early Access
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="w-full sm:w-auto px-8 py-4 rounded-full font-medium text-white border border-white/20 hover:bg-white/5 transition-colors"
            >
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
                    <span className="text-indigo-200">Capture your thoughts by speaking. No typing required.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 p-1 rounded-full bg-blue-400/20 text-blue-400">
                    <Layout size={16} />
                  </div>
                  <div>
                    <strong className="block text-white">Smart Breakdown</strong>
                    <span className="text-indigo-200">AI breaks any project into clear, manageable steps — so the next action is always obvious.</span>
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
          <h2 className="text-4xl font-serif mb-6">Progress That Feels Good</h2>
          <p className="text-lg text-indigo-200 max-w-2xl mx-auto">
            Small wins add up. We build in moments of recognition so getting things done feels rewarding, not like a chore.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="glass-card p-8 rounded-3xl hover:bg-white/5 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 flex items-center justify-center text-yellow-400 mb-6">
              <Trophy size={28} />
            </div>
            <h3 className="text-xl font-serif mb-3">Visual Streaks</h3>
            <p className="text-indigo-200">
              Watch your consistency grow, one day at a time.
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
            <h3 className="text-xl font-serif mb-3">A Fresh Start, Always</h3>
            <p className="text-indigo-200">
              Every day begins with a clean slate. Progress is celebrated, and picking back up is always easy.
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
                Taskbloom is designed to work with how neurodivergent brains actually operate, not against them. That means fewer reminders that feel like nagging, and more moments that feel like wins.
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
                    Consistency is celebrated, not enforced. There are no warnings — just encouragement to keep going.
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
          
          {ctaStatus === 'success' ? (
            <div className="max-w-md mx-auto py-4 px-6 bg-green-500/20 border border-green-400/30 rounded-full text-green-300 font-medium">
              You're on the list! We'll be in touch when we launch. 🎉
            </div>
          ) : (
            <form onSubmit={handleCtaSubmit} className="max-w-md mx-auto flex gap-2 p-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm">
              <input
                type="email"
                required
                value={ctaEmail}
                onChange={e => { setCtaEmail(e.target.value); setCtaStatus('idle'); }}
                placeholder="Enter your email"
                className="flex-1 bg-transparent border-none px-6 py-3 text-white placeholder:text-indigo-300 focus:outline-none"
                disabled={ctaStatus === 'loading'}
              />
              <button
                type="submit"
                disabled={ctaStatus === 'loading'}
                className="bg-white text-[#3B4A6B] px-8 py-3 rounded-full font-semibold hover:bg-indigo-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {ctaStatus === 'loading' ? 'Joining…' : 'Join'}
              </button>
            </form>
          )}
          {ctaStatus === 'error' && (
            <p className="mt-3 text-sm text-red-300">Something went wrong — please try again.</p>
          )}
          <p className="mt-4 text-sm text-indigo-300">
            Free for personal use • No credit card required
          </p>
        </div>
      </section>

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      <BackToTop />
      <CookieConsent />

      <MarketingFooter />
    </div>
  );
}
