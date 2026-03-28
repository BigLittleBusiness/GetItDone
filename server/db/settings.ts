/**
 * App settings DB helpers — key/value store backed by the app_settings table.
 * Used for persisted configuration such as Resend credentials, logo URLs,
 * and rate-limiter state.
 */
import { eq } from "drizzle-orm";
import { appSettings } from "../../drizzle/schema";
import { getDb } from "./connection";

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
