import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, ArrowRight, ArrowLeft, Flame, Plus, Settings, Calendar } from 'lucide-react'

export default function ProductTour({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0)

  const tourSteps = [
    {
      title: "Welcome to your dashboard!",
      description: "This is your command center. Here you'll see your tasks, streak, and achievements.",
      target: "dashboard",
      icon: Flame,
      highlight: "top-section"
    },
    {
      title: "Add tasks instantly",
      description: "Click the '+' button or use the microphone icon to add tasks by voice. It's that simple!",
      target: "add-button",
      icon: Plus,
      highlight: "add-task-button"
    },
    {
      title: "Switch between contexts",
      description: "Juggling multiple roles? Switch between Student, Professional, and Parent modes to see relevant tasks.",
      target: "context-switcher",
      icon: Calendar,
      highlight: "context-menu"
    },
    {
      title: "Customize your experience",
      description: "Visit Settings to change your motivation style, connect your calendar, and personalize notifications.",
      target: "settings",
      icon: Settings,
      highlight: "settings-button"
    }
  ]

  const currentTourStep = tourSteps[currentStep]

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 z-50 animate-fadeIn" />

      {/* Tour Card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 pointer-events-auto animate-scaleIn">
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {tourSteps.map((_, index) => (
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

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center">
              <currentTourStep.icon className="w-8 h-8 text-indigo-600" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {currentTourStep.title}
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              {currentTourStep.description}
            </p>
          </div>

          {/* Visual hint based on step */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 mb-8">
            {currentStep === 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Flame className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Your Streak</p>
                    <p className="text-sm text-gray-600">Keep it going every day!</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">✅</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Your Tasks</p>
                    <p className="text-sm text-gray-600">Organized and ready to go</p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-500 rounded-full mb-3 animate-pulse">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm text-gray-700">
                  Look for this button in the top right corner
                </p>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-2">
                <div className="bg-white border-2 border-teal-400 rounded-lg p-3 text-center">
                  <p className="font-semibold text-gray-900">🎓 Student Mode</p>
                </div>
                <div className="bg-white border-2 border-orange-400 rounded-lg p-3 text-center">
                  <p className="font-semibold text-gray-900">💼 Professional Mode</p>
                </div>
                <div className="bg-white border-2 border-green-400 rounded-lg p-3 text-center">
                  <p className="font-semibold text-gray-900">👶 Parent Mode</p>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
                  <Settings className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-sm text-gray-700">
                  Access Settings from the menu or sidebar
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div>
              {currentStep > 0 && (
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleSkip}
                variant="ghost"
                className="text-gray-600"
              >
                Skip tour
              </Button>
              
              <Button
                onClick={handleNext}
                className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
              >
                {currentStep === tourSteps.length - 1 ? "Let's go!" : "Next"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Step counter */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Step {currentStep + 1} of {tourSteps.length}
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.9);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </>
  )
}

