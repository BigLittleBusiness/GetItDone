import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Flame, Trophy, Target, Calendar, Settings, LogOut, Plus, 
  ThumbsUp, ThumbsDown, Share2, Users, TrendingUp, Shield,
  CheckCircle, Clock, BarChart3, Award, Zap, Star, TrendingDown
} from 'lucide-react'
import { getMotivationalMessage, recordMessageFeedback } from '../lib/motivationEngine'

export default function EnhancedDashboard({ user, onLogout }) {
  const navigate = useNavigate()
  const [currentMessage, setCurrentMessage] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [stats, setStats] = useState(user.stats || {
    tasksCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalPoints: 0,
    weeklyTasks: 0,
    monthlyTasks: 0,
    completionRate: 0,
    avgTasksPerDay: 0
  })

  // Mock data for analytics (in production, fetch from API)
  const [weeklyData] = useState([
    { day: 'Mon', tasks: 5, completed: 4 },
    { day: 'Tue', tasks: 6, completed: 5 },
    { day: 'Wed', tasks: 4, completed: 4 },
    { day: 'Thu', tasks: 7, completed: 6 },
    { day: 'Fri', tasks: 5, completed: 3 },
    { day: 'Sat', tasks: 3, completed: 3 },
    { day: 'Sun', tasks: 2, completed: 2 }
  ])

  const [recentTasks] = useState([
    { id: 1, name: 'Call 5 prospects', category: 'Work', completed: true, time: '9:00 AM' },
    { id: 2, name: 'Gym workout', category: 'Health', completed: true, time: '6:00 AM' },
    { id: 3, name: 'Team meeting', category: 'Work', completed: true, time: '2:00 PM' },
    { id: 4, name: 'Review contracts', category: 'Work', completed: false, time: '4:00 PM' },
    { id: 5, name: 'Dinner with family', category: 'Personal', completed: false, time: '7:00 PM' }
  ])

  useEffect(() => {
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
      setTimeout(loadMotivationalMessage, 3000)
    }
  }

  const getStreakColor = () => {
    if (stats.currentStreak >= 30) return 'text-purple-600'
    if (stats.currentStreak >= 7) return 'text-orange-600'
    return 'text-blue-600'
  }

  const getProgressPercentage = () => {
    const target = 100
    return Math.min((stats.tasksCompleted / target) * 100, 100)
  }

  const getStreakMessage = () => {
    const style = user.motivationStyle
    const streak = stats.currentStreak
    
    if (style === 'cheeky') {
      if (streak >= 30) return "30 days?! You're basically unstoppable now."
      if (streak >= 7) return "One week down. Not bad, not bad."
      return `${streak} days. Keep it going!`
    } else if (style === 'positive') {
      if (streak >= 30) return "Amazing! 30 days of consistency! 🎉"
      if (streak >= 7) return "One week strong! You're building momentum!"
      return `${streak} days of progress! Keep going!`
    } else {
      return `You have completed tasks for ${streak} consecutive days.`
    }
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
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
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

                {/* Quick Stats */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">This Week</p>
                          <p className="text-3xl font-bold text-gray-900">{stats.weeklyTasks}</p>
                          <p className="text-xs text-green-600 mt-1">+3 from last week</p>
                        </div>
                        <CheckCircle className="w-10 h-10 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Completion Rate</p>
                          <p className="text-3xl font-bold text-gray-900">{stats.completionRate}%</p>
                          <p className="text-xs text-blue-600 mt-1">Last 30 days</p>
                        </div>
                        <Target className="w-10 h-10 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Button className="bg-indigo-600 hover:bg-indigo-700 h-20" onClick={() => navigate('/tasks')}>
                        <Plus className="w-5 h-5 mr-2" />
                        Add Task
                      </Button>
                      <Button variant="outline" className="h-20" onClick={() => navigate('/tasks')}>
                        <Calendar className="w-5 h-5 mr-2" />
                        View All Tasks
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Today's Tasks */}
                <Card>
                  <CardHeader>
                    <CardTitle>Today's Tasks</CardTitle>
                    <CardDescription>Your schedule for today</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentTasks.slice(0, 3).map((task) => (
                        <TaskItem key={task.id} task={task} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Streak Card */}
                <Card className="border-2 border-orange-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Current Streak</CardTitle>
                      <Flame className={`w-6 h-6 ${getStreakColor()}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className={`text-5xl font-bold ${getStreakColor()} mb-2`}>
                        {stats.currentStreak}
                      </div>
                      <div className="text-sm text-gray-600 mb-4">
                        {getStreakMessage()}
                      </div>
                      <div className="text-xs text-gray-500">
                        Longest: {stats.longestStreak} days
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Progress Thermometer */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Progress</CardTitle>
                    <CardDescription>Tasks completed toward 100</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-indigo-600 mb-2">
                          {stats.tasksCompleted}/100
                        </div>
                        <Progress value={getProgressPercentage()} className="h-3" />
                      </div>
                      <div className="text-sm text-gray-600 text-center">
                        {user.motivationStyle === 'cheeky' 
                          ? `${100 - stats.tasksCompleted} to go. You've got this... probably.`
                          : user.motivationStyle === 'positive'
                          ? `${100 - stats.tasksCompleted} more to reach your goal! 🎯`
                          : `${100 - stats.tasksCompleted} tasks remaining to reach 100.`}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Achievements Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Achievements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <AchievementBadge
                        icon={<Trophy className="w-5 h-5 text-yellow-600" />}
                        title={user.motivationStyle === 'cheeky' ? "7-Day Survivor" : "Week Warrior"}
                        description="7-day streak"
                      />
                      <AchievementBadge
                        icon={<Star className="w-5 h-5 text-blue-600" />}
                        title={user.motivationStyle === 'cheeky' ? "Actually Doing Things" : "Task Master"}
                        description="10 tasks completed"
                      />
                    </div>
                    <Button variant="link" className="w-full mt-4" onClick={() => navigate('/achievements')}>
                      View All Achievements
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsView stats={stats} weeklyData={weeklyData} user={user} />
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <TasksView tasks={recentTasks} />
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <AchievementsView user={user} stats={stats} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Analytics View Component
function AnalyticsView({ stats, weeklyData, user }) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <MetricCard
          icon={<CheckCircle className="w-6 h-6 text-green-600" />}
          label="Total Completed"
          value={stats.tasksCompleted}
          change="+12% this month"
        />
        <MetricCard
          icon={<Flame className="w-6 h-6 text-orange-600" />}
          label="Current Streak"
          value={`${stats.currentStreak} days`}
          change={`Best: ${stats.longestStreak}`}
        />
        <MetricCard
          icon={<Target className="w-6 h-6 text-blue-600" />}
          label="Completion Rate"
          value={`${stats.completionRate}%`}
          change="Last 30 days"
        />
        <MetricCard
          icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
          label="Avg Per Day"
          value={stats.avgTasksPerDay.toFixed(1)}
          change="This week"
        />
      </div>

      {/* Weekly Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Performance</CardTitle>
          <CardDescription>Tasks completed this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weeklyData.map((day) => (
              <div key={day.day} className="flex items-center gap-4">
                <div className="w-12 text-sm font-medium text-gray-600">{day.day}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Progress value={(day.completed / day.tasks) * 100} className="h-2" />
                    <span className="text-xs text-gray-600">{day.completed}/{day.tasks}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <CategoryBar label="Work" count={45} total={stats.tasksCompleted} color="bg-blue-500" />
              <CategoryBar label="Personal" count={28} total={stats.tasksCompleted} color="bg-green-500" />
              <CategoryBar label="Health" count={15} total={stats.tasksCompleted} color="bg-orange-500" />
              <CategoryBar label="General" count={12} total={stats.tasksCompleted} color="bg-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productivity Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <InsightItem
                icon={<Clock className="w-5 h-5 text-blue-600" />}
                label="Most Productive Time"
                value="9 AM - 11 AM"
              />
              <InsightItem
                icon={<Calendar className="w-5 h-5 text-green-600" />}
                label="Best Day"
                value="Tuesday"
              />
              <InsightItem
                icon={<Zap className="w-5 h-5 text-yellow-600" />}
                label="Avg Response Time"
                value="12 minutes"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Tasks View Component
function TasksView({ tasks }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>All Tasks</CardTitle>
              <CardDescription>Your complete task list</CardDescription>
            </div>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} detailed />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Achievements View Component
function AchievementsView({ user, stats }) {
  const achievements = [
    { id: 1, title: user.motivationStyle === 'cheeky' ? "7-Day Survivor" : "Week Warrior", description: "Complete tasks for 7 consecutive days", earned: stats.currentStreak >= 7, icon: <Trophy className="w-8 h-8" /> },
    { id: 2, title: user.motivationStyle === 'cheeky' ? "Actually Doing Things" : "Task Master", description: "Complete 10 tasks", earned: stats.tasksCompleted >= 10, icon: <Star className="w-8 h-8" /> },
    { id: 3, title: user.motivationStyle === 'cheeky' ? "Procrastination Destroyer" : "30-Day Champion", description: "Complete tasks for 30 consecutive days", earned: stats.currentStreak >= 30, icon: <Award className="w-8 h-8" /> },
    { id: 4, title: "Century Club", description: "Complete 100 tasks", earned: stats.tasksCompleted >= 100, icon: <Target className="w-8 h-8" /> }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Achievements</CardTitle>
          <CardDescription>Unlock badges as you reach milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper Components
function TaskItem({ task, detailed = false }) {
  return (
    <div className={`flex items-center gap-4 p-4 border-2 rounded-lg ${task.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${task.completed ? 'bg-green-500' : 'bg-gray-300'}`}>
        {task.completed && <CheckCircle className="w-4 h-4 text-white" />}
      </div>
      <div className="flex-1">
        <div className={`font-medium ${task.completed ? 'line-through text-gray-600' : 'text-gray-900'}`}>
          {task.name}
        </div>
        {detailed && (
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">{task.category}</Badge>
            <span className="text-xs text-gray-500">{task.time}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function AchievementBadge({ icon, title, description }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="font-medium text-sm">{title}</div>
        <div className="text-xs text-gray-600">{description}</div>
      </div>
    </div>
  )
}

function AchievementCard({ achievement }) {
  return (
    <Card className={achievement.earned ? 'border-2 border-yellow-400 bg-yellow-50' : 'opacity-50'}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${achievement.earned ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-200 text-gray-400'}`}>
            {achievement.icon}
          </div>
          <div>
            <div className="font-bold text-lg">{achievement.title}</div>
            <div className="text-sm text-gray-600">{achievement.description}</div>
            {achievement.earned && (
              <Badge variant="success" className="mt-2">Unlocked!</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MetricCard({ icon, label, value, change }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          {icon}
          <span className="text-xs text-green-600">{change}</span>
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
        <div className="text-sm text-gray-600">{label}</div>
      </CardContent>
    </Card>
  )
}

function CategoryBar({ label, count, total, color }) {
  const percentage = (count / total) * 100
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{count}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  )
}

function InsightItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
      {icon}
      <div className="flex-1">
        <div className="text-sm text-gray-600">{label}</div>
        <div className="font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  )
}

