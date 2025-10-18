import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Heart, Sparkles } from 'lucide-react'

export default function WelcomeScreen({ onContinue }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img 
            src="/logo_official_primary.png" 
            alt="Get It Done!" 
            className="h-24 w-auto"
          />
        </div>

        {/* Welcome Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Get It Done!
          </h1>
          <div className="flex items-center justify-center gap-2 text-lg text-gray-600">
            <Heart className="w-5 h-5 text-rose-500" />
            <span>Built for real people with real lives</span>
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </div>
        </div>

        {/* Founder Message */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              BL
            </div>
            <div>
              <p className="text-gray-800 leading-relaxed">
                <span className="font-semibold text-indigo-900">Hi, I'm the founder of Get It Done!</span>
                <br /><br />
                I built this app because I struggled with motivation too. Whether you're a student cramming for exams, 
                a professional juggling clients, or a parent trying to find time for yourself—this app is for you.
                <br /><br />
                <span className="font-semibold">Let's get you set up in just 2 minutes.</span> We'll ask a few quick questions 
                to personalize your experience, and you can always customize more later in Settings.
              </p>
            </div>
          </div>
        </div>

        {/* What to Expect */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">What to expect:</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-indigo-600 font-semibold text-sm">1</span>
              </div>
              <p className="text-gray-700">
                <span className="font-medium">Quick setup</span> - Just 4 essential questions to get started
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-indigo-600 font-semibold text-sm">2</span>
              </div>
              <p className="text-gray-700">
                <span className="font-medium">Personalized experience</span> - Messages and tasks tailored to your life
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-indigo-600 font-semibold text-sm">3</span>
              </div>
              <p className="text-gray-700">
                <span className="font-medium">Add your first task</span> - Start getting things done immediately
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Let's Get Started
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>

        {/* Trust Indicators */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>✓ No credit card required • ✓ Free for personal use • ✓ Privacy-focused</p>
        </div>
      </div>
    </div>
  )
}

