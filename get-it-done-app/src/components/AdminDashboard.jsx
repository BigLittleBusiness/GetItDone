import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  LayoutDashboard, Users, MessageSquare, DollarSign, Settings, 
  TrendingUp, UserPlus, Edit, Trash2, Search, Download, Plus,
  AlertCircle, CheckCircle, XCircle, BarChart3, Shield
} from 'lucide-react'

export default function AdminDashboard({ onLogout }) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState('overview')

  // Mock data (in production, this would come from API)
  const [platformStats] = useState({
    totalUsers: 1247,
    activeUsers: 892,
    totalTeams: 34,
    totalRevenue: 4580,
    monthlyRevenue: 1240,
    totalDonations: 156,
    avgDonation: 7.50,
    retentionRate: 68,
    messagesSent: 45678,
    tasksCompleted: 23456
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Shield className="w-8 h-8 text-indigo-400" />
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-slate-400">Get It Done! Platform Management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="text-white border-white hover:bg-slate-800" onClick={() => navigate('/dashboard')}>
              View App
            </Button>
            <Button variant="ghost" className="text-white hover:bg-slate-800" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-5 w-full max-w-3xl mb-8">
            <TabsTrigger value="overview">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="revenue">
              <DollarSign className="w-4 h-4 mr-2" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <OverviewTab stats={platformStats} />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <UsersTab searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <MessagesTab />
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue">
            <RevenueTab stats={platformStats} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Overview Tab Component
function OverviewTab({ stats }) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <MetricCard
          icon={<Users className="w-6 h-6 text-blue-600" />}
          label="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change="+12% this month"
          trend="up"
        />
        <MetricCard
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          label="Active Users"
          value={stats.activeUsers.toLocaleString()}
          change={`${Math.round((stats.activeUsers / stats.totalUsers) * 100)}% active`}
          trend="up"
        />
        <MetricCard
          icon={<DollarSign className="w-6 h-6 text-emerald-600" />}
          label="Monthly Revenue"
          value={`$${stats.monthlyRevenue.toLocaleString()}`}
          change="+8% vs last month"
          trend="up"
        />
        <MetricCard
          icon={<BarChart3 className="w-6 h-6 text-purple-600" />}
          label="Retention Rate"
          value={`${stats.retentionRate}%`}
          change="30-day retention"
          trend="up"
        />
      </div>

      {/* Platform Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Activity</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ActivityItem label="Messages Sent" value={stats.messagesSent.toLocaleString()} />
              <ActivityItem label="Tasks Completed" value={stats.tasksCompleted.toLocaleString()} />
              <ActivityItem label="Total Donations" value={stats.totalDonations} />
              <ActivityItem label="Active Teams" value={stats.totalTeams} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Signups</CardTitle>
            <CardDescription>Last 10 users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-medium">User #{1247 - i + 1}</div>
                    <div className="text-sm text-gray-600">user{1247 - i + 1}@example.com</div>
                  </div>
                  <Badge variant="outline">Individual</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Users Tab Component
function UsersTab({ searchQuery, setSearchQuery }) {
  const [users] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', type: 'individual', status: 'active', created: '2025-01-15', tasks: 45, streak: 12 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', type: 'team', status: 'active', created: '2025-01-10', tasks: 78, streak: 20 },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', type: 'individual', status: 'active', created: '2025-01-08', tasks: 23, streak: 5 },
    { id: 4, name: 'Alice Williams', email: 'alice@example.com', type: 'individual', status: 'inactive', created: '2024-12-20', tasks: 12, streak: 0 },
    { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', type: 'team', status: 'active', created: '2025-01-12', tasks: 56, streak: 15 }
  ])

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage all users</CardDescription>
            </div>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Users Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-3 font-semibold">User</th>
                  <th className="text-left p-3 font-semibold">Type</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-left p-3 font-semibold">Tasks</th>
                  <th className="text-left p-3 font-semibold">Streak</th>
                  <th className="text-left p-3 font-semibold">Created</th>
                  <th className="text-left p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-slate-50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">{user.type}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant={user.status === 'active' ? 'success' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="p-3">{user.tasks}</td>
                    <td className="p-3">{user.streak} days</td>
                    <td className="p-3 text-sm text-gray-600">{user.created}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Messages Tab Component
function MessagesTab() {
  const [newMessage, setNewMessage] = useState({
    category: 'positive',
    theme: 'general',
    text: '',
    context: []
  })

  const [messages] = useState([
    { id: 'pos_gen_001', category: 'positive', theme: 'general', text: "You've got this! Time to show that task who's boss.", uses: 234 },
    { id: 'chk_gen_001', category: 'cheeky', theme: 'general', text: "Your couch called. It said you're spending too much time together.", uses: 189 },
    { id: 'pos_mar_001', category: 'positive', theme: 'mario', text: "Let's-a-go! Your task is waiting and you're ready to jump right in! 🍄", uses: 156 },
    { id: 'aut_gen_001', category: 'autism', theme: 'general', text: "Your meeting starts in 15 minutes. You have time to prepare.", uses: 98 }
  ])

  return (
    <div className="space-y-6">
      {/* Add New Message */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Motivational Message</CardTitle>
          <CardDescription>Create a new message for the library</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={newMessage.category} onValueChange={(value) => setNewMessage({...newMessage, category: value})}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">Positive & Encouraging</SelectItem>
                    <SelectItem value="cheeky">Cheeky & Witty</SelectItem>
                    <SelectItem value="autism">Autism-Friendly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Theme</Label>
                <Select value={newMessage.theme} onValueChange={(value) => setNewMessage({...newMessage, theme: value})}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="gaming">Gaming</SelectItem>
                    <SelectItem value="mario">Super Mario</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Message Text</Label>
              <Textarea
                placeholder="Enter the motivational message..."
                value={newMessage.text}
                onChange={(e) => setNewMessage({...newMessage, text: e.target.value})}
                className="mt-2"
                rows={3}
              />
            </div>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Message
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Message Library */}
      <Card>
        <CardHeader>
          <CardTitle>Message Library</CardTitle>
          <CardDescription>All motivational messages ({messages.length} total)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {messages.map((message) => (
              <div key={message.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-slate-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{message.category}</Badge>
                    <Badge variant="secondary">{message.theme}</Badge>
                    <span className="text-xs text-gray-500 ml-auto">Used {message.uses} times</span>
                  </div>
                  <p className="text-gray-900">{message.text}</p>
                  <p className="text-xs text-gray-500 mt-1">ID: {message.id}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Revenue Tab Component
function RevenueTab({ stats }) {
  const [donations] = useState([
    { id: 1, user: 'John Doe', amount: 10, frequency: 'monthly', status: 'active', date: '2025-01-15' },
    { id: 2, user: 'Jane Smith', amount: 5, frequency: 'monthly', status: 'active', date: '2025-01-10' },
    { id: 3, user: 'Bob Johnson', amount: 20, frequency: 'one-time', status: 'completed', date: '2025-01-08' },
    { id: 4, user: 'Alice Williams', amount: 2, frequency: 'monthly', status: 'cancelled', date: '2024-12-20' }
  ])

  return (
    <div className="space-y-6">
      {/* Revenue Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
            <div className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</div>
            <div className="text-xs text-green-600 mt-1">All time</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Monthly Recurring</div>
            <div className="text-3xl font-bold text-gray-900">${stats.monthlyRevenue.toLocaleString()}</div>
            <div className="text-xs text-green-600 mt-1">+8% vs last month</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 mb-1">Avg Donation</div>
            <div className="text-3xl font-bold text-gray-900">${stats.avgDonation.toFixed(2)}</div>
            <div className="text-xs text-gray-600 mt-1">Per donor</div>
          </CardContent>
        </Card>
      </div>

      {/* Donations Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Donations</CardTitle>
              <CardDescription>All donations and subscriptions</CardDescription>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-3 font-semibold">User</th>
                  <th className="text-left p-3 font-semibold">Amount</th>
                  <th className="text-left p-3 font-semibold">Frequency</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-left p-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((donation) => (
                  <tr key={donation.id} className="border-t hover:bg-slate-50">
                    <td className="p-3 font-medium">{donation.user}</td>
                    <td className="p-3">${donation.amount}/mo</td>
                    <td className="p-3">
                      <Badge variant="outline">{donation.frequency}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant={
                        donation.status === 'active' ? 'success' :
                        donation.status === 'completed' ? 'secondary' :
                        'destructive'
                      }>
                        {donation.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm text-gray-600">{donation.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Settings Tab Component
function SettingsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Platform Settings</CardTitle>
          <CardDescription>Configure global app settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Default Notification Frequency</Label>
            <Select defaultValue="standard">
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light (2-3 per day)</SelectItem>
                <SelectItem value="standard">Standard (4-5 per day)</SelectItem>
                <SelectItem value="intense">Intense (6-7 per day)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Minimum Message Pool Size</Label>
            <Input type="number" defaultValue="1000" className="mt-2" />
            <p className="text-xs text-gray-500 mt-1">Minimum number of messages before allowing repeats</p>
          </div>

          <div>
            <Label>Message Repeat Threshold (days)</Label>
            <Input type="number" defaultValue="180" className="mt-2" />
            <p className="text-xs text-gray-500 mt-1">Days before a message can be shown again</p>
          </div>

          <div>
            <Label>Maintenance Mode</Label>
            <div className="flex items-center gap-4 mt-2">
              <Button variant="outline">Enable Maintenance Mode</Button>
              <span className="text-sm text-gray-600">Currently: Active</span>
            </div>
          </div>

          <Button className="bg-indigo-600 hover:bg-indigo-700">
            Save Settings
          </Button>
        </CardContent>
      </Card>
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

function ActivityItem({ label, value }) {
  return (
    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  )
}

