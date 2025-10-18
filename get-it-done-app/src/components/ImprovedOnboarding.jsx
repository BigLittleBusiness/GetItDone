import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowRight, ArrowLeft, User, Users, Sparkles, Gamepad, Briefcase, 
  Calendar, Bell, CheckCircle, GraduationCap, Baby, Heart, Zap, Save 
} from 'lucide-react'
import WelcomeScreen from './WelcomeScreen'
import InteractivePreview from './InteractivePreview'

// Core onboarding: 4 essential steps
// Progressive onboarding: Additional personalization shown during first use
const CORE_STEPS = 4
const TOTAL_STEPS = 12

export default function ImprovedOnboarding({ onComplete }) {
  const navigate = useNavigate()
  const [showWelcome, setShowWelcome] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const [step, setStep] = useState(1)
  const [onboardingPhase, setOnboardingPhase] = useState('core') // 'core' or 'progressive'
  
  const [formData, setFormData] = useState({
    userType: 'individual',
    name: '',
    email: '',
    password: '',
    roles: [],
    primaryRole: '',
    
    // Progressive onboarding fields (optional, can be skipped)
    isAutistic: false,
    educationLevel: '',
    childAge: '',
    isCoParenting: false,
    industry: '',
    motivationStyle: 'positive',
    interests: [],
    gamingPreferences: [],
    calendarApp: 'google',
    notificationFrequency: 'standard',
    
    // Onboarding state
    coreOnboardingComplete: false,
    progressiveOnboardingComplete: false,
    currentContext: 'primary'
  })

  // Load saved progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('onboarding_progress')
    if (saved) {
      try {
        const savedData = JSON.parse(saved)
        setFormData(savedData.formData)
        setStep(savedData.step)
        setOnboardingPhase(savedData.phase)
        setShowWelcome(false)
      } catch (e) {
        console.error('Failed to load saved progress:', e)
      }
    }
  }, [])

  // Save progress to localStorage
  const saveProgress = () => {
    const progressData = {
      formData,
      step,
      phase: onboardingPhase,
      savedAt: new Date().toISOString()
    }
    localStorage.setItem('onboarding_progress', JSON.stringify(progressData))
  }

  const progress = onboardingPhase === 'core' 
    ? (step / CORE_STEPS) * 100 
    : ((CORE_STEPS + (step - CORE_STEPS)) / TOTAL_STEPS) * 100

  const handleNext = () => {
    // Save progress after each step
    saveProgress()

    // Core onboarding flow (Steps 1-4)
    if (onboardingPhase === 'core') {
      if (step < CORE_STEPS) {
        setStep(step + 1)
      } else {
        // Core onboarding complete - go to dashboard
        completeOnboarding(true) // skipProgressive = true
      }
    } 
    // Progressive onboarding flow (Steps 5-12)
    else {
      if (step < TOTAL_STEPS) {
        let nextStep = step + 1
        
        // Skip steps based on selections
        if (step === 6 && !formData.interests.includes('gaming')) {
          nextStep = 8
        }
        if (step === 8 && !formData.roles.includes('parent')) {
          nextStep = 10
        }
        
        setStep(nextStep)
      } else {
        // Progressive onboarding complete
        completeOnboarding(false)
      }
    }
  }

  const handleBack = () => {
    if (step > 1) {
      let prevStep = step - 1
      
      // Skip back over skipped steps in progressive onboarding
      if (onboardingPhase === 'progressive') {
        if (step === 8 && !formData.interests.includes('gaming')) {
          prevStep = 6
        }
        if (step === 10 && !formData.roles.includes('parent')) {
          prevStep = 8
        }
      }
      
      setStep(prevStep)
    }
  }

  const handleSkip = () => {
    // Only allow skipping in progressive onboarding
    if (onboardingPhase === 'progressive') {
      completeOnboarding(false)
    }
  }

  const completeOnboarding = (skipProgressive = false) => {
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
      calendarConnected: false,
      coreOnboardingComplete: true,
      progressiveOnboardingComplete: !skipProgressive
    }
    
    // Set motivation style to autism-friendly if user is autistic
    if (userData.isAutistic) {
      userData.motivationStyle = 'autism'
    }
    
    // Set current context to primary role
    userData.currentContext = userData.primaryRole
    
    // Clear saved progress
    localStorage.removeItem('onboarding_progress')
    
    onComplete(userData)
    navigate('/dashboard')
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
        if (formData.roles.includes('student')) {
          return formData.educationLevel
        }
        return true
      case 7:
        return formData.motivationStyle
      case 9:
        if (formData.roles.includes('parent')) {
          return formData.childAge
        }
        return true
      case 11:
        return formData.calendarApp
      default:
        return true
    }
  }

  if (showWelcome) {
    return <WelcomeScreen onContinue={() => {
      setShowWelcome(false)
      setShowPreview(true)
    }} />
  }

  if (showPreview) {
    return <InteractivePreview onComplete={() => setShowPreview(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50/30 to-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        {/* Enhanced Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <div>
              <span className="text-sm font-medium text-gray-600">
                {onboardingPhase === 'core' ? `Step ${step} of ${CORE_STEPS}` : `Step ${step} of ${TOTAL_STEPS}`}
              </span>
              <p className="text-xs text-gray-500 mt-0.5">
                {step === 1 && "Who is this for?"}
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
              {[...Array(onboardingPhase === 'core' ? CORE_STEPS : TOTAL_STEPS)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 h-full rounded-full transition-all ${
                    i < step ? 'bg-white' : 'bg-transparent'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Core onboarding indicator */}
          {onboardingPhase === 'core' && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              ⚡ Quick setup - just the essentials
            </p>
          )}
        </div>

        {/* Step Content */}
        <div className="min-h-[450px]">
          
          {/* Step 1: User Type */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <Zap className="w-16 h-16 text-[#3B4A6B] mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Let's Get Started</h2>
                <p className="text-gray-600">This will only take 2 minutes</p>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about yourself</h2>
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

          {/* Step 3: Role Selection */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Select your roles</h2>
                <p className="text-gray-600">Choose all that apply - you can switch between them anytime</p>
              </div>

              {/* Tooltip */}
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Why we're asking:</p>
                    <p className="text-sm text-blue-800 mt-1">
                      We'll tailor your motivational messages and task categories to match your life stages. 
                      You can switch between contexts anytime!
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'student', icon: GraduationCap, label: 'Student', desc: 'School, university, or learning' },
                  { id: 'professional', icon: Briefcase, label: 'Professional', desc: 'Work, career, or business' },
                  { id: 'parent', icon: Baby, label: 'Parent', desc: 'Raising children or caregiving' }
                ].map(role => (
                  <div
                    key={role.id}
                    onClick={() => toggleRole(role.id)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.roles.includes(role.id)
                        ? 'border-[#3B4A6B] bg-[#3B4A6B]/10'
                        : 'border-gray-200 hover:border-[#3B4A6B]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Checkbox 
                        checked={formData.roles.includes(role.id)}
                        className="pointer-events-none"
                      />
                      <role.icon className="w-6 h-6 text-[#3B4A6B]" />
                      <div>
                        <h3 className="font-semibold">{role.label}</h3>
                        <p className="text-sm text-gray-600">{role.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Primary Role */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose your primary focus</h2>
                <p className="text-gray-600">Which role is your main focus right now?</p>
              </div>

              <RadioGroup value={formData.primaryRole} onValueChange={(value) => updateFormData('primaryRole', value)}>
                <div className="space-y-3">
                  {formData.roles.map(role => (
                    <div
                      key={role}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        formData.primaryRole === role
                          ? 'border-[#3B4A6B] bg-[#3B4A6B]/10'
                          : 'border-gray-200 hover:border-[#3B4A6B]'
                      }`}
                      onClick={() => updateFormData('primaryRole', role)}
                    >
                      <div className="flex items-center gap-4">
                        <RadioGroupItem value={role} id={role} />
                        <Label htmlFor={role} className="flex-1 cursor-pointer capitalize">
                          {role}
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              {/* Core onboarding complete message */}
              {onboardingPhase === 'core' && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg mt-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Almost done!</p>
                      <p className="text-sm text-green-800 mt-1">
                        You can start using Get It Done! right away, or continue with a few more questions 
                        to personalize your experience even further.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Progressive onboarding steps 5-12 would go here */}
          {/* For now, we'll complete core onboarding at step 4 */}

        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <div className="flex gap-2">
            {step > 1 && (
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            
            {onboardingPhase === 'core' && step > 1 && (
              <Button
                onClick={saveProgress}
                variant="outline"
                className="flex items-center gap-2 text-gray-600"
              >
                <Save className="w-4 h-4" />
                Save & Continue Later
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {onboardingPhase === 'progressive' && (
              <Button
                onClick={handleSkip}
                variant="ghost"
                className="text-gray-600"
              >
                Skip for now
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-[#3B4A6B] hover:bg-[#2A3650] flex items-center gap-2"
            >
              {step === CORE_STEPS && onboardingPhase === 'core' ? 'Start Using Get It Done!' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

