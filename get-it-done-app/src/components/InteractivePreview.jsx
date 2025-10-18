import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Mic, CheckCircle, Flame, Star } from 'lucide-react'

export default function InteractivePreview({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)

  const steps = [
    {
      title: "Add tasks with your voice",
      description: "Just speak naturally - no buttons to press",
      demo: "voice"
    },
    {
      title: "Get personalized motivation",
      description: "Messages tailored to your style and goals",
      demo: "message"
    },
    {
      title: "Build your streak",
      description: "Celebrate every win and stay motivated",
      demo: "streak"
    }
  ]

  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        if (currentStep === steps.length - 1) {
          setShowCelebration(true)
          setTimeout(() => {
            onComplete()
          }, 1500)
        } else {
          setCurrentStep(currentStep + 1)
        }
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [currentStep])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep 
                  ? 'w-8 bg-indigo-600' 
                  : index < currentStep 
                    ? 'w-2 bg-indigo-400' 
                    : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Demo Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full blur-3xl opacity-50 -z-10" />
          
          {/* Step Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {steps[currentStep].title}
            </h2>
            <p className="text-lg text-gray-600">
              {steps[currentStep].description}
            </p>
          </div>

          {/* Demo Visualization */}
          <div className="min-h-[300px] flex items-center justify-center">
            
            {/* Voice Demo */}
            {steps[currentStep].demo === 'voice' && (
              <div className="w-full space-y-6 animate-fadeIn">
                {/* Voice button */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-teal-400 rounded-full animate-ping opacity-75" />
                    <button className="relative w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                      <Mic className="w-10 h-10 text-white" />
                    </button>
                  </div>
                </div>
                
                {/* Listening indicator */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-1 bg-red-500 rounded-full animate-pulse"
                          style={{
                            height: `${20 + Math.random() * 20}px`,
                            animationDelay: `${i * 0.15}s`
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-red-900 font-medium">Listening... "Call dentist tomorrow"</p>
                  </div>
                </div>

                {/* Task created */}
                <div className="bg-green-50 border-2 border-green-400 rounded-xl p-4 animate-slideUp">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Task added!</p>
                      <p className="text-sm text-gray-600">Call dentist - Tomorrow</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Message Demo */}
            {steps[currentStep].demo === 'message' && (
              <div className="w-full space-y-4 animate-fadeIn">
                {/* Bot message */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">GD</span>
                  </div>
                  <div className="flex-1 bg-gradient-to-r from-orange-100 to-yellow-100 border-l-4 border-orange-500 rounded-lg p-4 animate-slideRight">
                    <p className="text-gray-900 font-medium">
                      Nice! You're on a roll today. That dentist appointment won't schedule itself though... 😏
                    </p>
                    <p className="text-xs text-gray-600 mt-2">Cheeky Mode</p>
                  </div>
                </div>

                {/* Alternative message */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">GD</span>
                  </div>
                  <div className="flex-1 bg-gradient-to-r from-indigo-100 to-blue-100 border-l-4 border-indigo-500 rounded-lg p-4 animate-slideRight" style={{ animationDelay: '0.3s' }}>
                    <p className="text-gray-900 font-medium">
                      Great work! You're making excellent progress today. Keep it up! 🌟
                    </p>
                    <p className="text-xs text-gray-600 mt-2">Positive Mode</p>
                  </div>
                </div>
              </div>
            )}

            {/* Streak Demo */}
            {steps[currentStep].demo === 'streak' && (
              <div className="w-full space-y-6 animate-fadeIn">
                {/* Streak counter */}
                <div className="bg-white border-2 border-orange-300 rounded-2xl p-8 shadow-lg">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Flame className="w-8 h-8 text-orange-500" />
                    <h3 className="text-xl font-semibold text-gray-900">Current Streak</h3>
                  </div>
                  
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-center gap-4">
                      <Star className="w-8 h-8 text-yellow-500 animate-bounce" />
                      <p className="text-7xl font-bold text-orange-500 animate-countUp">7</p>
                      <Flame className="w-8 h-8 text-orange-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <p className="text-gray-600 text-lg mt-2">days in a row</p>
                  </div>

                  {/* Celebration */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 rounded-lg p-4 animate-slideUp">
                    <p className="text-center text-orange-900 font-semibold">
                      🎉 One week streak! You're crushing it!
                    </p>
                  </div>
                </div>

                {/* Achievement badges preview */}
                <div className="flex justify-center gap-3">
                  {[
                    { emoji: '🏅', label: 'Week Warrior', color: 'from-yellow-400 to-orange-400' },
                    { emoji: '✅', label: 'Task Master', color: 'from-green-400 to-teal-400' },
                    { emoji: '💖', label: 'Self-Care', color: 'from-pink-400 to-rose-400' }
                  ].map((badge, i) => (
                    <div
                      key={i}
                      className={`bg-gradient-to-br ${badge.color} rounded-xl p-3 shadow-md animate-scaleIn`}
                      style={{ animationDelay: `${i * 0.2}s` }}
                    >
                      <div className="text-2xl mb-1">{badge.emoji}</div>
                      <p className="text-xs font-semibold text-white">{badge.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Skip button */}
          <div className="text-center mt-8">
            <Button
              onClick={onComplete}
              variant="ghost"
              className="text-gray-500 hover:text-gray-700"
            >
              Skip preview
            </Button>
          </div>
        </div>

        {/* Celebration overlay */}
        {showCelebration && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl p-12 text-center animate-scaleIn">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">You're all set!</h2>
              <p className="text-lg text-gray-600">Let's get you started...</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideRight {
          from { 
            opacity: 0;
            transform: translateX(-20px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.8);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes countUp {
          from { 
            transform: scale(0.5);
            opacity: 0;
          }
          to { 
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
        .animate-slideRight {
          animation: slideRight 0.5s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out;
        }
        .animate-countUp {
          animation: countUp 0.6s ease-out;
        }
      `}</style>
    </div>
  )
}

