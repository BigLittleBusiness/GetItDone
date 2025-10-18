import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save, Bell, Palette, Brain, Calendar, Volume2 } from 'lucide-react'

export default function Settings({ user, onUpdate }) {
  const navigate = useNavigate()
  const [settings, setSettings] = useState({
    motivationStyle: user.motivationStyle || 'adaptive',
    interests: user.interests || [],
    notificationFrequency: user.notificationFrequency || 'standard',
    calendarApp: user.calendarApp || 'google',
    isAutistic: user.isAutistic || false,
    // Autism-specific settings
    visualEffects: user.visualEffects || 'reduced',
    soundEnabled: user.soundEnabled !== false,
    vibrationEnabled: user.vibrationEnabled !== false,
    darkMode: user.darkMode || false
  })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    const updatedUser = { ...user, ...settings }
    onUpdate(updatedUser)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const toggleInterest = (interest) => {
    setSettings(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50/30 to-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          <Button 
            className="ml-auto bg-[#3B4A6B] hover:bg-[#2D3A56]"
            onClick={handleSave}
          >
            <Save className="w-4 h-4 mr-2" />
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Motivation Style */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Motivation Style
              </CardTitle>
              <CardDescription>Choose how you like to be motivated</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={settings.motivationStyle} 
                onValueChange={(value) => updateSetting('motivationStyle', value)}
              >
                <div className="space-y-3">
                  <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:border-[#3B4A6B]">
                    <RadioGroupItem value="positive" id="positive-setting" className="mt-1 mr-4" />
                    <div>
                      <div className="font-semibold">Positive & Encouraging</div>
                      <div className="text-sm text-gray-600">Uplifting, supportive messages</div>
                    </div>
                  </label>
                  
                  <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:border-[#3B4A6B]">
                    <RadioGroupItem value="cheeky" id="cheeky-setting" className="mt-1 mr-4" />
                    <div>
                      <div className="font-semibold">Cheeky & Witty</div>
                      <div className="text-sm text-gray-600">Playful, humorous, direct</div>
                    </div>
                  </label>
                  
                  <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:border-[#3B4A6B]">
                    <RadioGroupItem value="adaptive" id="adaptive-setting" className="mt-1 mr-4" />
                    <div>
                      <div className="font-semibold">Adaptive</div>
                      <div className="text-sm text-gray-600">We'll learn what works best for you</div>
                    </div>
                  </label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Interests */}
          <Card>
            <CardHeader>
              <CardTitle>Interests & Themes</CardTitle>
              <CardDescription>Personalize your motivational messages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'gaming', label: 'Gaming', icon: '🎮' },
                  { id: 'sports', label: 'Sports', icon: '⚽' },
                  { id: 'movies', label: 'Movies & TV', icon: '🎬' },
                  { id: 'music', label: 'Music', icon: '🎵' },
                  { id: 'technology', label: 'Technology', icon: '💻' },
                  { id: 'travel', label: 'Travel', icon: '✈️' }
                ].map(interest => (
                  <label
                    key={interest.id}
                    className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:border-indigo-300"
                  >
                    <Checkbox
                      checked={settings.interests.includes(interest.id)}
                      onCheckedChange={() => toggleInterest(interest.id)}
                      className="mr-3"
                    />
                    <span className="text-xl mr-2">{interest.icon}</span>
                    <span className="text-sm font-medium">{interest.label}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
              <CardDescription>Control how often you receive motivation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Frequency</Label>
                  <Select 
                    value={settings.notificationFrequency} 
                    onValueChange={(value) => updateSetting('notificationFrequency', value)}
                  >
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
              </div>
            </CardContent>
          </Card>

          {/* Calendar Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Calendar Integration
              </CardTitle>
              <CardDescription>Sync with your preferred calendar app</CardDescription>
            </CardHeader>
            <CardContent>
              <Select 
                value={settings.calendarApp} 
                onValueChange={(value) => updateSetting('calendarApp', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google Calendar</SelectItem>
                  <SelectItem value="outlook">Outlook Calendar</SelectItem>
                  <SelectItem value="apple">Apple Calendar</SelectItem>
                  <SelectItem value="other">Other (manual sync)</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Communication Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Communication Preferences
              </CardTitle>
              <CardDescription>Customize how the app communicates with you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="autism-mode" className="font-semibold">Autism-Friendly Mode</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Literal, direct, clear messages with no metaphors or sarcasm
                  </p>
                </div>
                <Switch
                  id="autism-mode"
                  checked={settings.isAutistic}
                  onCheckedChange={(checked) => updateSetting('isAutistic', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Autism-Specific Settings (Conditional) */}
          {settings.isAutistic && (
            <Card className="border-2 border-blue-300 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-900">Autism-Friendly Settings</CardTitle>
                <CardDescription>Additional customization for sensory preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Visual Effects */}
                <div>
                  <Label>Visual Effects</Label>
                  <Select 
                    value={settings.visualEffects} 
                    onValueChange={(value) => updateSetting('visualEffects', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full (all animations)</SelectItem>
                      <SelectItem value="reduced">Reduced (minimal animations)</SelectItem>
                      <SelectItem value="none">None (no animations)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sound */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
                  <div>
                    <Label htmlFor="sound-enabled">Notification Sounds</Label>
                    <p className="text-sm text-gray-600 mt-1">Play sounds for notifications</p>
                  </div>
                  <Switch
                    id="sound-enabled"
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
                  />
                </div>

                {/* Vibration */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
                  <div>
                    <Label htmlFor="vibration-enabled">Vibration</Label>
                    <p className="text-sm text-gray-600 mt-1">Vibrate for notifications</p>
                  </div>
                  <Switch
                    id="vibration-enabled"
                    checked={settings.vibrationEnabled}
                    onCheckedChange={(checked) => updateSetting('vibrationEnabled', checked)}
                  />
                </div>

                {/* Dark Mode */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
                  <div>
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <p className="text-sm text-gray-600 mt-1">Reduce screen brightness</p>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => updateSetting('darkMode', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Button (Bottom) */}
          <div className="flex justify-end">
            <Button 
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={handleSave}
            >
              <Save className="w-4 h-4 mr-2" />
              {saved ? 'Settings Saved!' : 'Save All Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

