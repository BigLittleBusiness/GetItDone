import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ArrowRight, MessageSquare } from 'lucide-react';
import { clsx } from 'clsx';

type Step = 'role-validation' | 'pain-point' | 'feature-fit' | 'email' | 'done';

const questions = {
  'role-validation': {
    question: "Does the description of this mode feel like your reality?",
    options: [
      { id: 'spot-on', label: "Yes, it's spot on." },
      { id: 'mostly', label: "Mostly, but missing something." },
      { id: 'no', label: "No, not really." }
    ]
  },
  'pain-point': {
    question: "Which of these is your biggest 'Wall of Awful' right now?",
    options: [
      { id: 'starting', label: "Starting: I can't physically move to do it." },
      { id: 'planning', label: "Planning: Too many tasks, don't know where to start." },
      { id: 'remembering', label: "Remembering: If I don't see it, it doesn't exist." },
      { id: 'shame', label: "Shame: I avoid looking because I feel bad." }
    ]
  },
  'feature-fit': {
    question: "If this app could only do ONE thing for you, what should it be?",
    options: [
      { id: 'body-double', label: "Body Double: Talk me through the first step." },
      { id: 'shield', label: "Shield: Hide everything except one task." },
      { id: 'cheerleader', label: "Cheerleader: Celebrate tiny wins." },
      { id: 'secretary', label: "Secretary: Capture voice notes so I don't type." }
    ]
  }
};

export default function FeedbackModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState<Step>('role-validation');
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleAnswer = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
    
    // Auto-advance logic
    if (step === 'role-validation') setStep('pain-point');
    else if (step === 'pain-point') setStep('feature-fit');
    else if (step === 'feature-fit') setStep('email');
  };

  const submitSurvey = trpc.survey.submit.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;

    try {
      await submitSurvey.mutateAsync({
        roleValidation: answers['role-validation'],
        painPoint: answers['pain-point'],
        featureFit: answers['feature-fit'],
        email: email || undefined,
      });

      setStep('done');
      setTimeout(onClose, 2000);
    } catch (error) {
      console.error('Failed to submit survey:', error);
      alert('Failed to submit survey. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#3B4A6B] border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative"
            >
              {/* Close Button */}
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-indigo-200 hover:text-white transition-colors z-10"
              >
                <X size={20} />
              </button>

              {/* Progress Bar */}
              {step !== 'done' && (
                <div className="h-1 bg-white/5 w-full">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-indigo-400 to-purple-400"
                    initial={{ width: '0%' }}
                    animate={{ 
                      width: step === 'role-validation' ? '25%' : 
                             step === 'pain-point' ? '50%' : 
                             step === 'feature-fit' ? '75%' : '90%' 
                    }}
                  />
                </div>
              )}

              <div className="p-8 min-h-[400px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {step === 'email' ? (
                    <motion.div
                      key="email"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                      className="text-center"
                    >
                      <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-300">
                        <MessageSquare size={32} />
                      </div>
                      <h3 className="text-2xl font-serif mb-4">Want to shape the future?</h3>
                      <p className="text-indigo-200 mb-8">
                        We're building this with people like you. Join the beta list to get early access.
                      </p>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <input 
                          type="email" 
                          placeholder="name@example.com"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-indigo-400 focus:outline-none focus:border-indigo-400 transition-colors"
                          required
                        />
                        <button 
                          type="submit"
                          className="w-full bg-white text-[#3B4A6B] font-semibold py-3 rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                        >
                          Join Waitlist <ArrowRight size={18} />
                        </button>
                      </form>
                    </motion.div>
                  ) : step === 'done' ? (
                    <motion.div
                      key="done"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center"
                    >
                      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-400">
                        <Check size={40} />
                      </div>
                      <h3 className="text-2xl font-serif mb-2">You're on the list!</h3>
                      <p className="text-indigo-200">Thanks for your feedback.</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={step}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                    >
                      <h3 className="text-2xl font-serif mb-8 leading-tight">
                        {questions[step].question}
                      </h3>
                      <div className="space-y-3">
                        {questions[step].options.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => handleAnswer(step, option.id)}
                            className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group flex items-center justify-between"
                          >
                            <span className="text-indigo-100 group-hover:text-white transition-colors">
                              {option.label}
                            </span>
                            <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-indigo-300" />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
