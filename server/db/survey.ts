/**
 * Survey DB helpers — create and list waitlist survey responses.
 */
import { desc } from "drizzle-orm";
import { surveyResponses, type InsertSurveyResponse } from "../../drizzle/schema";
import { getDb } from "./connection";

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
