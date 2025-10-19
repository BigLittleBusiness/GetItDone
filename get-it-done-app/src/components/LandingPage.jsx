import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, Zap, Users, Brain, Trophy, Share2, LogIn, X } from 'lucide-react'

export default function LandingPage({ onLogin }) {
  const navigate = useNavigate()
  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      const { user } = await authAPI.login(email, password)
      onLogin(user)
      navigate('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
      setError(error.response?.data?.error || 'Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50/30 to-slate-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-6">
            <img src="/logo.png" alt="Get It Done! Logo" className="w-24 h-24" />
            <h1 className="text-6xl font-bold text-gray-900 animate-fade-in">
              Get It Done!
            </h1>
          </div>
          <p className="text-2xl text-gray-600 mb-4">
            Motivation for Every Stage of Life
          </p>
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            Personalized motivation that adapts to your style. Never see the same message twice. 
            Integrate with your calendar. Complete more tasks. Share your wins.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 bg-[#3B4A6B] hover:bg-[#2D3A56] transition-all transform hover:scale-105"
              onClick={() => navigate('/onboarding')}
            >
              Get Started Free
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6 border-2 border-[#3B4A6B] text-[#3B4A6B] hover:bg-[#3B4A6B]/10 transition-all"
              onClick={() => setShowLogin(true)}
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </Button>
          </div>

          {/* Login Modal */}
          {showLogin && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
                <button
                  onClick={() => setShowLogin(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>

                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
                <p className="text-gray-600 mb-6">Sign in to continue your productivity journey</p>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    <p className="text-sm">{error}</p>
                  </div>
                )}
                
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="mt-1"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="mt-1"
                      required
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="flex-1 bg-[#3B4A6B] hover:bg-[#2D3A56]"
                    >
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => setShowLogin(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>

                <p className="text-center text-sm text-gray-600 mt-6">
                  Don't have an account?{' '}
                  <button
                    onClick={() => {
                      setShowLogin(false)
                      navigate('/onboarding')
                    }}
                    className="text-[#3B4A6B] font-semibold hover:underline"
                  >
                    Sign up free
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-6xl mx-auto">
          <FeatureCard 
            icon={<Zap className="w-8 h-8" />}
            title="Personalized Motivation"
            description="Choose your style: Positive & encouraging or cheeky & witty. Messages tailored to your interests from gaming to sports."
          />
          <FeatureCard 
            icon={<CheckCircle className="w-8 h-8" />}
            title="Never Repeat"
            description="1,000+ unique messages. Our smart algorithm ensures you never see the same motivation twice for 6+ months."
          />
          <FeatureCard 
            icon={<Brain className="w-8 h-8" />}
            title="Autism-Friendly"
            description="Literal, clear communication for neurodivergent users. No metaphors, no sarcasm—just helpful, direct motivation."
          />
          <FeatureCard 
            icon={<Users className="w-8 h-8" />}
            title="Team Productivity"
            description="B2B features with anonymized performance tracking. Boost your team's productivity with personalized motivation."
          />
          <FeatureCard 
            icon={<Trophy className="w-8 h-8" />}
            title="Gamification"
            description="Track streaks, earn achievements, and watch your progress grow. Three presentation styles to match your motivation type."
          />
          <FeatureCard 
            icon={<Share2 className="w-8 h-8" />}
            title="Share Your Wins"
            description="Celebrate success with shareable progress graphics. Motivational messages designed to be screenshot-worthy."
          />
        </div>

        {/* Pricing */}
        <div className="mt-24 text-center max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Pay What You Want</h2>
          <p className="text-gray-600 mb-8">
            We believe everyone deserves motivation. Use Get It Done! for free, 
            or support our mission with a donation.
          </p>
          <div className="flex gap-4 justify-center mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">$2</div>
              <div className="text-sm text-gray-500">per month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">$5</div>
              <div className="text-sm text-gray-500">per month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">$10</div>
              <div className="text-sm text-gray-500">per month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">Custom</div>
              <div className="text-sm text-gray-500">your choice</div>
            </div>
          </div>
          <Button 
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => navigate('/onboarding')}
          >
            Start Now - It's Free
          </Button>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
      <div className="text-indigo-600 mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

