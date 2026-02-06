import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Briefcase, Baby, CheckCircle2, BrainCircuit, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

type Role = 'student' | 'parent' | 'professional';

const roles = [
  {
    id: 'student',
    label: 'Student',
    icon: GraduationCap,
    color: 'from-yellow-400 to-orange-500',
    bgAccent: 'bg-yellow-500/20',
    struggle: "I have a paper due in two weeks, so I'll do nothing for 13 days and panic for 24 hours.",
    solution: "Breakdowns for complex projects, visual deadlines, and 'Cheeky' motivation to break paralysis.",
    features: ['Assignment Breakdown', 'Visual Deadlines', 'Study Mode']
  },
  {
    id: 'parent',
    label: 'Parent',
    icon: Baby,
    color: 'from-pink-400 to-rose-500',
    bgAccent: 'bg-pink-500/20',
    struggle: "I remembered the kids' dentist appointment but forgot to eat lunch or pay the electricity bill.",
    solution: "Voice-capture for rapid tasks ('Remind me to buy milk'), shared family calendars, and gentle reinforcement.",
    features: ['Voice Capture', 'Family Calendar', 'Self-Care Reminders']
  },
  {
    id: 'professional',
    label: 'Professional',
    icon: Briefcase,
    color: 'from-blue-400 to-cyan-500',
    bgAccent: 'bg-blue-500/20',
    struggle: "I'm excellent at my job but I'm terrified they'll find out I haven't answered an email in three days.",
    solution: "Context switching to hide 'home' tasks during work hours, meeting prep checklists, and literal communication modes.",
    features: ['Context Switching', 'Meeting Prep', 'Email Triage']
  }
] as const;

export default function RoleExplorer() {
  const [activeRole, setActiveRole] = useState<Role>('student');

  const currentRole = roles.find(r => r.id === activeRole)!;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-serif mb-6">
          One Brain. <span className="italic text-indigo-200">Many Roles.</span>
        </h2>
        <p className="text-lg text-indigo-100 max-w-2xl mx-auto">
          Your brain doesn't stop being neurodivergent when you switch from parent to professional. 
          Get It Done! adapts to your context, filtering out the noise so you can focus on what matters 
          <span className="italic"> right now</span>.
        </p>
      </div>

      {/* Role Selector */}
      <div className="flex justify-center gap-4 mb-12 flex-wrap">
        {roles.map((role) => {
          const Icon = role.icon;
          const isActive = activeRole === role.id;
          
          return (
            <button
              key={role.id}
              onClick={() => setActiveRole(role.id as Role)}
              className={clsx(
                "relative px-6 py-3 rounded-full flex items-center gap-2 transition-all duration-300",
                isActive 
                  ? "bg-white text-indigo-900 shadow-lg scale-105" 
                  : "bg-white/10 text-white hover:bg-white/20"
              )}
            >
              <Icon size={20} />
              <span className="font-medium">{role.label}</span>
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 rounded-full border-2 border-white/50"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Content Card */}
      <div className="relative min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRole}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid md:grid-cols-2 gap-8 items-center"
          >
            {/* Left: The Struggle & Solution */}
            <div className="space-y-8">
              <div className="glass-card p-8 rounded-3xl relative overflow-hidden group">
                <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${currentRole.color}`} />
                <div className="mb-4 flex items-center gap-2 text-indigo-200 text-sm uppercase tracking-wider font-semibold">
                  <BrainCircuit size={16} />
                  The Struggle
                </div>
                <p className="text-xl md:text-2xl font-serif leading-relaxed italic opacity-90">
                  "{currentRole.struggle}"
                </p>
              </div>

              <div className="glass-card p-8 rounded-3xl relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${currentRole.color}`} />
                <div className="mb-4 flex items-center gap-2 text-indigo-200 text-sm uppercase tracking-wider font-semibold">
                  <Sparkles size={16} />
                  The Solution
                </div>
                <p className="text-lg leading-relaxed">
                  {currentRole.solution}
                </p>
              </div>
            </div>

            {/* Right: Visual Feature Highlight */}
            <div className={`relative h-full min-h-[400px] rounded-3xl ${currentRole.bgAccent} backdrop-blur-sm border border-white/10 p-8 flex flex-col justify-center`}>
              {/* Abstract UI Representation */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${currentRole.color}`}>
                      <currentRole.icon className="text-white" size={24} />
                    </div>
                    <span className="text-xl font-serif">{currentRole.label} Mode</span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/10 text-xs">Active</div>
                </div>

                {currentRole.features.map((feature, idx) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 + 0.2 }}
                    className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center gap-4"
                  >
                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                      <CheckCircle2 size={16} className="text-green-400" />
                    </div>
                    <span className="font-medium">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
