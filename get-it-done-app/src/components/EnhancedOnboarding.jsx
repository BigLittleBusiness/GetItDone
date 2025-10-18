import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowRight, ArrowLeft, User, Users, Sparkles, Gamepad, Briefcase, 
  Calendar, Bell, CheckCircle, GraduationCap, Baby, Heart, Zap 
} from 'lucide-react'

const TOTAL_STEPS = 12

export default function EnhancedOnboarding({ onComplete }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    userType: 'individual', // 'individual' or 'team'
    name: '',
    email: '',
    password: '',
    
    // Multi-role selection
    roles: [], // Can include: 'student', 'professional', 'parent', 'team_manager'
    primaryRole: '', // Main focus
    
    // Autism support
    isAutistic: false,
    
    // Student-specific
    educationLevel: '', // 'primary', 'highschool', 'university'
    
    // Parent-specific
    isParent: false,
    childAge: '', // 'newborn', 'baby', 'toddler', 'preschool', 'school-age'
    isCoParenting: false,
    
    // Professional-specific
    industry: '', // 'real_estate', 'sales', 'other'
    
    // Motivation & personalization
    motivationStyle: 'positive', // 'positive', 'cheeky', or auto-set to 'autism' if isAutistic
    interests: [],
    gamingPreferences: [],
    
    // Calendar & notifications
    calendarApp: 'google',
    notificationFrequency: 'standard',
    
    // Context switching
    currentContext: 'primary' // Which role context user is currently in
  })

  const progress = (step / TOTAL_STEPS) * 100

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      // Skip steps based on selections
      let nextStep = step + 1
      
      // Skip gaming preferences if not interested in gaming
      if (step === 6 && !formData.interests.includes('gaming')) {
        nextStep = 8
      }
      
      // Skip parent-specific questions if not a parent
      if (step === 8 && !formData.roles.includes('parent')) {
        nextStep = 10
      }
      
      setStep(nextStep)
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
          totalPoints: 0,
          selfCareCount: 0
        },
        achievements: [],
        calendarConnected: false
      }
      
      // Set motivation style to autism-friendly if user is autistic
      if (userData.isAutistic) {
        userData.motivationStyle = 'autism'
      }
      
      // Set current context to primary role
      userData.currentContext = userData.primaryRole
      
      onComplete(userData)
      navigate('/dashboard')
    }
  }

  const handleBack = () => {
    if (step > 1) {
      let prevStep = step - 1
      
      // Skip back over skipped steps
      if (step === 8 && !formData.interests.includes('gaming')) {
        prevStep = 6
      }
      if (step === 10 && !formData.roles.includes('parent')) {
        prevStep = 8
      }
      
      setStep(prevStep)
    }
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

  const toggleRole = (role) => {
    setFormData(prev => {
      const newRoles = prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
      
      // If removing primary role, clear it
      const newPrimaryRole = newRoles.includes(prev.primaryRole) ? prev.primaryRole : ''
      
      return {
        ...prev,
        roles: newRoles,
        primaryRole: newPrimaryRole
      }
    })
  }

  const canProceed = () => {
    switch (step) {
      case 2:
        return formData.name && formData.email && formData.password
      case 3:
        return formData.roles.length > 0
      case 4:
        return formData.primaryRole
      case 5:
        // If student role, must select education level
        if (formData.roles.includes('student')) {
          return formData.educationLevel
        }
        return true
      case 7:
        return formData.motivationStyle
      case 9:
        // If parent role, must answer parent questions
        if (formData.roles.includes('parent')) {
          return formData.childAge
        }
        return true
      case 10:
        // If professional role, should select industry (optional but encouraged)
        return true
      case 11:
        return formData.calendarApp
      default:
        return true
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50/30 to-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        {/* Enhanced Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <div>
              <span className="text-sm font-medium text-gray-600">Step {step} of {TOTAL_STEPS}</span>
              <p className="text-xs text-gray-500 mt-0.5">
                {step === 1 && "Let's get started"}
                {step === 2 && "Tell us about yourself"}
                {step === 3 && "Select your roles"}
                {step === 4 && "Choose your primary focus"}
                {step === 5 && "Student details"}
                {step === 6 && "What interests you?"}
                {step === 7 && "Choose your motivation style"}
                {step === 8 && "Gaming preferences"}
                {step === 9 && "Parent details"}
                {step === 10 && "Professional details"}
                {step === 11 && "Calendar integration"}
                {step === 12 && "Notification preferences"}
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-[#3B4A6B]">{Math.round(progress)}%</span>
              <p className="text-xs text-gray-500 mt-0.5">Complete</p>
            </div>
          </div>
          <div className="relative">
            <Progress value={progress} className="h-3" />
            {/* Milestone markers */}
            <div className="absolute top-0 left-0 right-0 h-3 flex justify-between px-1">
              {[...Array(TOTAL_STEPS)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 h-full rounded-full transition-all ${
                    i < step ? 'bg-white' : 'bg-transparent'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[450px]">
          
          {/* Step 1: User Type */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <Zap className="w-16 h-16 text-[#3B4A6B] mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Get It Done!</h2>
                <p className="text-gray-600">Motivation for every stage of life</p>
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-semibold">Who is Get It Done! for?</Label>
                
                <div 
                  onClick={() => updateFormData('userType', 'individual')}
                  className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.userType === 'individual' 
                      ? 'border-[#3B4A6B] bg-[#3B4A6B]/10' 
                      : 'border-gray-200 hover:border-[#3B4A6B]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <User className="w-8 h-8 text-[#3B4A6B]" />
                    <div>
                      <h3 className="font-semibold text-lg">Just me (Individual)</h3>
                      <p className="text-sm text-gray-600">Personal productivity and motivation</p>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => updateFormData('userType', 'team')}
                  className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.userType === 'team' 
                      ? 'border-[#3B4A6B] bg-[#3B4A6B]/10' 
                      : 'border-gray-200 hover:border-[#3B4A6B]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Users className="w-8 h-8 text-indigo-600" />
                    <div>
                      <h3 className="font-semibold text-lg">My team (Business/Organization)</h3>
                      <p className="text-sm text-gray-600">Team productivity and accountability</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Personal Information */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Let's get to know you</h2>
                <p className="text-gray-600">We'll use this to personalize your experience</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    placeholder="Enter your name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    placeholder="your@email.com"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    placeholder="Create a password"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Role Selection (Multi-select) */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">What describes you?</h2>
                <p className="text-gray-600">Select all that apply</p>
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">💡 Why we're asking:</span> We'll tailor your motivational messages and task categories to match your life stages. You can switch between contexts anytime!
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div 
                  onClick={() => toggleRole('student')}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.roles.includes('student') 
                      ? 'border-[#3B4A6B] bg-[#3B4A6B]/10' 
                      : 'border-gray-200 hover:border-[#3B4A6B]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox checked={formData.roles.includes('student')} />
                    <GraduationCap className="w-6 h-6 text-indigo-600" />
                    <div>
                      <h3 className="font-semibold">Student</h3>
                      <p className="text-sm text-gray-600">Primary, High School, or University</p>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => toggleRole('professional')}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.roles.includes('professional') 
                      ? 'border-[#3B4A6B] bg-[#3B4A6B]/10' 
                      : 'border-gray-200 hover:border-[#3B4A6B]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox checked={formData.roles.includes('professional')} />
                    <Briefcase className="w-6 h-6 text-indigo-600" />
                    <div>
                      <h3 className="font-semibold">Professional</h3>
                      <p className="text-sm text-gray-600">Real estate, sales, or other career</p>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => toggleRole('parent')}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.roles.includes('parent') 
                      ? 'border-[#3B4A6B] bg-[#3B4A6B]/10' 
                      : 'border-gray-200 hover:border-[#3B4A6B]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox checked={formData.roles.includes('parent')} />
                    <Baby className="w-6 h-6 text-indigo-600" />
                    <div>
                      <h3 className="font-semibold">Parent</h3>
                      <p className="text-sm text-gray-600">Managing family and household tasks</p>
                    </div>
                  </div>
                </div>

                {formData.userType === 'team' && (
                  <div 
                    onClick={() => toggleRole('team_manager')}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.roles.includes('team_manager') 
                        ? 'border-[#3B4A6B] bg-[#3B4A6B]/10' 
                        : 'border-gray-200 hover:border-[#3B4A6B]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox checked={formData.roles.includes('team_manager')} />
                      <Users className="w-6 h-6 text-indigo-600" />
                      <div>
                        <h3 className="font-semibold">Team Manager</h3>
                        <p className="text-sm text-gray-600">Managing team productivity</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {formData.roles.length === 0 && (
                <p className="text-sm text-red-600">Please select at least one role</p>
              )}
            </div>
          )}

          {/* Step 4: Primary Role */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">What's your main focus?</h2>
                <p className="text-gray-600">Which role describes your primary focus right now?</p>
              </div>

              <RadioGroup value={formData.primaryRole} onValueChange={(value) => updateFormData('primaryRole', value)}>
                <div className="space-y-3">
                  {formData.roles.map(role => (
                    <div key={role} className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-300 transition-all">
                      <RadioGroupItem value={role} id={role} />
                      <Label htmlFor={role} className="flex-1 cursor-pointer capitalize">
                        {role === 'team_manager' ? 'Team Manager' : role}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Step 5: Education Level (if student) */}
          {step === 5 && formData.roles.includes('student') && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">What level are you studying?</h2>
                <p className="text-gray-600">This helps us personalize your motivation</p>
              </div>

              <RadioGroup value={formData.educationLevel} onValueChange={(value) => updateFormData('educationLevel', value)}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-300 transition-all">
                    <RadioGroupItem value="primary" id="primary" />
                    <Label htmlFor="primary" className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-semibold">Primary School</p>
                        <p className="text-sm text-gray-600">Ages 6-11</p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-300 transition-all">
                    <RadioGroupItem value="highschool" id="highschool" />
                    <Label htmlFor="highschool" className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-semibold">High School</p>
                        <p className="text-sm text-gray-600">Ages 14-18</p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-300 transition-all">
                    <RadioGroupItem value="university" id="university" />
                    <Label htmlFor="university" className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-semibold">University/College</p>
                        <p className="text-sm text-gray-600">Ages 18+</p>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Step 5 (alternate): Autism Spectrum Question */}
          {step === 5 && !formData.roles.includes('student') && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Communication preferences</h2>
                <p className="text-gray-600">Help us communicate with you effectively</p>
              </div>

              <div 
                onClick={() => updateFormData('isAutistic', !formData.isAutistic)}
                className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                  formData.isAutistic 
                    ? 'border-indigo-600 bg-indigo-50' 
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={formData.isAutistic} />
                  <div>
                    <h3 className="font-semibold">I am on the autism spectrum</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      We'll use clear, literal language and provide structured, predictable communication
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 italic">
                This helps us provide autism-friendly features like literal messages, reduced animations, and clear instructions.
              </p>
            </div>
          )}

          {/* Step 6: Autism Spectrum (if student) */}
          {step === 6 && formData.roles.includes('student') && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Communication preferences</h2>
                <p className="text-gray-600">Help us communicate with you effectively</p>
              </div>

              <div 
                onClick={() => updateFormData('isAutistic', !formData.isAutistic)}
                className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                  formData.isAutistic 
                    ? 'border-indigo-600 bg-indigo-50' 
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={formData.isAutistic} />
                  <div>
                    <h3 className="font-semibold">I am on the autism spectrum</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      We'll use clear, literal language and provide structured, predictable communication
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Motivation Style */}
          {step === 7 && !formData.isAutistic && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">How do you like to be motivated?</h2>
                <p className="text-gray-600">Choose the style that resonates with you</p>
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">💡 Why we're asking:</span> Our AI generates 1000+ unique messages in your preferred style. You'll never see the same message twice for 6+ months!
                  </p>
                </div>
              </div>

              <RadioGroup value={formData.motivationStyle} onValueChange={(value) => updateFormData('motivationStyle', value)}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-300 transition-all">
                    <RadioGroupItem value="positive" id="positive" />
                    <Label htmlFor="positive" className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-semibold">Positive & Encouraging</p>
                        <p className="text-sm text-gray-600">"You've got this! Let's make it happen!"</p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-300 transition-all">
                    <RadioGroupItem value="cheeky" id="cheeky" />
                    <Label htmlFor="cheeky" className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-semibold">Cheeky & Witty</p>
                        <p className="text-sm text-gray-600">"That task won't do itself. Unfortunately. Your turn!"</p>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Step 7 (skip if autistic) */}
          {step === 7 && formData.isAutistic && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Autism-friendly mode enabled</h2>
                <p className="text-gray-600">
                  You'll receive clear, literal messages with no metaphors or sarcasm.
                </p>
              </div>
            </div>
          )}

          {/* Step 8: Interests */}
          {step === 8 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">What are your interests?</h2>
                <p className="text-gray-600">We'll personalize your motivational messages (select all that apply)</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {['Gaming', 'Sports', 'Movies/TV', 'Music', 'Technology', 'Reading'].map(interest => (
                  <div 
                    key={interest}
                    onClick={() => toggleArrayItem('interests', interest.toLowerCase().replace('/', '_'))}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.interests.includes(interest.toLowerCase().replace('/', '_'))
                        ? 'border-[#3B4A6B] bg-[#3B4A6B]/10' 
                        : 'border-gray-200 hover:border-[#3B4A6B]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox checked={formData.interests.includes(interest.toLowerCase().replace('/', '_'))} />
                      <span className="font-medium">{interest}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 9: Gaming Preferences (conditional) */}
          {step === 9 && formData.interests.includes('gaming') && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">What games do you love?</h2>
                <p className="text-gray-600">We'll use gaming references you'll recognize</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {['Super Mario', 'Zelda', 'FPS Games', 'RPGs', 'Strategy', 'Fighting Games'].map(game => (
                  <div 
                    key={game}
                    onClick={() => toggleArrayItem('gamingPreferences', game.toLowerCase().replace(' ', '_'))}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.gamingPreferences.includes(game.toLowerCase().replace(' ', '_'))
                        ? 'border-[#3B4A6B] bg-[#3B4A6B]/10' 
                        : 'border-gray-200 hover:border-[#3B4A6B]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox checked={formData.gamingPreferences.includes(game.toLowerCase().replace(' ', '_'))} />
                      <span className="font-medium">{game}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 9 (alternate): Parent Questions */}
          {step === 9 && formData.roles.includes('parent') && !formData.interests.includes('gaming') && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about your family</h2>
                <p className="text-gray-600">This helps us provide relevant support</p>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">How old is your youngest child?</Label>
                <RadioGroup value={formData.childAge} onValueChange={(value) => updateFormData('childAge', value)}>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg hover:border-indigo-300 transition-all">
                      <RadioGroupItem value="newborn" id="newborn" />
                      <Label htmlFor="newborn" className="flex-1 cursor-pointer">Newborn (0-3 months)</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg hover:border-indigo-300 transition-all">
                      <RadioGroupItem value="baby" id="baby" />
                      <Label htmlFor="baby" className="flex-1 cursor-pointer">Baby (3-12 months)</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg hover:border-indigo-300 transition-all">
                      <RadioGroupItem value="toddler" id="toddler" />
                      <Label htmlFor="toddler" className="flex-1 cursor-pointer">Toddler (1-3 years)</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg hover:border-indigo-300 transition-all">
                      <RadioGroupItem value="preschool" id="preschool" />
                      <Label htmlFor="preschool" className="flex-1 cursor-pointer">Preschool (3-5 years)</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg hover:border-indigo-300 transition-all">
                      <RadioGroupItem value="school-age" id="school-age" />
                      <Label htmlFor="school-age" className="flex-1 cursor-pointer">School-age (5+ years)</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">Are you co-parenting?</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={formData.isCoParenting ? "default" : "outline"}
                    onClick={() => updateFormData('isCoParenting', true)}
                    className="flex-1"
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant={!formData.isCoParenting ? "default" : "outline"}
                    onClick={() => updateFormData('isCoParenting', false)}
                    className="flex-1"
                  >
                    No
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Partner task sharing features will be available in a future update
                </p>
              </div>
            </div>
          )}

          {/* Step 10: Industry (if professional) */}
          {step === 10 && formData.roles.includes('professional') && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">What's your industry?</h2>
                <p className="text-gray-600">This helps us provide relevant context</p>
              </div>

              <RadioGroup value={formData.industry} onValueChange={(value) => updateFormData('industry', value)}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-300 transition-all">
                    <RadioGroupItem value="real_estate" id="real_estate" />
                    <Label htmlFor="real_estate" className="flex-1 cursor-pointer">Real Estate</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-300 transition-all">
                    <RadioGroupItem value="sales" id="sales" />
                    <Label htmlFor="sales" className="flex-1 cursor-pointer">Sales</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-300 transition-all">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="flex-1 cursor-pointer">Other</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Step 11: Calendar Integration */}
          {step === 11 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect your calendar</h2>
                <p className="text-gray-600">Sync tasks with your phone's calendar app</p>
              </div>

              <RadioGroup value={formData.calendarApp} onValueChange={(value) => updateFormData('calendarApp', value)}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-300 transition-all">
                    <RadioGroupItem value="google" id="google" />
                    <Label htmlFor="google" className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-semibold">Google Calendar</p>
                        <p className="text-sm text-gray-600">Sync with Gmail calendar</p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-300 transition-all">
                    <RadioGroupItem value="outlook" id="outlook" />
                    <Label htmlFor="outlook" className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-semibold">Outlook Calendar</p>
                        <p className="text-sm text-gray-600">Sync with Microsoft Outlook</p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-300 transition-all">
                    <RadioGroupItem value="apple" id="apple" />
                    <Label htmlFor="apple" className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-semibold">Apple Calendar (iCal)</p>
                        <p className="text-sm text-gray-600">Sync with iCloud calendar</p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-300 transition-all">
                    <RadioGroupItem value="none" id="none" />
                    <Label htmlFor="none" className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-semibold">Skip for now</p>
                        <p className="text-sm text-gray-600">I'll connect later</p>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>

              <p className="text-xs text-gray-500 italic">
                You can connect your calendar later in Settings
              </p>
            </div>
          )}

          {/* Step 12: Notifications */}
          {step === 12 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">How often should we motivate you?</h2>
                <p className="text-gray-600">Choose your notification frequency</p>
              </div>

              <RadioGroup value={formData.notificationFrequency} onValueChange={(value) => updateFormData('notificationFrequency', value)}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-300 transition-all">
                    <RadioGroupItem value="minimal" id="minimal" />
                    <Label htmlFor="minimal" className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-semibold">Minimal</p>
                        <p className="text-sm text-gray-600">Only for high-priority tasks</p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-300 transition-all">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard" className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-semibold">Standard</p>
                        <p className="text-sm text-gray-600">Balanced reminders (recommended)</p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-300 transition-all">
                    <RadioGroupItem value="frequent" id="frequent" />
                    <Label htmlFor="frequent" className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-semibold">Frequent</p>
                        <p className="text-sm text-gray-600">Maximum motivation and reminders</p>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
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
            className="flex items-center gap-2"
          >
            {step === TOTAL_STEPS ? 'Complete' : 'Next'}
            {step === TOTAL_STEPS ? <CheckCircle className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}

