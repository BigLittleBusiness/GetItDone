import { useState, useEffect } from 'react'
import { X, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ContextualTooltip({ id, title, content, position = 'bottom', onDismiss }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if this tooltip has been dismissed before
    const dismissed = localStorage.getItem(`tooltip_dismissed_${id}`)
    if (!dismissed) {
      // Show tooltip after a brief delay
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [id])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem(`tooltip_dismissed_${id}`, 'true')
    if (onDismiss) onDismiss()
  }

  const handleGotIt = () => {
    handleDismiss()
  }

  if (!isVisible) return null

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2'
  }

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-indigo-600',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-indigo-600',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-indigo-600',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-indigo-600'
  }

  return (
    <div className={`absolute ${positionClasses[position]} z-50 animate-fadeIn`}>
      <div className="relative bg-indigo-600 text-white rounded-lg shadow-xl p-4 max-w-sm">
        {/* Arrow */}
        <div className={`absolute w-0 h-0 border-8 ${arrowClasses[position]}`} />

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 pr-4">
            <h4 className="font-semibold text-sm mb-1">{title}</h4>
            <p className="text-sm text-white/90 leading-relaxed">{content}</p>
          </div>
        </div>

        {/* Got it button */}
        <div className="flex justify-end">
          <Button
            onClick={handleGotIt}
            size="sm"
            className="bg-white text-indigo-600 hover:bg-white/90"
          >
            Got it!
          </Button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

