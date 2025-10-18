import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Users, TrendingUp, Target, Award, UserPlus } from 'lucide-react'

export default function TeamDashboard({ user }) {
  const navigate = useNavigate()
  
  // Mock team data (in real app, this would come from API)
  const [teamStats] = useState({
    totalMembers: 12,
    activeMembers: 10,
    avgCompletionRate: 78,
    totalTasksCompleted: 456,
    teamStreak: 14
  })

  const [teamMembers] = useState([
    { id: 'A', completionRate: 92, tasksCompleted: 45, currentStreak: 12, status: 'active' },
    { id: 'B', completionRate: 85, tasksCompleted: 38, currentStreak: 8, status: 'active' },
    { id: 'C', completionRate: 78, tasksCompleted: 42, currentStreak: 14, status: 'active' },
    { id: 'D', completionRate: 72, tasksCompleted: 35, currentStreak: 5, status: 'active' },
    { id: 'E', completionRate: 68, tasksCompleted: 31, currentStreak: 3, status: 'active' },
    { id: 'F', completionRate: 65, tasksCompleted: 28, currentStreak: 7, status: 'active' },
    { id: 'G', completionRate: 58, tasksCompleted: 25, currentStreak: 2, status: 'active' },
    { id: 'H', completionRate: 54, tasksCompleted: 22, currentStreak: 1, status: 'active' },
    { id: 'I', completionRate: 48, tasksCompleted: 19, currentStreak: 0, status: 'active' },
    { id: 'J', completionRate: 42, tasksCompleted: 16, currentStreak: 0, status: 'active' },
    { id: 'K', completionRate: 35, tasksCompleted: 12, currentStreak: 0, status: 'inactive' },
    { id: 'L', completionRate: 28, tasksCompleted: 8, currentStreak: 0, status: 'inactive' }
  ])

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
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-6 h-6 text-indigo-600" />}
            label="Active Members"
            value={`${teamStats.activeMembers}/${teamStats.totalMembers}`}
            trend="+2 this week"
          />
          <StatCard
            icon={<Target className="w-6 h-6 text-green-600" />}
            label="Avg Completion Rate"
            value={`${teamStats.avgCompletionRate}%`}
            trend="+5% from last week"
          />
          <StatCard
            icon={<Award className="w-6 h-6 text-yellow-600" />}
            label="Tasks Completed"
            value={teamStats.totalTasksCompleted}
            trend="+89 this week"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6 text-orange-600" />}
            label="Team Streak"
            value={`${teamStats.teamStreak} days`}
            trend="Keep it going!"
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="members" className="space-y-6">
          <TabsList>
            <TabsTrigger value="members">Team Members</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Team Members Tab */}
          <TabsContent value="members">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>Anonymized individual performance tracking</CardDescription>
                  </div>
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <TeamMemberCard key={member.id} member={member} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard">
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Based on task completion rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamMembers
                    .sort((a, b) => b.completionRate - a.completionRate)
                    .slice(0, 10)
                    .map((member, index) => (
                      <div key={member.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-400 text-yellow-900' :
                          index === 1 ? 'bg-gray-300 text-gray-900' :
                          index === 2 ? 'bg-orange-400 text-orange-900' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">Team Member {member.id}</div>
                          <div className="text-sm text-gray-600">{member.tasksCompleted} tasks completed</div>
                        </div>
                        <Badge variant={member.completionRate >= 80 ? "success" : "secondary"}>
                          {member.completionRate}%
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Distribution</CardTitle>
                  <CardDescription>Team member completion rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <PerformanceBand label="Excellent (80-100%)" count={2} color="bg-green-500" />
                    <PerformanceBand label="Good (60-79%)" count={4} color="bg-blue-500" />
                    <PerformanceBand label="Fair (40-59%)" count={4} color="bg-yellow-500" />
                    <PerformanceBand label="Needs Support (0-39%)" count={2} color="bg-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engagement Insights</CardTitle>
                  <CardDescription>Team activity patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <InsightItem
                      label="Most Active Day"
                      value="Tuesday"
                      description="Highest task completion"
                    />
                    <InsightItem
                      label="Peak Hours"
                      value="9 AM - 11 AM"
                      description="Most tasks completed"
                    />
                    <InsightItem
                      label="Avg Response Time"
                      value="18 minutes"
                      description="To motivational messages"
                    />
                    <InsightItem
                      label="Team Motivation Style"
                      value="60% Cheeky, 40% Positive"
                      description="Preference distribution"
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

function StatCard({ icon, label, value, trend }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          {icon}
          <span className="text-xs text-green-600">{trend}</span>
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

  return (
    <div className="flex items-center gap-4 p-4 border-2 rounded-lg hover:border-indigo-300 transition-all">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-semibold text-gray-900">Team Member {member.id}</span>
          <Badge variant={member.status === 'active' ? 'success' : 'secondary'} className="text-xs">
            {member.status}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Completion Rate</span>
            <span className={`font-semibold ${getStatusColor()}`}>{member.completionRate}%</span>
          </div>
          <Progress value={member.completionRate} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{member.tasksCompleted} tasks completed</span>
            <span>{member.currentStreak} day streak</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function PerformanceBand({ label, count, color }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-4 h-4 rounded ${color}`}></div>
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900">{label}</div>
      </div>
      <Badge variant="outline">{count} members</Badge>
    </div>
  )
}

function InsightItem({ label, value, description }) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-lg font-semibold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{description}</div>
    </div>
  )
}

