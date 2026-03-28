/**
 * Backward-compatibility shim.
 *
 * The streak reminder job has been moved to server/workers/streakReminder.ts.
 * This shim re-exports the public API so that any existing imports from
 * "../streakReminder" or "./streakReminder" continue to resolve without changes.
 *
 * DO NOT add new logic here — edit server/workers/streakReminder.ts instead.
 */

export { runStreakReminderJob } from "./workers/streakReminder";

/**
 * scheduleStreakReminder is no longer called from the web server.
 * It is kept here as a no-op export so that any legacy call sites compile
 * without errors while the migration is in progress.
 *
 * @deprecated Use the worker entry point (server/workers/index.ts) instead.
 */
export function scheduleStreakReminder(): void {
  console.warn(
    "[StreakReminder] scheduleStreakReminder() called from web server — this is a no-op. " +
    "Start the worker process (pnpm worker:dev) to run scheduled jobs."
  );
}
