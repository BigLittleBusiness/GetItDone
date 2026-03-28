/**
 * Gamification constants and pure helper functions.
 * Kept in server/shared/ so they can be imported by any router or utility
 * without creating circular dependencies.
 */

export const ACHIEVEMENT_CATALOGUE: Record<
  string,
  { title: string; description: string; icon: string; xpBonus: number }
> = {
  first_task:          { title: "First Step!",          description: "Completed your very first task.",   icon: "🎉", xpBonus: 50  },
  streak_3:            { title: "3-Day Streak",          description: "Showed up 3 days in a row.",        icon: "🔥", xpBonus: 30  },
  streak_7:            { title: "Week Warrior",          description: "7 days of showing up.",             icon: "⚡", xpBonus: 75  },
  streak_30:           { title: "Month Master",          description: "30 consecutive days.",              icon: "🏆", xpBonus: 200 },
  tasks_10:            { title: "Getting Momentum",      description: "Completed 10 tasks total.",         icon: "💪", xpBonus: 40  },
  tasks_50:            { title: "Productivity Machine",  description: "50 tasks completed.",               icon: "🚀", xpBonus: 100 },
  level_5:             { title: "Level 5 Unlocked",      description: "Reached level 5.",                  icon: "⭐", xpBonus: 60  },
  level_10:            { title: "Double Digits",         description: "Reached level 10.",                 icon: "🌟", xpBonus: 120 },
  role_switcher:       { title: "Context Switcher",      description: "Used all 3 role modes.",            icon: "🎭", xpBonus: 25  },
  onboarding_complete: { title: "Ready to Roll",         description: "Completed onboarding.",             icon: "✅", xpBonus: 20  },
};

/** XP required to advance from level to level + 1. */
export function xpForLevel(level: number): number {
  return level * 100;
}

/** Derives the current level from a cumulative XP total. */
export function computeLevel(xp: number): number {
  let level = 1;
  let threshold = 0;
  while (xp >= threshold + xpForLevel(level)) {
    threshold += xpForLevel(level);
    level++;
  }
  return level;
}
