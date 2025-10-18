import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft, Users, TrendingUp, Target, Award, UserPlus, Download,
  BarChart3, Clock, Calendar, Zap, AlertCircle, CheckCircle, Search,
  Filter, Trophy, Flame, Star, TrendingDown
} from 'lucide-react'

export default function EnhancedTeamDashboard({ user }) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [timeRange, setTimeRange] = useState('30days')

  // Mock team data (in production, fetch from API)
  const [teamStats] = useState({
    totalMembers: 12,
    activeMembers: 10,
    avgCompletionRate: 78,
    totalTasksCompleted: 456,
    teamStreak: 14,
    avgStreakLength: 8.5,
    topPerformer: 'A',
    improvementRate: 12
  })

  const [teamMembers] = useState([
    { id: 'A', completionRate: 92, tasksCompleted: 45, currentStreak: 12, status: 'active', weeklyTasks: 12, motivationStyle: 'cheeky', lastActive: '2 hours ago' },
    { id: 'B', completionRate: 85, tasksCompleted: 38, currentStreak: 8, status: 'active', weeklyTasks: 10, motivationStyle: 'positive', lastActive: '5 hours ago' },
    { id: 'C', completionRate: 78, tasksCompleted: 42, currentStreak: 14, status: 'active', weeklyTasks: 11, motivationStyle: 'positive', lastActive: '1 hour ago' },
    { id: 'D', completionRate: 72, tasksCompleted: 35, currentStreak: 5, status: 'active', weeklyTasks: 9, motivationStyle: 'cheeky', lastActive: '3 hours ago' },
    { id: 'E', completionRate: 68, tasksCompleted: 31, currentStreak: 3, status: 'active', weeklyTasks: 8, motivationStyle: 'autism', lastActive: '4 hours ago' },
    { id: 'F', completionRate: 65, tasksCompleted: 28, currentStreak: 7, status: 'active', weeklyTasks: 7, motivationStyle: 'positive', lastActive: '6 hours ago' },
    { id: 'G', completionRate: 58, tasksCompleted: 25, currentStreak: 2, status: 'active', weeklyTasks: 6, motivationStyle: 'cheeky', lastActive: '8 hours ago' },
    { id: 'H', completionRate: 54, tasksCompleted: 22, currentStreak: 1, status: 'active', weeklyTasks: 5, motivationStyle: 'positive', lastActive: '12 hours ago' },
    { id: 'I', completionRate: 48, tasksCompleted: 19, currentStreak: 0, status: 'active', weeklyTasks: 4, motivationStyle: 'cheeky', lastActive: '1 day ago' },
    { id: 'J', completionRate: 42, tasksCompleted: 16, currentStreak: 0, status: 'active', weeklyTasks: 3, motivationStyle: 'positive', lastActive: '2 days ago' },
    { id: 'K', completionRate: 35, tasksCompleted: 12, currentStreak: 0, status: 'inactive', weeklyTasks: 1, motivationStyle: 'positive', lastActive: '1 week ago' },
    { id: 'L', completionRate: 28, tasksCompleted: 8, currentStreak: 0, status: 'inactive', weeklyTasks: 0, motivationStyle: 'cheeky', lastActive: '2 weeks ago' }
  ])

  const [weeklyTrend] = useState([
    { week: 'Week 1', avgCompletion: 65, activeMember: 9 },
    { week: 'Week 2', avgCompletion: 70, activeMembers: 10 },
    { week: 'Week 3', avgCompletion: 75, activeMembers: 11 },
    { week: 'Week 4', avgCompletion: 78, activeMembers: 10 }
  ])

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || member.status === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold text-gray-900">Team Dashboard</h1>
          <Badge variant="outline" className="ml-auto">
            <Users className="w-3 h-3 mr-1" />
            {teamStats.totalMembers} Members
          </Badge>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 Days</SelectItem>
              <SelectItem value="30days">30 Days</SelectItem>
              <SelectItem value="90days">90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Team Members</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid md:grid-cols-4 gap-6">
                <MetricCard
                  icon={<Users className="w-6 h-6 text-blue-600" />}
                  label="Active Members"
                  value={`${teamStats.activeMembers}/${teamStats.totalMembers}`}
                  change="+2 this week"
                  trend="up"
                />
                <MetricCard
                  icon={<Target className="w-6 h-6 text-green-600" />}
                  label="Avg Completion"
                  value={`${teamStats.avgCompletionRate}%`}
                  change="+5% from last week"
                  trend="up"
                />
                <MetricCard
                  icon={<Award className="w-6 h-6 text-yellow-600" />}
                  label="Tasks Completed"
                  value={teamStats.totalTasksCompleted}
                  change="+89 this week"
                  trend="up"
                />
                <MetricCard
                  icon={<Flame className="w-6 h-6 text-orange-600" />}
                  label="Team Streak"
                  value={`${teamStats.teamStreak} days`}
                  change="Keep it going!"
                  trend="up"
                />
              </div>

              {/* Team Performance Overview */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Performance Trend</CardTitle>
                    <CardDescription>Average completion rate over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {weeklyTrend.map((week) => (
                        <div key={week.week}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">{week.week}</span>
                            <span className="font-medium">{week.avgCompletion}%</span>
                          </div>
                          <Progress value={week.avgCompletion} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Distribution</CardTitle>
                    <CardDescription>Team member completion rates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <PerformanceBand label="Excellent (80-100%)" count={2} color="bg-green-500" percentage={17} />
                      <PerformanceBand label="Good (60-79%)" count={4} color="bg-blue-500" percentage={33} />
                      <PerformanceBand label="Fair (40-59%)" count={4} color="bg-yellow-500" percentage={33} />
                      <PerformanceBand label="Needs Support (0-39%)" count={2} color="bg-red-500" percentage={17} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performers This Week</CardTitle>
                  <CardDescription>Highest task completion</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {filteredMembers
                      .sort((a, b) => b.weeklyTasks - a.weeklyTasks)
                      .slice(0, 3)
                      .map((member, index) => (
                        <TopPerformerCard key={member.id} member={member} rank={index + 1} />
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Team Members Tab */}
          <TabsContent value="members">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>Anonymized individual performance tracking</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Member
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by member ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Members Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredMembers.map((member) => (
                    <TeamMemberCard key={member.id} member={member} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <div className="space-y-6">
              {/* Leaderboard */}
              <Card>
                <CardHeader>
                  <CardTitle>Leaderboard</CardTitle>
                  <CardDescription>Ranked by completion rate</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredMembers
                      .sort((a, b) => b.completionRate - a.completionRate)
                      .map((member, index) => (
                        <LeaderboardItem key={member.id} member={member} rank={index + 1} />
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Streak Leaders */}
              <Card>
                <CardHeader>
                  <CardTitle>Streak Leaders</CardTitle>
                  <CardDescription>Longest current streaks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {filteredMembers
                      .sort((a, b) => b.currentStreak - a.currentStreak)
                      .slice(0, 3)
                      .map((member) => (
                        <StreakCard key={member.id} member={member} />
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
            <div className="space-y-6">
              {/* Engagement Insights */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Engagement Insights</CardTitle>
                    <CardDescription>Team activity patterns</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <InsightItem
                        icon={<Calendar className="w-5 h-5 text-blue-600" />}
                        label="Most Active Day"
                        value="Tuesday"
                        description="Highest task completion"
                      />
                      <InsightItem
                        icon={<Clock className="w-5 h-5 text-green-600" />}
                        label="Peak Hours"
                        value="9 AM - 11 AM"
                        description="Most tasks completed"
                      />
                      <InsightItem
                        icon={<Zap className="w-5 h-5 text-yellow-600" />}
                        label="Avg Response Time"
                        value="18 minutes"
                        description="To motivational messages"
                      />
                      <InsightItem
                        icon={<Target className="w-5 h-5 text-purple-600" />}
                        label="Team Avg Streak"
                        value={`${teamStats.avgStreakLength} days`}
                        description="Average streak length"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Motivation Preferences</CardTitle>
                    <CardDescription>Team motivation style distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <PreferenceBar label="Positive & Encouraging" count={6} total={12} color="bg-green-500" />
                      <PreferenceBar label="Cheeky & Witty" count={5} total={12} color="bg-blue-500" />
                      <PreferenceBar label="Autism-Friendly" count={1} total={12} color="bg-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Improvement Opportunities */}
              <Card>
                <CardHeader>
                  <CardTitle>Improvement Opportunities</CardTitle>
                  <CardDescription>Members who may need support</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredMembers
                      .filter(m => m.completionRate < 60 || m.currentStreak === 0)
                      .map((member) => (
                        <ImprovementCard key={member.id} member={member} />
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Team Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>Actions to improve team performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <RecommendationItem
                      icon={<AlertCircle className="w-5 h-5 text-yellow-600" />}
                      title="Check in with low performers"
                      description="2 members have completion rates below 40%"
                    />
                    <RecommendationItem
                      icon={<TrendingUp className="w-5 h-5 text-green-600" />}
                      title="Celebrate team wins"
                      description="Team streak is at 14 days - acknowledge the achievement!"
                    />
                    <RecommendationItem
                      icon={<Users className="w-5 h-5 text-blue-600" />}
                      title="Re-engage inactive members"
                      description="2 members haven't been active in over a week"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Helper Components
function MetricCard({ icon, label, value, change, trend }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          {icon}
          <span className={`text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </span>
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
        <div className="text-sm text-gray-600">{label}</div>
      </CardContent>
    </Card>
  )
}

function TeamMemberCard({ member }) {
  const getStatusColor = () => {
    if (member.completionRate >= 80) return 'text-green-600'
    if (member.completionRate >= 60) return 'text-blue-600'
    if (member.completionRate >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStreakIcon = () => {
    if (member.currentStreak >= 7) return <Flame className="w-4 h-4 text-orange-500" />
    return <Flame className="w-4 h-4 text-gray-400" />
  }

  return (
    <div className="flex items-start gap-4 p-4 border-2 rounded-lg hover:border-indigo-300 transition-all">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">
          <span className="font-semibold text-gray-900">Team Member {member.id}</span>
          <Badge variant={member.status === 'active' ? 'success' : 'secondary'} className="text-xs">
            {member.status}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {member.motivationStyle}
          </Badge>
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Completion Rate</span>
              <span className={`font-semibold ${getStatusColor()}`}>{member.completionRate}%</span>
            </div>
            <Progress value={member.completionRate} className="h-2" />
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span className="text-gray-600">{member.tasksCompleted} tasks</span>
            </div>
            <div className="flex items-center gap-1">
              {getStreakIcon()}
              <span className="text-gray-600">{member.currentStreak} day streak</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-500" />
              <span className="text-gray-600">{member.lastActive}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TopPerformerCard({ member, rank }) {
  const medals = ['🥇', '🥈', '🥉']
  return (
    <Card className="border-2 border-yellow-200 bg-yellow-50">
      <CardContent className="pt-6">
        <div className="text-center">
          <div className="text-4xl mb-2">{medals[rank - 1]}</div>
          <div className="text-xl font-bold text-gray-900 mb-1">Member {member.id}</div>
          <div className="text-sm text-gray-600 mb-2">{member.weeklyTasks} tasks this week</div>
          <Badge variant="success">{member.completionRate}% completion</Badge>
        </div>
      </CardContent>
    </Card>
  )
}

function LeaderboardItem({ member, rank }) {
  const getRankColor = () => {
    if (rank === 1) return 'bg-yellow-400 text-yellow-900'
    if (rank === 2) return 'bg-gray-300 text-gray-900'
    if (rank === 3) return 'bg-orange-400 text-orange-900'
    return 'bg-gray-200 text-gray-700'
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${getRankColor()}`}>
        {rank}
      </div>
      <div className="flex-1">
        <div className="font-semibold">Team Member {member.id}</div>
        <div className="text-sm text-gray-600">{member.tasksCompleted} tasks completed</div>
      </div>
      <div className="text-right">
        <Badge variant={member.completionRate >= 80 ? "success" : "secondary"}>
          {member.completionRate}%
        </Badge>
        <div className="text-xs text-gray-500 mt-1">{member.currentStreak} day streak</div>
      </div>
    </div>
  )
}

function StreakCard({ member }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center">
          <Flame className="w-12 h-12 text-orange-500 mx-auto mb-2" />
          <div className="text-3xl font-bold text-gray-900 mb-1">{member.currentStreak}</div>
          <div className="text-sm text-gray-600 mb-2">days</div>
          <div className="font-medium">Member {member.id}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function PerformanceBand({ label, count, color, percentage }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded ${color}`}></div>
          <span className="text-sm font-medium text-gray-900">{label}</span>
        </div>
        <Badge variant="outline">{count} members</Badge>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  )
}

function PreferenceBar({ label, count, total, color }) {
  const percentage = (count / total) * 100
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{count}/{total}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  )
}

function InsightItem({ icon, label, value, description }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
      {icon}
      <div className="flex-1">
        <div className="text-sm text-gray-600">{label}</div>
        <div className="text-lg font-semibold text-gray-900">{value}</div>
        <div className="text-xs text-gray-500">{description}</div>
      </div>
    </div>
  )
}

function ImprovementCard({ member }) {
  const issues = []
  if (member.completionRate < 60) issues.push('Low completion rate')
  if (member.currentStreak === 0) issues.push('No active streak')
  if (member.status === 'inactive') issues.push('Inactive')

  return (
    <div className="flex items-center gap-4 p-4 border-2 border-yellow-200 bg-yellow-50 rounded-lg">
      <AlertCircle className="w-6 h-6 text-yellow-600" />
      <div className="flex-1">
        <div className="font-medium text-gray-900">Team Member {member.id}</div>
        <div className="text-sm text-gray-600">{issues.join(' • ')}</div>
      </div>
      <Button variant="outline" size="sm">
        View Details
      </Button>
    </div>
  )
}

function RecommendationItem({ icon, title, description }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
      {icon}
      <div className="flex-1">
        <div className="font-medium text-gray-900">{title}</div>
        <div className="text-sm text-gray-600">{description}</div>
      </div>
    </div>
  )
}

