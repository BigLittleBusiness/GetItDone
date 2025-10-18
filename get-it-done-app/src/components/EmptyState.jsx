import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, Plus, Sparkles, ArrowRight } from 'lucide-react'

export default function EmptyState({ userRole, onTaskComplete, onAddTask }) {
  const [completedSamples, setCompletedSamples] = useState([])

  // Sample tasks based on user role
  const sampleTasks = {
    student: [
      { id: 'sample-1', title: 'Review lecture notes', category: 'Study', time: '30 min' },
      { id: 'sample-2', title: 'Start assignment draft', category: 'Homework', time: '1 hour' },
      { id: 'sample-3', title: 'Take a study break', category: 'Self-care', time: '15 min' }
    ],
    professional: [
      { id: 'sample-1', title: 'Follow up with client', category: 'Work', time: '15 min' },
      { id: 'sample-2', title: 'Update project status', category: 'Work', time: '20 min' },
      { id: 'sample-3', title: 'Take a lunch break', category: 'Self-care', time: '30 min' }
    ],
    parent: [
      { id: 'sample-1', title: 'Pack school lunches', category: 'Family', time: '15 min' },
      { id: 'sample-2', title: 'Schedule pediatrician appointment', category: 'Family', time: '10 min' },
      { id: 'sample-3', title: 'Take 10 minutes for yourself', category: 'Self-care', time: '10 min' }
    ]
  }

  const tasks = sampleTasks[userRole] || sampleTasks.professional

  const handleSampleComplete = (taskId) => {
    setCompletedSamples([...completedSamples, taskId])
    onTaskComplete(taskId)
    
    // If all samples completed, show celebration
    if (completedSamples.length === tasks.length - 1) {
      setTimeout(() => {
        // Trigger celebration or move to real tasks
      }, 500)
    }
  }

  const allSamplesCompleted = completedSamples.length === tasks.length

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full mb-4">
          <Sparkles className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {allSamplesCompleted ? "You're a natural!" : "Let's get started"}
        </h2>
        <p className="text-lg text-gray-600">
          {allSamplesCompleted 
            ? "Now add your own tasks and start building your streak"
            : "Try completing these sample tasks to see how it works"
          }
        </p>
      </div>

      {/* Sample Tasks */}
      {!allSamplesCompleted && (
        <div className="space-y-3 mb-8">
          {tasks.map((task, index) => {
            const isCompleted = completedSamples.includes(task.id)
            const isNext = completedSamples.length === index
            
            return (
              <div
                key={task.id}
                className={`border-2 rounded-xl p-4 transition-all ${
                  isCompleted 
                    ? 'bg-green-50 border-green-300 opacity-75' 
                    : isNext
                      ? 'bg-white border-indigo-400 shadow-lg'
                      : 'bg-gray-50 border-gray-200 opacity-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {isCompleted ? (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className={`w-6 h-6 border-2 rounded-full ${
                        isNext ? 'border-indigo-400' : 'border-gray-300'
                      }`} />
                    )}
                    
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
                      }`}>
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-600">{task.category}</span>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-600">{task.time}</span>
                      </div>
                    </div>
                  </div>

                  {!isCompleted && isNext && (
                    <Button
                      onClick={() => handleSampleComplete(task.id)}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Try completing this
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  )}

                  {isCompleted && (
                    <span className="text-green-600 font-semibold">Done! ✓</span>
                  )}
                </div>

                {/* Hint for first task */}
                {isNext && index === 0 && (
                  <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                    <p className="text-sm text-blue-900">
                      💡 <span className="font-medium">Tip:</span> Click the button to mark this sample task as complete
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Celebration for completing all samples */}
      {allSamplesCompleted && (
        <div className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-300 rounded-2xl p-8 mb-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Great job! You've got the hang of it!
          </h3>
          <p className="text-gray-700 mb-4">
            You completed all sample tasks. Now it's time to add your own real tasks and start building your productivity streak!
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span>You earned 30 points and started your streak!</span>
            <Sparkles className="w-4 h-4 text-yellow-500" />
          </div>
        </div>
      )}

      {/* Add Your First Real Task */}
      <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-indigo-400 transition-colors">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-4">
          <Plus className="w-6 h-6 text-indigo-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {allSamplesCompleted ? "Add your first real task" : "Or skip to adding your own task"}
        </h3>
        <p className="text-gray-600 mb-6">
          Use voice or text to add tasks. We'll help you stay motivated!
        </p>
        <Button
          onClick={onAddTask}
          className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-lg px-8 py-6"
        >
          <Plus className="mr-2 w-5 h-5" />
          Add Your First Task
        </Button>
      </div>

      {/* Help Text */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          💡 Tip: You can add tasks by voice, text, or even from your calendar
        </p>
      </div>
    </div>
  )
}

