/**
 * Due-date DB helpers — used by the daily due-date reminder job.
 */
import { and, eq } from "drizzle-orm";
import { tasks, users } from "../../drizzle/schema";
import { getDb } from "./connection";

/**
 * Returns all users who have tasks due today (in their local timezone)
 * that are not yet completed, along with those tasks.
 */
export async function getUsersWithTasksDueToday() {
  const db = await getDb();
  if (!db) return [];

  const allUsers = await db.select().from(users).where(eq(users.onboardingComplete, true));

  const results: Array<{
    user: typeof allUsers[0];
    dueTasks: { id: number; title: string; dueDate: string }[];
  }> = [];

  for (const user of allUsers) {
    const userTimezone = (user as typeof user & { timezone?: string }).timezone ?? "UTC";
    const todayLocal = new Intl.DateTimeFormat("en-CA", {
      timeZone: userTimezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    const userTasks = await db.select().from(tasks).where(and(eq(tasks.userId, user.id)));
    const dueTasks = userTasks.filter(
      t => t.dueDate === todayLocal && t.status !== "done" && t.status !== "archived"
    );

    if (dueTasks.length > 0) {
      results.push({
        user,
        dueTasks: dueTasks.map(t => ({ id: t.id, title: t.title, dueDate: t.dueDate ?? todayLocal })),
      });
    }
  }

  return results;
}
