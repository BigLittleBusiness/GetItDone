import {
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // Onboarding
  onboardingComplete: boolean("onboardingComplete").default(false).notNull(),
  // Active role context: which hat is the user wearing right now?
  activeRole: mysqlEnum("activeRole", ["student", "parent", "professional"]).default("professional").notNull(),
  // Personality / motivation mode
  personalityMode: mysqlEnum("personalityMode", ["cheeky", "positive", "literal"]).default("positive").notNull(),
  // Gamification
  xp: int("xp").default(0).notNull(),
  level: int("level").default(1).notNull(),
  currentStreak: int("currentStreak").default(0).notNull(),
  longestStreak: int("longestStreak").default(0).notNull(),
  lastActiveDate: varchar("lastActiveDate", { length: 10 }), // YYYY-MM-DD
  // Reading Theme: accessibility background colour preference
  readingTheme: mysqlEnum("readingTheme", ["default", "cream", "sage", "sky", "dusk", "sand"]).default("default").notNull(),
  // Text Size: accessibility font-size preference
  textSize: mysqlEnum("textSize", ["small", "medium", "large"]).default("medium").notNull(),
  // Streak reminder: user's preferred local time as HH:MM (24h), e.g. "14:00"
  reminderTime: varchar("reminderTime", { length: 5 }).default("14:00").notNull(),
  // IANA timezone string, e.g. "Australia/Sydney", auto-detected from browser
  timezone: varchar("timezone", { length: 64 }).default("UTC").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Tasks ────────────────────────────────────────────────────────────────────
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: text("title").notNull(),
  notes: text("notes"),
  // Which role context does this task belong to?
  roleContext: mysqlEnum("roleContext", ["student", "parent", "professional", "all"]).default("all").notNull(),
  // Status
  status: mysqlEnum("status", ["todo", "in_progress", "done", "archived"]).default("todo").notNull(),
  // Priority / energy level
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  energyRequired: mysqlEnum("energyRequired", ["low", "medium", "high"]).default("medium").notNull(),
  // Scheduling
  dueDate: varchar("dueDate", { length: 10 }), // YYYY-MM-DD
  dueTime: varchar("dueTime", { length: 5 }),  // HH:MM
  // Breakdown: sub-steps stored as JSON array of {id, text, done}
  steps: json("steps").$type<{ id: string; text: string; done: boolean }[]>(),
  // Recurrence
  // recurrenceType: null = one-off, 'daily' | 'weekly' | 'monthly' | 'days_of_week' | 'after_completion'
  recurrenceType: mysqlEnum("recurrenceType", ["daily", "weekly", "monthly", "days_of_week", "after_completion"]),
  // For days_of_week: comma-separated day numbers 0=Sun..6=Sat, e.g. "1,3,5"
  recurrenceDays: varchar("recurrenceDays", { length: 13 }),
  // ID of the parent recurring task template (null on the template itself)
  parentTaskId: int("parentTaskId"),
  // Gamification
  xpReward: int("xpReward").default(10).notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

// ─── Achievements / Badges ────────────────────────────────────────────────────
export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // Slug identifies the achievement type, e.g. "first_task", "streak_7", "level_5"
  slug: varchar("slug", { length: 64 }).notNull(),
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;

// ─── Survey Responses (kept from landing site) ────────────────────────────────
export const surveyResponses = mysqlTable("survey_responses", {
  id: int("id").autoincrement().primaryKey(),
  roleValidation: varchar("roleValidation", { length: 64 }),
  painPoint: varchar("painPoint", { length: 64 }),
  featureFit: varchar("featureFit", { length: 64 }),
  email: varchar("email", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SurveyResponse = typeof surveyResponses.$inferSelect;
export type InsertSurveyResponse = typeof surveyResponses.$inferInsert;

// ─── App Settings (admin-managed key/value store) ─────────────────────────────
// Stores singleton configuration values such as Resend credentials.
// Each row is a unique key; values are stored as text (encrypted at rest by the DB).
export const appSettings = mysqlTable("app_settings", {
  key: varchar("key", { length: 128 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AppSetting = typeof appSettings.$inferSelect;