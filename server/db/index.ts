/**
 * Barrel re-export for all server/db domain modules.
 *
 * All existing imports of the form `from "./db"` or `from "../db"` resolve
 * here.  The module ID is identical to the server/db.ts shim so Vitest mocks
 * targeting `"../db"` intercept calls correctly.
 *
 * New code should import from this barrel (or from the specific sub-module
 * when only a subset of helpers is needed).
 */
export { getDb }                                                        from "./connection";
export { upsertUser, getUserByOpenId, getUserById, updateUserProfile }  from "./users";
export { getTasksByRole, getAllTasksForUser, createTask, updateTask, deleteTask } from "./tasks";
export { getAchievementsForUser, unlockAchievement }                    from "./achievements";
export { getUsersAtRiskOfLosingStreak }                                 from "./streaks";
export { getUsersWithTasksDueToday }                                    from "./dueDates";
export { createSurveyResponse, getAllSurveyResponses }                  from "./survey";
export { getSetting, setSetting, deleteSetting }                        from "./settings";
