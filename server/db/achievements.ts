/**
 * Achievement DB helpers — unlock and list.
 */
import { and, desc, eq } from "drizzle-orm";
import { achievements } from "../../drizzle/schema";
import { getDb } from "./connection";

export async function getAchievementsForUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(achievements)
    .where(eq(achievements.userId, userId))
    .orderBy(desc(achievements.unlockedAt));
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
