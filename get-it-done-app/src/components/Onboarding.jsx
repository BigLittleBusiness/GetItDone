import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { ArrowRight, ArrowLeft, User, Users, Sparkles, Gamepad, Briefcase, Calendar, Bell, CheckCircle } from 'lucide-react'

const TOTAL_STEPS = 10

export default function Onboarding({ onComplete }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    userType: 'individual',
    name: '',
    email: '',
    password: '',
    isAutistic: false,
    motivationStyle: 'adaptive',
    interests: [],
    gamingPreferences: [],
    workContext: '',
    calendarApp: 'google',
    notificationFrequency: 'standard'
  })

  const progress = (step / TOTAL_STEPS) * 100

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1)
    } else {
      // Complete onboarding
      const userData = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        tasks: [],
        messageHistory: [],
        stats: {
          tasksCompleted: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalPoints: 0
        }
      }
      onComplete(userData)
      navigate('/dashboard')
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const toggleArrayItem = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }))
  }

  const canProceed = () => {
    switch (step) {
      case 2:
        return formData.name && formData.email && formData.password
      case 4:
        return formData.motivationStyle
      case 7:
        return formData.workContext
      case 8:
        return formData.calendarApp
      default:
        return true
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Step {step} of {TOTAL_STEPS}</span>
            <span className="text-sm font-medium text-indigo-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {step === 1 && <Step1 formData={formData} updateFormData={updateFormData} />}
          {step === 2 && <Step2 formData={formData} updateFormData={updateFormData} />}
          {step === 3 && <Step3 formData={formData} updateFormData={updateFormData} />}
          {step === 4 && <Step4 formData={formData} updateFormData={updateFormData} />}
          {step === 5 && <Step5 formData={formData} toggleArrayItem={toggleArrayItem} />}
          {step === 6 && <Step6 formData={formData} toggleArrayItem={toggleArrayItem} />}
          {step === 7 && <Step7 formData={formData} updateFormData={updateFormData} />}
          {step === 8 && <Step8 formData={formData} updateFormData={updateFormData} />}
          {step === 9 && <Step9 formData={formData} updateFormData={updateFormData} />}
          {step === 10 && <Step10 formData={formData} />}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            {step === TOTAL_STEPS ? 'Get Started!' : 'Next'}
            {step < TOTAL_STEPS && <ArrowRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Step 1: User Type Selection
function Step1({ formData, updateFormData }) {
  return (
    <div className="text-center">
      <div className="mb-6">
        <Sparkles className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Get It Done!</h2>
        <p className="text-gray-600">Who is Get It Done! for?</p>
      </div>
      
      <RadioGroup value={formData.userType} onValueChange={(value) => updateFormData('userType', value)}>
        <div className="space-y-4">
          <label className={`flex items-center p-6 border-2 rounded-lg cursor-pointer transition-all ${
            formData.userType === 'individual' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
          }`}>
            <RadioGroupItem value="individual" id="individual" className="mr-4" />
            <User className="w-8 h-8 text-indigo-600 mr-4" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Just me (Individual)</div>
              <div className="text-sm text-gray-600">Personal productivity and motivation</div>
            </div>
          </label>
          
          <label className={`flex items-center p-6 border-2 rounded-lg cursor-pointer transition-all ${
            formData.userType === 'team' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
          }`}>
            <RadioGroupItem value="team" id="team" className="mr-4" />
            <Users className="w-8 h-8 text-indigo-600 mr-4" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">My team (Business/Organization)</div>
              <div className="text-sm text-gray-600">Team productivity with manager dashboard</div>
            </div>
          </label>
        </div>
      </RadioGroup>
    </div>
  )
}

// Step 2: Personal Information
function Step2({ formData, updateFormData }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Let's get to know you</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Your name"
            value={formData.name}
            onChange={(e) => updateFormData('name', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={(e) => updateFormData('password', e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  )
}

// Step 3: Autism Spectrum Option
function Step3({ formData, updateFormData }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Communication Preferences</h2>
      <p className="text-gray-600 mb-6">
        We want to communicate in a way that works best for you.
      </p>
      
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="autism"
            checked={formData.isAutistic}
            onCheckedChange={(checked) => updateFormData('isAutistic', checked)}
            className="mt-1"
          />
          <div>
            <Label htmlFor="autism" className="text-base font-semibold cursor-pointer">
              I am on the autism spectrum
            </Label>
            <p className="text-sm text-gray-600 mt-2">
              If selected, you'll receive messages that are literal, direct, and clear—no metaphors, 
              sarcasm, or idioms. We'll also provide additional customization options for sensory preferences.
            </p>
          </div>
        </div>
      </div>
      
      <p className="text-xs text-gray-500 mt-4">
        This helps us provide the most effective motivation for your communication style.
      </p>
    </div>
  )
}

// Step 4: Motivation Style
function Step4({ formData, updateFormData }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">How do you like to be motivated?</h2>
      <p className="text-gray-600 mb-6">Choose the style that resonates with you.</p>
      
      <RadioGroup value={formData.motivationStyle} onValueChange={(value) => updateFormData('motivationStyle', value)}>
        <div className="space-y-4">
          <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
            formData.motivationStyle === 'positive' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
          }`}>
            <RadioGroupItem value="positive" id="positive" className="mt-1 mr-4" />
            <div>
              <div className="font-semibold text-gray-900">Positive & Encouraging</div>
              <div className="text-sm text-gray-600 mt-1">
                Uplifting, supportive messages that build confidence
              </div>
              <div className="text-sm text-indigo-600 mt-2 italic">
                "You've got this! Time to show that task who's boss."
              </div>
            </div>
          </label>
          
          <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
            formData.motivationStyle === 'cheeky' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
          }`}>
            <RadioGroupItem value="cheeky" id="cheeky" className="mt-1 mr-4" />
            <div>
              <div className="font-semibold text-gray-900">Cheeky & Witty</div>
              <div className="text-sm text-gray-600 mt-1">
                Playful, humorous, direct—motivates through personality
              </div>
              <div className="text-sm text-indigo-600 mt-2 italic">
                "Your couch called. It said you're spending too much time together."
              </div>
            </div>
          </label>
          
          <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
            formData.motivationStyle === 'adaptive' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
          }`}>
            <RadioGroupItem value="adaptive" id="adaptive" className="mt-1 mr-4" />
            <div>
              <div className="font-semibold text-gray-900">Adaptive</div>
              <div className="text-sm text-gray-600 mt-1">
                We'll learn what works best for you over time
              </div>
            </div>
          </label>
        </div>
      </RadioGroup>
    </div>
  )
}

// Step 5: Interests & Themes
function Step5({ formData, toggleArrayItem }) {
  const interests = [
    { id: 'gaming', label: 'Gaming', icon: '🎮' },
    { id: 'sports', label: 'Sports', icon: '⚽' },
    { id: 'movies', label: 'Movies & TV', icon: '🎬' },
    { id: 'music', label: 'Music', icon: '🎵' },
    { id: 'technology', label: 'Technology', icon: '💻' },
    { id: 'travel', label: 'Travel', icon: '✈️' },
    { id: 'food', label: 'Food & Cooking', icon: '🍳' },
    { id: 'books', label: 'Books & Reading', icon: '📚' },
    { id: 'nature', label: 'Nature & Outdoors', icon: '🌲' },
    { id: 'none', label: 'None (keep it professional)', icon: '💼' }
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">What are you into?</h2>
      <p className="text-gray-600 mb-6">Select all that apply. We'll personalize your motivation with these themes.</p>
      
      <div className="grid grid-cols-2 gap-3">
        {interests.map(interest => (
          <label
            key={interest.id}
            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
              formData.interests.includes(interest.id) ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
            }`}
          >
            <Checkbox
              checked={formData.interests.includes(interest.id)}
              onCheckedChange={() => toggleArrayItem('interests', interest.id)}
              className="mr-3"
            />
            <span className="text-2xl mr-2">{interest.icon}</span>
            <span className="font-medium text-gray-900">{interest.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

// Step 6: Gaming Preferences (conditional)
function Step6({ formData, toggleArrayItem }) {
  if (!formData.interests.includes('gaming')) {
    return (
      <div className="text-center py-12">
        <Gamepad className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Gaming preferences will appear if you select Gaming in interests.</p>
      </div>
    )
  }

  const games = [
    { id: 'mario', label: 'Super Mario' },
    { id: 'zelda', label: 'Zelda' },
    { id: 'fps', label: 'Call of Duty / FPS games' },
    { id: 'battle_royale', label: 'Fortnite / Battle Royale' },
    { id: 'rpg', label: 'RPGs (Final Fantasy, Elder Scrolls)' },
    { id: 'sports_games', label: 'Sports games (FIFA, Madden)' },
    { id: 'strategy', label: 'Strategy games (Civilization, StarCraft)' },
    { id: 'other', label: 'Other' }
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Which games do you love?</h2>
      <p className="text-gray-600 mb-6">We'll use these to create gaming-themed motivational messages.</p>
      
      <div className="space-y-3">
        {games.map(game => (
          <label
            key={game.id}
            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
              formData.gamingPreferences.includes(game.id) ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
            }`}
          >
            <Checkbox
              checked={formData.gamingPreferences.includes(game.id)}
              onCheckedChange={() => toggleArrayItem('gamingPreferences', game.id)}
              className="mr-3"
            />
            <span className="font-medium text-gray-900">{game.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

// Step 7: Work Context
function Step7({ formData, updateFormData }) {
  const workTypes = [
    'Real estate agent',
    'Sales professional',
    'Financial advisor',
    'Consultant',
    'Entrepreneur',
    'Other'
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">What best describes your work?</h2>
      <p className="text-gray-600 mb-6">This helps us tailor motivation to your professional context.</p>
      
      <RadioGroup value={formData.workContext} onValueChange={(value) => updateFormData('workContext', value)}>
        <div className="space-y-3">
          {workTypes.map(work => (
            <label
              key={work}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.workContext === work ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              <RadioGroupItem value={work} id={work} className="mr-4" />
              <Briefcase className="w-5 h-5 text-indigo-600 mr-3" />
              <span className="font-medium text-gray-900">{work}</span>
            </label>
          ))}
        </div>
      </RadioGroup>
    </div>
  )
}

// Step 8: Calendar Integration
function Step8({ formData, updateFormData }) {
  const calendars = [
    { id: 'google', label: 'Google Calendar', icon: '📅' },
    { id: 'outlook', label: 'Outlook Calendar', icon: '📆' },
    { id: 'apple', label: 'Apple Calendar', icon: '🍎' },
    { id: 'other', label: 'Other (manual sync)', icon: '📝' }
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Which calendar app do you use?</h2>
      <p className="text-gray-600 mb-6">We'll sync your tasks and send timely motivation.</p>
      
      <RadioGroup value={formData.calendarApp} onValueChange={(value) => updateFormData('calendarApp', value)}>
        <div className="space-y-3">
          {calendars.map(calendar => (
            <label
              key={calendar.id}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.calendarApp === calendar.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              <RadioGroupItem value={calendar.id} id={calendar.id} className="mr-4" />
              <span className="text-2xl mr-3">{calendar.icon}</span>
              <span className="font-medium text-gray-900">{calendar.label}</span>
            </label>
          ))}
        </div>
      </RadioGroup>
    </div>
  )
}

// Step 9: Notification Preferences
function Step9({ formData, updateFormData }) {
  const frequencies = [
    { id: 'light', label: 'Light', desc: '2-3 messages per day' },
    { id: 'standard', label: 'Standard', desc: '4-5 messages per day' },
    { id: 'intense', label: 'Intense', desc: '6-7 messages per day' }
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">How often should we motivate you?</h2>
      <p className="text-gray-600 mb-6">You can always adjust this later in settings.</p>
      
      <RadioGroup value={formData.notificationFrequency} onValueChange={(value) => updateFormData('notificationFrequency', value)}>
        <div className="space-y-3">
          {frequencies.map(freq => (
            <label
              key={freq.id}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.notificationFrequency === freq.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              <RadioGroupItem value={freq.id} id={freq.id} className="mr-4" />
              <Bell className="w-5 h-5 text-indigo-600 mr-3" />
              <div>
                <div className="font-medium text-gray-900">{freq.label}</div>
                <div className="text-sm text-gray-600">{freq.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </RadioGroup>
    </div>
  )
}

// Step 10: Confirmation
function Step10({ formData }) {
  const getMotivationStyleLabel = () => {
    switch (formData.motivationStyle) {
      case 'positive': return 'Positive & Encouraging'
      case 'cheeky': return 'Cheeky & Witty'
      case 'adaptive': return 'Adaptive'
      default: return formData.motivationStyle
    }
  }

  return (
    <div className="text-center">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Perfect! You're all set!</h2>
      
      <div className="bg-indigo-50 rounded-lg p-6 text-left mb-6">
        <p className="text-gray-700 mb-4">
          We'll start sending you <span className="font-semibold text-indigo-600">{getMotivationStyleLabel()}</span> motivational 
          messages{formData.interests.length > 0 && ` with ${formData.interests.join(', ')} themes`}, 
          tailored for <span className="font-semibold text-indigo-600">{formData.workContext || 'your work'}</span>.
        </p>
        {formData.isAutistic && (
          <p className="text-gray-700 bg-blue-100 p-3 rounded">
            ✓ Autism-friendly mode enabled: You'll receive literal, clear, and direct messages.
          </p>
        )}
      </div>
      
      <p className="text-gray-600">
        Click "Get Started!" to begin your productivity journey.
      </p>
    </div>
  )
}

