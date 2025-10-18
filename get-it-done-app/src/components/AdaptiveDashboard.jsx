import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  ThumbsUp, ThumbsDown, Plus, CheckCircle, Calendar, Settings, 
  TrendingUp, Award, Flame, Heart, Baby, Briefcase, GraduationCap,
  Users, Menu, Share2, DollarSign
} from 'lucide-react'
import { getMotivationalMessage, getAchievementName } from '../lib/messageLibrary'
import EmptyState from './EmptyState'
import ProductTour from './ProductTour'

export default function AdaptiveDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [currentMessage, setCurrentMessage] = useState('')
  const [tasks, setTasks] = useState([])
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [showTour, setShowTour] = useState(false)
  const [showEmptyState, setShowEmptyState] = useState(false)

  useEffect(() => {
    // Load user data
    const userData = JSON.parse(localStorage.getItem('gitUser') || '{}')
    setUser(userData)

    // Load tasks
    const userTasks = JSON.parse(localStorage.getItem('gitTasks') || '[]')
    setTasks(userTasks)

    // Show empty state if no tasks and first time user
    if (userTasks.length === 0 && userData.coreOnboardingComplete && !localStorage.getItem('tourCompleted')) {
      setShowEmptyState(true)
    }

    // Show product tour after empty state or if returning user with no tour
    if (userTasks.length > 0 && !localStorage.getItem('tourCompleted')) {
      setShowTour(true)
    }

    // Generate motivational message
    if (userData.id) {
      const message = getMotivationalMessage(userData, {
        timeOfDay: new Date().getHours() < 12 ? 'morning' : 'afternoon'
      })
      setCurrentMessage(message)
    }
  }, [])

  const handleMessageFeedback = (isPositive) => {
    // Track message feedback
    const feedback = {
      message: currentMessage,
      isPositive,
      timestamp: new Date().toISOString()
    }
    
    const feedbackHistory = JSON.parse(localStorage.getItem('messageFeedback') || '[]')
    feedbackHistory.push(feedback)
    localStorage.setItem('messageFeedback', JSON.stringify(feedbackHistory))

    // Generate new message
    const newMessage = getMotivationalMessage(user, {})
    setCurrentMessage(newMessage)
  }

  const switchContext = (newContext) => {
    const updatedUser = { ...user, currentContext: newContext }
    setUser(updatedUser)
    localStorage.setItem('gitUser', JSON.stringify(updatedUser))
    setShowContextMenu(false)

    // Generate context-appropriate message
    const message = getMotivationalMessage(updatedUser, {})
    setCurrentMessage(message)
  }

  const getContextIcon = (context) => {
    const icons = {
      student: <GraduationCap className="w-5 h-5" />,
      professional: <Briefcase className="w-5 h-5" />,
      parent: <Baby className="w-5 h-5" />,
      team_manager: <Users className="w-5 h-5" />
    }
    return icons[context] || <Briefcase className="w-5 h-5" />
  }

  const getContextColor = (context) => {
    const colors = {
      student: 'bg-teal-100 text-teal-700 border-teal-300',
      professional: 'bg-orange-100 text-orange-700 border-orange-300',
      parent: 'bg-green-100 text-green-700 border-green-300',
      team_manager: 'bg-[#3B4A6B]/10 text-[#3B4A6B] border-[#3B4A6B]/30'
    }
    return colors[context] || 'bg-gray-100 text-gray-700 border-gray-300'
  }

  const getTodayTasks = () => {
    const today = new Date().toDateString()
    return tasks.filter(task => {
      if (!task.scheduledTime) return false
      return new Date(task.scheduledTime).toDateString() === today
    })
  }

  const getCompletionRate = () => {
    if (tasks.length === 0) return 0
    const completed = tasks.filter(t => t.completed).length
    return Math.round((completed / tasks.length) * 100)
  }

  const getWeeklyStats = () => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    const weekTasks = tasks.filter(t => new Date(t.createdAt) > weekAgo)
    const completed = weekTasks.filter(t => t.completed).length
    
    return { total: weekTasks.length, completed }
  }

  const getSelfCareCount = () => {
    const selfCareTasks = tasks.filter(t => t.category === 'Self-care' && t.completed)
    return selfCareTasks.length
  }

  const shouldShowSelfCareNudge = () => {
    if (!user?.roles?.includes('parent')) return false
    
    const todayTasks = getTodayTasks()
    const completedToday = todayTasks.filter(t => t.completed).length
    const selfCareToday = todayTasks.filter(t => t.category === 'Self-care' && t.completed).length
    
    return completedToday >= 5 && selfCareToday === 0
  }

  const handleTourComplete = () => {
    localStorage.setItem('tourCompleted', 'true')
    setShowTour(false)
  }

  const handleSampleTaskComplete = (taskId) => {
    // Add sample task completion logic
    console.log('Sample task completed:', taskId)
  }

  const handleAddFirstTask = () => {
    setShowEmptyState(false)
    localStorage.setItem('tourCompleted', 'true')
    navigate('/tasks')
  }

  if (!user || !user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  // Show empty state for new users with no tasks
  if (showEmptyState && tasks.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50/30 to-slate-50">
        <EmptyState 
          userRole={user.primaryRole || 'professional'}
          onTaskComplete={handleSampleTaskComplete}
          onAddTask={handleAddFirstTask}
        />
      </div>
    )
  }

  const todayTasks = getTodayTasks()
  const weeklyStats = getWeeklyStats()
  const completionRate = getCompletionRate()

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50/30 to-slate-50">
      {/* Header with Context Switcher */}
      <div className="bg-[#3B4A6B] border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white">Get It Done!</h1>
              
              {/* Context Switcher */}
              {user.roles && user.roles.length > 1 && (
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowContextMenu(!showContextMenu)}
                    className={`flex items-center gap-2 ${getContextColor(user.currentContext)}`}
                  >
                    {getContextIcon(user.currentContext)}
                    <span className="capitalize">{user.currentContext?.replace('_', ' ')}</span>
                    <Menu className="w-4 h-4" />
                  </Button>

                  {showContextMenu && (
                    <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg p-2 min-w-[200px] z-10">
                      <p className="text-xs font-semibold text-gray-500 px-2 py-1">Switch Context</p>
                      {user.roles.map(role => (
                        <button
                          key={role}
                          onClick={() => switchContext(role)}
                          className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 flex items-center gap-2 ${
                            user.currentContext === role ? 'bg-indigo-50' : ''
                          }`}
                        >
                          {getContextIcon(role)}
                          <span className="capitalize">{role.replace('_', ' ')}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {user.isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin')}
                  className="border-white text-white hover:bg-white/10"
                >
                  Admin
                </Button>
              )}
              {user.userType === 'team' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/team')}
                className="border-white text-white hover:bg-white/10"
              >
                  <Users className="w-4 h-4 mr-2" />
                  Team
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/settings')}
                className="border-white text-white hover:bg-white/10"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Motivational Message Card */}
            <Card className="border-2 border-[#3B4A6B] bg-gradient-to-br from-indigo-50/30 to-slate-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="w-6 h-6 text-orange-500" />
                  Your Motivation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium text-gray-900 mb-4">
                  {currentMessage}
                </p>
                
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Was this helpful?</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMessageFeedback(true)}
                    className="flex items-center gap-1"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Yes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMessageFeedback(false)}
                    className="flex items-center gap-1"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    No
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Share functionality
                      if (navigator.share) {
                        navigator.share({
                          text: `My productivity app just told me: "${currentMessage}" 😂 #GetItDone`,
                        })
                      }
                    }}
                    className="ml-auto"
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Self-Care Nudge (for parents) */}
            {shouldShowSelfCareNudge() && (
              <Card className="border-2 border-pink-200 bg-pink-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Heart className="w-6 h-6 text-pink-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">Time for self-care!</h3>
                      <p className="text-sm text-gray-700 mb-3">
                        You've completed {getTodayTasks().filter(t => t.completed).length} tasks for others. 
                        How about one for yourself?
                      </p>
                      <Button
                        size="sm"
                        onClick={() => navigate('/tasks/new?category=Self-care')}
                        className="bg-pink-600 hover:bg-pink-700"
                      >
                        Add Self-Care Task
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>This Week</CardDescription>
                  <CardTitle className="text-3xl">{weeklyStats.completed}/{weeklyStats.total}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Tasks completed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Completion Rate</CardDescription>
                  <CardTitle className="text-3xl">{completionRate}%</CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={completionRate} className="h-2" />
                </CardContent>
              </Card>
            </div>

            {/* Today's Tasks */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Today's Tasks</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => navigate('/tasks/new')}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Task
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {todayTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No tasks scheduled for today</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/tasks/new')}
                      className="mt-3"
                    >
                      Add your first task
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayTasks.map(task => (
                      <div
                        key={task.id}
                        className={`p-4 border rounded-lg ${
                          task.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <CheckCircle 
                            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                              task.completed ? 'text-green-600' : 'text-gray-300'
                            }`}
                          />
                          <div className="flex-1">
                            <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {task.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {task.category}
                              </Badge>
                              {task.scheduledTime && (
                                <span className="text-xs text-gray-500">
                                  {new Date(task.scheduledTime).toLocaleTimeString('en-US', { 
                                    hour: 'numeric', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Donation CTA */}
            <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <DollarSign className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Love Get It Done!?</h3>
                    <p className="text-sm text-gray-700 mb-3">
                      Support us with a donation! Pay what you want, when you want.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">$2</Button>
                      <Button size="sm" variant="outline">$5</Button>
                      <Button size="sm" variant="outline">$10</Button>
                      <Button size="sm" variant="outline">Custom</Button>
                    </div>
                    <div className="mt-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded" />
                        <span>Happy to contribute monthly?</span>
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            
            {/* Current Streak */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  Current Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center relative">
                  <div className="relative inline-block">
                    <div className="text-6xl font-bold text-orange-500 mb-2">
                      {user.stats?.currentStreak || 0}
                    </div>
                    {/* Milestone celebrations */}
                    {(user.stats?.currentStreak || 0) >= 7 && (
                      <div className="absolute -top-2 -right-2 text-4xl animate-bounce">🔥</div>
                    )}
                    {(user.stats?.currentStreak || 0) >= 30 && (
                      <div className="absolute -top-2 -left-2 text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>⭐</div>
                    )}
                    {(user.stats?.currentStreak || 0) >= 100 && (
                      <div className="absolute -bottom-2 -right-2 text-4xl animate-bounce" style={{ animationDelay: '0.4s' }}>🏆</div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {user.motivationStyle === 'cheeky' 
                      ? "days of actually doing things" 
                      : user.motivationStyle === 'autism'
                      ? "days completed"
                      : "days in a row"}
                  </p>
                  {/* Milestone messages */}
                  {(user.stats?.currentStreak || 0) >= 7 && (user.stats?.currentStreak || 0) < 30 && (
                    <p className="text-xs text-orange-600 font-semibold mt-2">🎉 One week streak!</p>
                  )}
                  {(user.stats?.currentStreak || 0) >= 30 && (user.stats?.currentStreak || 0) < 100 && (
                    <p className="text-xs text-orange-600 font-semibold mt-2">🎆 One month streak! Amazing!</p>
                  )}
                  {(user.stats?.currentStreak || 0) >= 100 && (
                    <p className="text-xs text-orange-600 font-semibold mt-2">👑 100 day legend!</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Progress Thermometer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#3B4A6B]" />
                  Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tasks Completed</span>
                    <span className="font-semibold">{user.stats?.tasksCompleted || 0}/100</span>
                  </div>
                  <Progress value={(user.stats?.tasksCompleted || 0) % 100} className="h-3" />
                  <p className="text-xs text-gray-500">
                    {100 - ((user.stats?.tasksCompleted || 0) % 100)} more to next milestone!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {user.stats?.currentStreak >= 7 && (
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg transition-all hover:scale-105">
                      <div className="text-2xl animate-bounce">🏅</div>
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-gray-900 block">
                          {getAchievementName('week_streak', user.motivationStyle)}
                        </span>
                        <span className="text-xs text-gray-600">7 day streak</span>
                      </div>
                    </div>
                  )}
                  
                  {user.stats?.tasksCompleted >= 10 && (
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-lg transition-all hover:scale-105">
                      <div className="text-2xl animate-bounce" style={{ animationDelay: '0.1s' }}>✅</div>
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-gray-900 block">
                          {user.motivationStyle === 'cheeky' 
                            ? "Task Terminator" 
                            : user.motivationStyle === 'autism'
                            ? "10 tasks completed"
                            : "Getting Started"}
                        </span>
                        <span className="text-xs text-gray-600">10 tasks done</span>
                      </div>
                    </div>
                  )}

                  {user.roles?.includes('parent') && getSelfCareCount() >= 3 && (
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg transition-all hover:scale-105">
                      <div className="text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>💖</div>
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-gray-900 block">Self-Care Champion</span>
                        <span className="text-xs text-gray-600">3 self-care tasks</span>
                      </div>
                    </div>
                  )}

                  {(!user.stats?.currentStreak || user.stats.currentStreak < 7) && 
                   (!user.stats?.tasksCompleted || user.stats.tasksCompleted < 10) && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Complete tasks to earn achievements!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Calendar Connection Status */}
            {!user.calendarConnected && user.calendarApp !== 'none' && (
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-900 mb-1">Connect Your Calendar</h3>
                    <p className="text-sm text-gray-700 mb-3">
                      Sync tasks with {user.calendarApp === 'google' ? 'Google Calendar' : 
                                      user.calendarApp === 'outlook' ? 'Outlook' : 
                                      'Apple Calendar'}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => navigate('/settings?tab=calendar')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Connect Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
      
      {/* Product Tour Overlay */}
      {showTour && <ProductTour onComplete={handleTourComplete} />}
    </>
  )
}

