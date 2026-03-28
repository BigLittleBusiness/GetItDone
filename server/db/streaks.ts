/**
 * Streak DB helpers — used by the daily streak-reminder job.
 */
import { eq } from "drizzle-orm";
import { users } from "../../drizzle/schema";
import { getDb } from "./connection";

/**
 * Returns users who have a streak > 0 but have NOT completed any task today.
 * Optionally filtered to a specific reminder time slot (HH:MM).
 */
export async function getUsersAtRiskOfLosingStreak(reminderTimeSlot?: string) {
  const db = await getDb();
  if (!db) return [];
  const today = new Date().toISOString().split("T")[0];
  const result = await db.select().from(users).where(eq(users.onboardingComplete, true));
  return result.filter(
    u =>
      (u.currentStreak ?? 0) > 0 &&
      u.lastActiveDate !== today &&
      (reminderTimeSlot == null ||
        (u as typeof u & { reminderTime?: string }).reminderTime === reminderTimeSlot)
  );
}
