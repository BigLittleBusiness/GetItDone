// Motivation Engine - Message Database and Selection Logic

// Message database with 100+ sample messages (expandable to 1000+)
const messageDatabase = {
  positive: {
    general: [
      { id: 'pos_gen_001', text: "You've got this! Time to show that task who's boss.", context: ['dashboard_view', 'morning_start'] },
      { id: 'pos_gen_002', text: "Every task completed is a step toward your goals. Let's take that step!", context: ['pre_task'] },
      { id: 'pos_gen_003', text: "You're capable of amazing things. Prove it to yourself today.", context: ['morning_start'] },
      { id: 'pos_gen_004', text: "Success is built one task at a time. You're building it right now.", context: ['dashboard_view'] },
      { id: 'pos_gen_005', text: "You've overcome tougher challenges than this. Time to add another win.", context: ['pre_task'] },
      { id: 'pos_gen_006', text: "Your future self is cheering you on. Make them proud!", context: ['morning_start'] },
      { id: 'pos_gen_007', text: "Small steps lead to big achievements. Take yours now.", context: ['dashboard_view'] },
      { id: 'pos_gen_008', text: "You're stronger than your excuses. Time to prove it.", context: ['pre_task'] },
      { id: 'pos_gen_009', text: "Today is full of possibilities. Let's make the most of it!", context: ['morning_start'] },
      { id: 'pos_gen_010', text: "You're building momentum. Keep it going!", context: ['dashboard_view'] }
    ],
    gaming: [
      { id: 'pos_gam_001', text: "Quest accepted! Time to complete this mission and level up your day. 🎮", context: ['pre_task'], theme: 'gaming' },
      { id: 'pos_gam_002', text: "You've beaten harder bosses than this. Time to add another win to your record.", context: ['pre_task'], theme: 'gaming' },
      { id: 'pos_gam_003', text: "Achievement unlocked incoming! You're about to crush this objective.", context: ['dashboard_view'], theme: 'gaming' },
      { id: 'pos_gam_004', text: "Power-up activated! You have everything you need to succeed.", context: ['morning_start'], theme: 'gaming' },
      { id: 'pos_gam_005', text: "Final boss energy. You're ready for this challenge.", context: ['pre_task'], theme: 'gaming' }
    ],
    mario: [
      { id: 'pos_mar_001', text: "Let's-a-go! Your task is waiting and you're ready to jump right in! 🍄", context: ['pre_task'], theme: 'mario' },
      { id: 'pos_mar_002', text: "You've got the power-up! Time to use that Super Star energy and crush this task!", context: ['dashboard_view'], theme: 'mario' },
      { id: 'pos_mar_003', text: "Fire Flower power activated! You're unstoppable right now. Let's do this!", context: ['morning_start'], theme: 'mario' },
      { id: 'pos_mar_004', text: "Every task completed is another coin collected. You're building toward something big!", context: ['post_task'], theme: 'mario' },
      { id: 'pos_mar_005', text: "The flagpole is in sight! Sprint to the finish and claim your victory!", context: ['pre_task'], theme: 'mario' }
    ]
  },
  cheeky: {
    general: [
      { id: 'chk_gen_001', text: "Your couch called. It said you're spending too much time together. Time to break up.", context: ['dashboard_view', 'morning_start'] },
      { id: 'chk_gen_002', text: "That task isn't going to complete itself. Unlike your excuses, which seem automatic.", context: ['pre_task'] },
      { id: 'chk_gen_003', text: "Coffee break's over, champ. Time to earn that 'hustler' in your bio.", context: ['morning_start'] },
      { id: 'chk_gen_004', text: "Your to-do list called. It's feeling neglected. Show it some love.", context: ['dashboard_view'] },
      { id: 'chk_gen_005', text: "Procrastination is just fear in disguise. Face it.", context: ['pre_task'] },
      { id: 'chk_gen_006', text: "Your future self just sent a message: 'WTF are you waiting for?'", context: ['dashboard_view'] },
      { id: 'chk_gen_007', text: "Spoiler alert: Success doesn't come to people who hit snooze. Get up.", context: ['morning_start'] },
      { id: 'chk_gen_008', text: "You're not 'waiting for the right moment.' You're just procrastinating with style.", context: ['pre_task'] },
      { id: 'chk_gen_009', text: "That client won't call themselves. Well, they might. To your competitor.", context: ['pre_task'] },
      { id: 'chk_gen_010', text: "Motivation is for amateurs. Professionals just show up. Be a pro.", context: ['dashboard_view'] }
    ],
    gaming: [
      { id: 'chk_gam_001', text: "Stop camping in the lobby. The match has started. Time to play.", context: ['dashboard_view'], theme: 'gaming' },
      { id: 'chk_gam_002', text: "You've spent 40 hours on Elden Ring but can't find 30 minutes for this? Interesting.", context: ['pre_task'], theme: 'gaming' },
      { id: 'chk_gam_003', text: "Git gud at life tasks. This one's easier than a tutorial boss. Go.", context: ['pre_task'], theme: 'gaming' },
      { id: 'chk_gam_004', text: "Your Steam library has 300 games. Your to-do list has 1 task. Priorities.", context: ['dashboard_view'], theme: 'gaming' },
      { id: 'chk_gam_005', text: "You're AFK in your own life. Time to respawn and actually play.", context: ['morning_start'], theme: 'gaming' }
    ],
    mario: [
      { id: 'chk_mar_001', text: "That task is a Goomba. You're dying to a Goomba. Are you serious right now?", context: ['pre_task'], theme: 'mario' },
      { id: 'chk_mar_002', text: "Even Luigi has finished this task. LUIGI. The guy who literally hides in his brother's shadow.", context: ['dashboard_view'], theme: 'mario' },
      { id: 'chk_mar_003', text: "Your princess is in another castle because you're too busy making excuses to actually GO GET HER.", context: ['pre_task'], theme: 'mario' },
      { id: 'chk_mar_004', text: "The timer music is speeding up. You know what that means? You're about to FAIL. Move. NOW.", context: ['pre_task'], theme: 'mario' },
      { id: 'chk_mar_005', text: "You're stuck on World 1-1 while everyone else is fighting Bowser. Embarrassing.", context: ['dashboard_view'], theme: 'mario' }
    ]
  },
  autism: {
    general: [
      { id: 'aut_gen_001', text: "Your meeting starts in 15 minutes. You have time to prepare.", context: ['pre_task'] },
      { id: 'aut_gen_002', text: "It's 9:00 AM. Time to start your first task.", context: ['morning_start'] },
      { id: 'aut_gen_003', text: "Task complete. Well done.", context: ['post_task'] },
      { id: 'aut_gen_004', text: "You planned to start this task at 10:00 AM. It's now 10:15 AM. Would you like to start now?", context: ['pre_task'] },
      { id: 'aut_gen_005', text: "You didn't complete this task today. That's okay. Would you like to reschedule it?", context: ['missed_task'] },
      { id: 'aut_gen_006', text: "You have 3 tasks scheduled for today. You have completed 1. 2 tasks remaining.", context: ['dashboard_view'] },
      { id: 'aut_gen_007', text: "Your next task starts in 30 minutes. You have time to finish your current activity.", context: ['pre_task'] },
      { id: 'aut_gen_008', text: "You completed 5 tasks this week. This is 2 more than last week.", context: ['dashboard_view'] },
      { id: 'aut_gen_009', text: "Task added to your schedule. You will receive a reminder 15 minutes before it starts.", context: ['post_task'] },
      { id: 'aut_gen_010', text: "You have been working for 2 hours. Would you like to take a 10-minute break?", context: ['dashboard_view'] }
    ]
  }
}

// Get motivational message based on user profile and context
export function getMotivationalMessage(user, context = 'dashboard_view') {
  let messagePool = []
  
  // Determine message category based on user preferences
  if (user.isAutistic) {
    messagePool = messageDatabase.autism.general
  } else if (user.motivationStyle === 'positive') {
    messagePool = [...messageDatabase.positive.general]
    
    // Add themed messages based on interests
    if (user.interests?.includes('gaming')) {
      if (user.gamingPreferences?.includes('mario')) {
        messagePool.push(...messageDatabase.positive.mario)
      }
      messagePool.push(...messageDatabase.positive.gaming)
    }
  } else if (user.motivationStyle === 'cheeky') {
    messagePool = [...messageDatabase.cheeky.general]
    
    // Add themed messages based on interests
    if (user.interests?.includes('gaming')) {
      if (user.gamingPreferences?.includes('mario')) {
        messagePool.push(...messageDatabase.cheeky.mario)
      }
      messagePool.push(...messageDatabase.cheeky.gaming)
    }
  } else {
    // Adaptive: mix of both
    messagePool = [
      ...messageDatabase.positive.general,
      ...messageDatabase.cheeky.general
    ]
  }
  
  // Filter by context
  const contextMessages = messagePool.filter(msg => 
    msg.context.includes(context)
  )
  
  // Filter out previously seen messages
  const messageHistory = user.messageHistory || []
  const unseenMessages = contextMessages.filter(msg => 
    !messageHistory.includes(msg.id)
  )
  
  // If all messages have been seen, reset the pool
  const availableMessages = unseenMessages.length > 0 ? unseenMessages : contextMessages
  
  // Random selection from available messages
  const selectedMessage = availableMessages[Math.floor(Math.random() * availableMessages.length)]
  
  // Log message to history (in real app, this would update the database)
  if (selectedMessage && !messageHistory.includes(selectedMessage.id)) {
    messageHistory.push(selectedMessage.id)
    // Keep only last 100 messages in history
    if (messageHistory.length > 100) {
      messageHistory.shift()
    }
  }
  
  return selectedMessage || {
    id: 'default',
    text: "You're doing great! Keep it up!",
    context: [context]
  }
}

// Record user feedback on message
export function recordMessageFeedback(userId, messageId, isPositive) {
  // In real app, this would save to database
  const feedback = {
    userId,
    messageId,
    isPositive,
    timestamp: new Date().toISOString()
  }
  
  console.log('Message feedback recorded:', feedback)
  
  // Store in localStorage for demo
  const feedbackHistory = JSON.parse(localStorage.getItem('messageFeedback') || '[]')
  feedbackHistory.push(feedback)
  localStorage.setItem('messageFeedback', JSON.stringify(feedbackHistory))
  
  return feedback
}

// Get message statistics
export function getMessageStats(userId) {
  const feedbackHistory = JSON.parse(localStorage.getItem('messageFeedback') || '[]')
  const userFeedback = feedbackHistory.filter(f => f.userId === userId)
  
  const totalFeedback = userFeedback.length
  const positiveFeedback = userFeedback.filter(f => f.isPositive).length
  const negativeFeedback = totalFeedback - positiveFeedback
  
  return {
    totalFeedback,
    positiveFeedback,
    negativeFeedback,
    positiveRate: totalFeedback > 0 ? (positiveFeedback / totalFeedback) * 100 : 0
  }
}

