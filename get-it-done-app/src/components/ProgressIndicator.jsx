import { useState, useEffect } from 'react'
import { Trophy, Target, Flame, Star, TrendingUp } from 'lucide-react'

export default function ProgressIndicator({ user, tasks }) {
  const [showNudge, setShowNudge] = useState(false)
  const [nudgeMessage, setNudgeMessage] = useState('')
  const [nudgeType, setNudgeType] = useState('') // 'streak', 'achievement', 'milestone'

  useEffect(() => {
    checkForNudges()
  }, [tasks, user])

  const checkForNudges = () => {
    if (!user || !tasks) return

    const completedToday = tasks.filter(t => {
      if (!t.completed || !t.completedAt) return false
      const today = new Date().toDateString()
      return new Date(t.completedAt).toDateString() === today
    }).length

    const currentStreak = user.stats?.currentStreak || 0
    const totalCompleted = user.stats?.tasksCompleted || 0

    // Check for streak milestones
    if (currentStreak === 6) {
      setNudgeMessage(`🔥 One more day to reach a 7-day streak!`)
      setNudgeType('streak')
      setShowNudge(true)
      return
    }

    if (currentStreak === 13) {
      setNudgeMessage(`⭐ Just one more day for a 2-week streak!`)
      setNudgeType('streak')
      setShowNudge(true)
      return
    }

    if (currentStreak === 29) {
      setNudgeMessage(`🏆 Tomorrow you'll hit 30 days! Amazing!`)
      setNudgeType('streak')
      setShowNudge(true)
      return
    }

    // Check for achievement milestones
    if (totalCompleted === 9) {
      setNudgeMessage(`🎯 One more task to unlock the "10 Tasks" achievement!`)
      setNudgeType('achievement')
      setShowNudge(true)
      return
    }

    if (totalCompleted === 24) {
      setNudgeMessage(`🌟 Just one more to reach 25 tasks completed!`)
      setNudgeType('achievement')
      setShowNudge(true)
      return
    }

    if (totalCompleted === 49) {
      setNudgeMessage(`🚀 One more task and you'll hit 50! Incredible!`)
      setNudgeType('achievement')
      setShowNudge(true)
      return
    }

    // Check for daily progress
    if (completedToday === 2) {
      setNudgeMessage(`💪 You're on a roll! Keep the momentum going!`)
      setNudgeType('milestone')
      setShowNudge(true)
      return
    }

    if (completedToday === 4) {
      setNudgeMessage(`🎉 Four tasks done today! You're crushing it!`)
      setNudgeType('milestone')
      setShowNudge(true)
      return
    }
  }

  const getIcon = () => {
    switch (nudgeType) {
      case 'streak':
        return <Flame className="w-5 h-5 text-orange-500" />
      case 'achievement':
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 'milestone':
        return <Star className="w-5 h-5 text-blue-500" />
      default:
        return <Target className="w-5 h-5 text-indigo-500" />
    }
  }

  const getBackgroundColor = () => {
    switch (nudgeType) {
      case 'streak':
        return 'from-orange-50 to-red-50 border-orange-200'
      case 'achievement':
        return 'from-yellow-50 to-amber-50 border-yellow-200'
      case 'milestone':
        return 'from-blue-50 to-indigo-50 border-blue-200'
      default:
        return 'from-indigo-50 to-purple-50 border-indigo-200'
    }
  }

  if (!showNudge || !nudgeMessage) return null

  return (
    <div className={`bg-gradient-to-r ${getBackgroundColor()} border-2 rounded-xl p-4 mb-4 animate-slideDown`}>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">{nudgeMessage}</p>
        </div>
        <button
          onClick={() => setShowNudge(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}

