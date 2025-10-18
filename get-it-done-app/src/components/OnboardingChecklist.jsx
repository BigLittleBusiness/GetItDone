import { useState, useEffect } from 'react'
import { CheckCircle, Circle, ChevronDown, ChevronUp, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OnboardingChecklist({ user, tasks, onClose }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [checklist, setChecklist] = useState([])

  useEffect(() => {
    if (!user) return

    const items = [
      {
        id: 'complete_profile',
        title: 'Complete your profile',
        description: 'Add your roles and preferences',
        completed: user.roles && user.roles.length > 0 && user.primaryRole,
        action: () => window.location.href = '/settings'
      },
      {
        id: 'add_first_task',
        title: 'Add your first task',
        description: 'Create a task using voice or text',
        completed: tasks && tasks.length > 0,
        action: () => window.location.href = '/tasks'
      },
      {
        id: 'complete_first_task',
        title: 'Complete your first task',
        description: 'Mark a task as done',
        completed: tasks && tasks.some(t => t.completed),
        action: () => window.location.href = '/dashboard'
      },
      {
        id: 'add_five_tasks',
        title: 'Add 5 tasks',
        description: 'Build your task list',
        completed: tasks && tasks.length >= 5,
        action: () => window.location.href = '/tasks'
      },
      {
        id: 'start_streak',
        title: 'Start your streak',
        description: 'Complete tasks on consecutive days',
        completed: user.stats && user.stats.currentStreak > 0,
        action: () => window.location.href = '/dashboard'
      },
      {
        id: 'connect_calendar',
        title: 'Connect your calendar',
        description: 'Sync with Google Calendar or Outlook',
        completed: user.calendarConnected === true,
        action: () => window.location.href = '/settings'
      },
      {
        id: 'customize_notifications',
        title: 'Customize notifications',
        description: 'Set your notification preferences',
        completed: user.notificationFrequency && user.notificationFrequency !== 'standard',
        action: () => window.location.href = '/settings'
      },
      {
        id: 'try_context_switching',
        title: 'Try context switching',
        description: 'Switch between your different roles',
        completed: user.roles && user.roles.length > 1 && localStorage.getItem('context_switched'),
        action: () => window.location.href = '/dashboard'
      }
    ]

    setChecklist(items)
  }, [user, tasks])

  const completedCount = checklist.filter(item => item.completed).length
  const totalCount = checklist.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  // Hide checklist if all items completed
  if (completedCount === totalCount && totalCount > 0) {
    return null
  }

  // Don't show if dismissed
  if (localStorage.getItem('checklist_dismissed')) {
    return null
  }

  const handleDismiss = () => {
    localStorage.setItem('checklist_dismissed', 'true')
    if (onClose) onClose()
  }

  return (
    <div className="bg-white border-2 border-indigo-200 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div
        className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">{completedCount}/{totalCount}</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Getting Started</h3>
                <p className="text-sm text-gray-600">Complete these steps to get the most out of Get It Done!</p>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-600 to-blue-600 h-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDismiss()
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </div>
        </div>
      </div>

      {/* Checklist items */}
      {isExpanded && (
        <div className="p-4 space-y-3">
          {checklist.map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                item.completed
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-gray-50 border border-gray-200 hover:border-indigo-300'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {item.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
              </div>

              <div className="flex-1">
                <h4 className={`font-semibold text-sm ${
                  item.completed ? 'text-green-900 line-through' : 'text-gray-900'
                }`}>
                  {item.title}
                </h4>
                <p className={`text-xs mt-0.5 ${
                  item.completed ? 'text-green-700' : 'text-gray-600'
                }`}>
                  {item.description}
                </p>
              </div>

              {!item.completed && (
                <Button
                  onClick={item.action}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  Do it
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Encouragement message */}
      {isExpanded && completedCount > 0 && completedCount < totalCount && (
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-3 text-center">
          <p className="text-white text-sm font-medium">
            {completedCount === 1 && "🎉 Great start! Keep going!"}
            {completedCount === 2 && "💪 You're making progress!"}
            {completedCount === 3 && "🌟 Halfway there!"}
            {completedCount >= 4 && completedCount < totalCount && "🚀 Almost done!"}
          </p>
        </div>
      )}
    </div>
  )
}

