import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Flame, Trophy, Target, Calendar, Settings, LogOut, Plus, 
  ThumbsUp, ThumbsDown, Share2, MessageCircle, Users, TrendingUp, Shield 
} from 'lucide-react'
import { getMotivationalMessage, recordMessageFeedback } from '../lib/motivationEngine'

export default function Dashboard({ user, onLogout }) {
  const navigate = useNavigate()
  const [currentMessage, setCurrentMessage] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [stats, setStats] = useState(user.stats || {
    tasksCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalPoints: 0
  })

  useEffect(() => {
    // Load a motivational message on dashboard load
    loadMotivationalMessage()
  }, [])

  const loadMotivationalMessage = () => {
    const message = getMotivationalMessage(user, 'dashboard_view')
    setCurrentMessage(message)
    setShowFeedback(true)
  }

  const handleFeedback = (isPositive) => {
    if (currentMessage) {
      recordMessageFeedback(user.id, currentMessage.id, isPositive)
      setShowFeedback(false)
      // Show next message after a delay
      setTimeout(loadMotivationalMessage, 3000)
    }
  }

  const getStreakColor = () => {
    if (stats.currentStreak >= 30) return 'text-purple-600'
    if (stats.currentStreak >= 7) return 'text-orange-600'
    return 'text-blue-600'
  }

  const getProgressPercentage = () => {
    const target = 100 // Target for thermometer
    return Math.min((stats.tasksCompleted / target) * 100, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-indigo-600">Get It Done!</h1>
            <Badge variant="outline" className="text-xs">
              {user.motivationStyle === 'positive' ? '😊 Positive' : 
               user.motivationStyle === 'cheeky' ? '😏 Cheeky' : 
               user.isAutistic ? '🧠 Autism-Friendly' : '🎯 Adaptive'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Hi, {user.name}!</span>
            {user.isAdmin && (
              <Button variant="outline" size="sm" onClick={() => navigate('/admin')} className="border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </Button>
            )}
            {user.userType === 'team' && (
              <Button variant="outline" size="sm" onClick={() => navigate('/team')}>
                <Users className="w-4 h-4 mr-2" />
                Team
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Motivational Message Card */}
            {currentMessage && (
              <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 shadow-xl">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl mb-2">
                        {user.motivationStyle === 'cheeky' ? '💬' : 
                         user.motivationStyle === 'positive' ? '✨' : 
                         user.isAutistic ? '📋' : '🎯'}
                      </CardTitle>
                      <CardDescription className="text-white/90 text-lg">
                        {currentMessage.text}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                      onClick={() => {/* Share functionality */}}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                {showFeedback && (
                  <CardContent>
                    <div className="flex items-center gap-4 bg-white/10 rounded-lg p-4">
                      <span className="text-sm">Did this help motivate you?</span>
                      <div className="flex gap-2 ml-auto">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                          onClick={() => handleFeedback(true)}
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          Yes
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                          onClick={() => handleFeedback(false)}
                        >
                          <ThumbsDown className="w-4 h-4 mr-1" />
                          No
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    className="h-24 flex flex-col gap-2 bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => navigate('/tasks')}
                  >
                    <Plus className="w-6 h-6" />
                    <span>Add Task</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col gap-2"
                    onClick={() => navigate('/tasks')}
                  >
                    <Calendar className="w-6 h-6" />
                    <span>View Tasks</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest accomplishments</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.tasksCompleted === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No tasks completed yet. Let's get started!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Sample task completed</span>
                      <span className="text-xs text-gray-500 ml-auto">Today</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Stats & Gamification */}
          <div className="space-y-6">
            {/* Streak Card */}
            <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className={`w-6 h-6 ${getStreakColor()}`} />
                  Current Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-5xl font-bold ${getStreakColor()} mb-2`}>
                    {stats.currentStreak}
                  </div>
                  <div className="text-sm text-gray-600">days in a row</div>
                  {stats.currentStreak > 0 && (
                    <div className="mt-4 text-xs text-gray-500">
                      Longest: {stats.longestStreak} days
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Progress Thermometer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Tasks Completed</span>
                      <span className="font-semibold">{stats.tasksCompleted}/100</span>
                    </div>
                    <Progress value={getProgressPercentage()} className="h-3" />
                  </div>
                  
                  {user.motivationStyle === 'cheeky' && (
                    <div className="text-xs text-indigo-600 italic">
                      {stats.tasksCompleted === 0 && "Zero tasks? Bold strategy. Let's change that."}
                      {stats.tasksCompleted > 0 && stats.tasksCompleted < 10 && "Look at you, actually doing things!"}
                      {stats.tasksCompleted >= 10 && stats.tasksCompleted < 50 && "You're on fire! Keep it up! 🔥"}
                      {stats.tasksCompleted >= 50 && "Procrastination Destroyer achievement unlocked!"}
                    </div>
                  )}
                  
                  {user.motivationStyle === 'positive' && (
                    <div className="text-xs text-indigo-600 italic">
                      {stats.tasksCompleted === 0 && "Every journey begins with a single step!"}
                      {stats.tasksCompleted > 0 && stats.tasksCompleted < 10 && "Great start! You're building momentum!"}
                      {stats.tasksCompleted >= 10 && stats.tasksCompleted < 50 && "Amazing progress! You're crushing it! ✨"}
                      {stats.tasksCompleted >= 50 && "Week Warrior achievement unlocked!"}
                    </div>
                  )}
                  
                  {user.isAutistic && (
                    <div className="text-xs text-gray-600">
                      {stats.tasksCompleted === 0 && "0 tasks completed. Add your first task to begin."}
                      {stats.tasksCompleted > 0 && `${stats.tasksCompleted} tasks completed. ${100 - stats.tasksCompleted} remaining to reach 100.`}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <AchievementBadge
                    earned={stats.currentStreak >= 7}
                    title={user.motivationStyle === 'cheeky' ? "7-Day Survivor" : user.isAutistic ? "7 days completed" : "Week Warrior"}
                    icon="🏆"
                  />
                  <AchievementBadge
                    earned={stats.tasksCompleted >= 10}
                    title={user.motivationStyle === 'cheeky' ? "Actually Doing Things" : user.isAutistic ? "10 tasks completed" : "Task Master"}
                    icon="⭐"
                  />
                  <AchievementBadge
                    earned={stats.currentStreak >= 30}
                    title={user.motivationStyle === 'cheeky' ? "Procrastination Destroyer" : user.isAutistic ? "30 days completed" : "30-Day Champion"}
                    icon="💎"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Donation CTA */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">Love Get It Done!?</CardTitle>
                <CardDescription>Support our mission</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-4">
                  Help us keep the app free for everyone.
                </p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <Button variant="outline" size="sm" className="text-xs">$2/mo</Button>
                  <Button variant="outline" size="sm" className="text-xs">$5/mo</Button>
                  <Button variant="outline" size="sm" className="text-xs">$10/mo</Button>
                </div>
                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                  Donate Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function AchievementBadge({ earned, title, icon }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
      earned ? 'bg-yellow-50 border-2 border-yellow-300' : 'bg-gray-50 border border-gray-200 opacity-50'
    }`}>
      <span className="text-2xl">{earned ? icon : '🔒'}</span>
      <div className="flex-1">
        <div className={`text-sm font-medium ${earned ? 'text-gray-900' : 'text-gray-500'}`}>
          {title}
        </div>
      </div>
      {earned && <Badge variant="success" className="text-xs">Earned</Badge>}
    </div>
  )
}

