/**
 * Task DB helpers — CRUD operations.
 */
import { and, desc, eq } from "drizzle-orm";
import { tasks, type InsertTask } from "../../drizzle/schema";
import { getDb } from "./connection";

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
  return allTasks.filter(t => t.roleContext === roleContext || t.roleContext === "all");
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
