import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Send, Mic, MicOff, CheckCircle, Calendar, Tag } from 'lucide-react'

export default function TaskEntry({ user }) {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'app',
      text: getGreeting(user),
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [currentTask, setCurrentTask] = useState(null)
  const [conversationState, setConversationState] = useState('initial') // initial, awaiting_time, awaiting_category, complete
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInputText(transcript)
        setIsListening(false)
      }
      
      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }
      
      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in your browser. Please use Chrome or Edge.')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const handleSend = () => {
    if (!inputText.trim()) return

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: inputText,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    // Process the input based on conversation state
    processUserInput(inputText)
    setInputText('')
  }

  const processUserInput = (input) => {
    setTimeout(() => {
      let appResponse = ''
      
      switch (conversationState) {
        case 'initial':
          // User is describing a task
          setCurrentTask({ name: input })
          appResponse = "Got it! When do you want to tackle this?"
          setConversationState('awaiting_time')
          break
          
        case 'awaiting_time':
          // User is specifying time
          const taskWithTime = { ...currentTask, time: input }
          setCurrentTask(taskWithTime)
          
          // Auto-suggest category
          const suggestedCategory = suggestCategory(taskWithTime.name, user)
          appResponse = `Perfect. I'm adding this to '${suggestedCategory}'. Sound good?`
          setCurrentTask({ ...taskWithTime, category: suggestedCategory })
          setConversationState('awaiting_category')
          break
          
        case 'awaiting_category':
          // User confirms or changes category
          if (input.toLowerCase().includes('yes') || input.toLowerCase().includes('good') || input.toLowerCase().includes('ok')) {
            // Confirm and save task
            saveTask(currentTask)
            appResponse = getTaskConfirmation(user, currentTask)
            setConversationState('complete')
          } else {
            // User wants to change category
            const newCategory = extractCategory(input)
            setCurrentTask({ ...currentTask, category: newCategory })
            saveTask({ ...currentTask, category: newCategory })
            appResponse = getTaskConfirmation(user, { ...currentTask, category: newCategory })
            setConversationState('complete')
          }
          break
          
        case 'complete':
          // Start new task entry
          setCurrentTask({ name: input })
          appResponse = "Got it! When do you want to tackle this?"
          setConversationState('awaiting_time')
          break
      }
      
      addAppMessage(appResponse)
    }, 500)
  }

  const addAppMessage = (text) => {
    const appMessage = {
      id: messages.length + 1,
      sender: 'app',
      text: text,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, appMessage])
  }

  const saveTask = (task) => {
    // In real app, this would save to database and sync with calendar
    const tasks = JSON.parse(localStorage.getItem(`tasks_${user.id}`) || '[]')
    const newTask = {
      id: Date.now().toString(),
      ...task,
      userId: user.id,
      completed: false,
      createdAt: new Date().toISOString()
    }
    tasks.push(newTask)
    localStorage.setItem(`tasks_${user.id}`, JSON.stringify(tasks))
    console.log('Task saved:', newTask)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold text-gray-900">Add Task</h1>
          <Badge variant="outline" className="ml-auto">
            {user.motivationStyle === 'cheeky' ? '😏 Cheeky Mode' : 
             user.isAutistic ? '🧠 Clear Mode' : '✨ Chat Mode'}
          </Badge>
        </div>
      </header>

      {/* Chat Container */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="shadow-xl">
          <CardContent className="p-0">
            {/* Messages Area */}
            <div className="h-[500px] overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} user={user} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t p-4 bg-gray-50">
              <div className="flex gap-2">
                <Button
                  variant={isListening ? "destructive" : "outline"}
                  size="icon"
                  onClick={toggleVoiceInput}
                  className="flex-shrink-0"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isListening ? "Listening..." : "Type your task or speak..."}
                  className="flex-1"
                  disabled={isListening}
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              {isListening && (
                <div className="mt-2 text-center">
                  <span className="text-sm text-red-600 animate-pulse">● Recording...</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>
            {user.isAutistic 
              ? "Type your task and when you want to complete it. I will help you organize it."
              : user.motivationStyle === 'cheeky'
              ? "Tell me what you're actually going to do (for once). I'll help you not forget it."
              : "Tell me what's on your plate today. I'll help you get it done!"}
          </p>
        </div>
      </div>
    </div>
  )
}

function ChatMessage({ message, user }) {
  const isApp = message.sender === 'app'
  
  return (
    <div className={`flex ${isApp ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[80%] rounded-lg p-4 ${
        isApp 
          ? 'bg-indigo-100 text-gray-900' 
          : 'bg-indigo-600 text-white'
      }`}>
        <p className="text-sm">{message.text}</p>
        <span className={`text-xs mt-1 block ${
          isApp ? 'text-gray-500' : 'text-indigo-200'
        }`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}

// Helper functions
function getGreeting(user) {
  if (user.isAutistic) {
    return "What task do you want to add?"
  }
  
  if (user.motivationStyle === 'cheeky') {
    return "What's on your plate today? (And don't say 'nothing' because we both know that's a lie.)"
  }
  
  const greetings = [
    "What's on your plate today?",
    "Ready to add a task? I'm here to help!",
    "Let's get organized! What do you need to do?",
    "What task are we tackling today?"
  ]
  
  return greetings[Math.floor(Math.random() * greetings.length)]
}

function suggestCategory(taskName, user) {
  const taskLower = taskName.toLowerCase()
  
  // Work-related keywords
  if (taskLower.includes('call') || taskLower.includes('client') || taskLower.includes('meeting') || 
      taskLower.includes('email') || taskLower.includes('prospect') || taskLower.includes('sale')) {
    return 'Work'
  }
  
  // Health-related keywords
  if (taskLower.includes('gym') || taskLower.includes('workout') || taskLower.includes('exercise') || 
      taskLower.includes('doctor') || taskLower.includes('health')) {
    return 'Health'
  }
  
  // Personal keywords
  if (taskLower.includes('home') || taskLower.includes('family') || taskLower.includes('personal') || 
      taskLower.includes('buy') || taskLower.includes('shop')) {
    return 'Personal'
  }
  
  // Default based on user's work context
  if (user.workContext && user.workContext !== 'Other') {
    return 'Work'
  }
  
  return 'General'
}

function extractCategory(input) {
  const inputLower = input.toLowerCase()
  
  if (inputLower.includes('work')) return 'Work'
  if (inputLower.includes('personal')) return 'Personal'
  if (inputLower.includes('health')) return 'Health'
  
  return 'General'
}

function getTaskConfirmation(user, task) {
  if (user.isAutistic) {
    return `Task added: "${task.name}" scheduled for ${task.time}. Category: ${task.category}. You will receive a reminder.`
  }
  
  if (user.motivationStyle === 'cheeky') {
    const confirmations = [
      `Boom! Task added. Now let's see if you actually do it. 😏`,
      `Added to your list. Your future self better thank you for this.`,
      `Task locked in. No excuses now!`,
      `Got it! I'll remind you so you can't pretend you forgot.`
    ]
    return confirmations[Math.floor(Math.random() * confirmations.length)]
  }
  
  const confirmations = [
    `Perfect! I've added "${task.name}" to your schedule. You've got this! ✨`,
    `Task added successfully! I'll remind you when it's time. You're going to crush it!`,
    `Great! "${task.name}" is now on your list. Let's make it happen!`,
    `All set! I've scheduled "${task.name}" for ${task.time}. You're building momentum!`
  ]
  
  return confirmations[Math.floor(Math.random() * confirmations.length)]
}

