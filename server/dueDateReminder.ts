/**
 * Backward-compatibility shim.
 *
 * The due-date reminder job has been moved to server/workers/dueDateReminder.ts.
 * This shim re-exports the public API so that any existing imports from
 * "../dueDateReminder" or "./dueDateReminder" continue to resolve without changes.
 *
 * DO NOT add new logic here — edit server/workers/dueDateReminder.ts instead.
 */

export { runDueDateReminderJob } from "./workers/dueDateReminder";

/**
 * scheduleDueDateReminder is no longer called from the web server.
 * It is kept here as a no-op export so that any legacy call sites compile
 * without errors while the migration is in progress.
 *
 * @deprecated Use the worker entry point (server/workers/index.ts) instead.
 */
export function scheduleDueDateReminder(): void {
  console.warn(
    "[DueDateReminder] scheduleDueDateReminder() called from web server — this is a no-op. " +
    "Start the worker process (pnpm worker:dev) to run scheduled jobs."
  );
}
