import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  achievements,
  appSettings,
  surveyResponses,
  tasks,
  users,
  type InsertTask,
  type InsertUser,
  type InsertSurveyResponse,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ─────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];
  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };
  textFields.forEach(assignNullable);
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0] ?? undefined;
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result[0] ?? undefined;
}

export async function updateUserProfile(
  userId: number,
  data: Partial<Omit<InsertUser, "id" | "openId" | "createdAt">>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set(data).where(eq(users.id, userId));
}

// ─── Tasks ─────────────────────────────────────────────────────────────────────

export async function getTasksByRole(
  userId: number,
  roleContext: "student" | "parent" | "professional"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const allTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId))
    .orderBy(desc(tasks.createdAt));
  return allTasks.filter(
    (t) => t.roleContext === roleContext || t.roleContext === "all"
  );
}

export async function getAllTasksForUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.createdAt));
}

export async function createTask(data: InsertTask) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tasks).values(data);
  const insertId = (result as unknown as [{ insertId: number }])[0]?.insertId;
  if (!insertId) return null;
  const rows = await db.select().from(tasks).where(eq(tasks.id, insertId)).limit(1);
  return rows[0] ?? null;
}

export async function updateTask(
  taskId: number,
  userId: number,
  data: Partial<Omit<InsertTask, "id" | "userId" | "createdAt">>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tasks).set(data).where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
}

export async function deleteTask(taskId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(tasks).where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
}

// ─── Achievements ──────────────────────────────────────────────────────────────

export async function getAchievementsForUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(achievements).where(eq(achievements.userId, userId)).orderBy(desc(achievements.unlockedAt));
}

export async function unlockAchievement(userId: number, slug: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db
    .select()
    .from(achievements)
    .where(and(eq(achievements.userId, userId), eq(achievements.slug, slug)))
    .limit(1);
  if (existing.length > 0) return false;
  await db.insert(achievements).values({ userId, slug });
  return true;
}

// ─── Streak Helpers ───────────────────────────────────────────────────────────

/**
 * Returns users who have a streak > 0 but have NOT completed any task today.
 * Used by the daily streak-reminder job.
 */
export async function getUsersAtRiskOfLosingStreak(reminderTimeSlot?: string) {
  const db = await getDb();
  if (!db) return [];
  const today = new Date().toISOString().split("T")[0];
  // All users with an active streak whose last active date is NOT today
  const result = await db
    .select()
    .from(users)
    .where(and(eq(users.onboardingComplete, true)));
  return result.filter(
    (u) =>
      (u.currentStreak ?? 0) > 0 &&
      u.lastActiveDate !== today &&
      // If a slot is provided, only include users whose reminderTime matches
      (reminderTimeSlot == null || (u as typeof u & { reminderTime?: string }).reminderTime === reminderTimeSlot)
  );
}

// ─── Due-Date Helpers ────────────────────────────────────────────────────────

/**
 * Returns all users who have tasks due today (in their local timezone)
 * that are not yet completed, along with those tasks.
 * Used by the due-date reminder job.
 */
export async function getUsersWithTasksDueToday() {
  const db = await getDb();
  if (!db) return [];

  // Fetch all users who have completed onboarding
  const allUsers = await db
    .select()
    .from(users)
    .where(eq(users.onboardingComplete, true));

  const results: Array<{
    user: typeof allUsers[0];
    dueTasks: { id: number; title: string; dueDate: string }[];
  }> = [];

  for (const user of allUsers) {
    const userTimezone = (user as typeof user & { timezone?: string }).timezone ?? "UTC";
    // Get today's date in the user's local timezone
    const todayLocal = new Intl.DateTimeFormat("en-CA", {
      timeZone: userTimezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date()); // en-CA gives YYYY-MM-DD format

    const userTasks = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.userId, user.id)));

    const dueTasks = userTasks.filter(
      (t) =>
        t.dueDate === todayLocal &&
        t.status !== "done" &&
        t.status !== "archived"
    );

    if (dueTasks.length > 0) {
      results.push({
        user,
        dueTasks: dueTasks.map((t) => ({
          id: t.id,
          title: t.title,
          dueDate: t.dueDate ?? todayLocal,
        })),
      });
    }
  }

  return results;
}

// ─── Survey Responses ──────────────────────────────────────────────────────────

export async function createSurveyResponse(response: InsertSurveyResponse) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(surveyResponses).values(response);
}

export async function getAllSurveyResponses() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(surveyResponses).orderBy(desc(surveyResponses.createdAt));
}

// ─── App Settings ──────────────────────────────────────────────────────────────
export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(appSettings).where(eq(appSettings.key, key));
  return rows[0]?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .insert(appSettings)
    .values({ key, value })
    .onDuplicateKeyUpdate({ set: { value } });
}

export async function deleteSetting(key: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(appSettings).where(eq(appSettings.key, key));
}
