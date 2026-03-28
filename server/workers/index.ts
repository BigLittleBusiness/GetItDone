/**
 * Worker Process Entry Point
 *
 * This is the dedicated entry point for the Taskbloom background worker. It runs
 * separately from the Express web server so that long-running or CPU-bound jobs
 * cannot block request handling.
 *
 * Jobs managed here:
 *  - Streak Reminder  — fires every 30 minutes, notifies owner of at-risk streaks
 *  - Due-Date Reminder — fires every 30 minutes, notifies owner of tasks due today
 *
 * Scheduling strategy:
 *  Each job is aligned to the next :00 or :30 UTC boundary so that all instances
 *  (in a multi-container deployment) fire at the same wall-clock time. After each
 *  run the scheduler re-calculates the delay to the next boundary, preventing
 *  clock drift over long uptimes.
 *
 * Graceful shutdown:
 *  On SIGTERM or SIGINT the worker stops scheduling new runs and waits up to
 *  SHUTDOWN_TIMEOUT_MS for any in-flight job to complete before exiting.
 */

import "dotenv/config";
import { runStreakReminderJob } from "./streakReminder";
import { runDueDateReminderJob } from "./dueDateReminder";
import { msUntilNextHalfHour } from "./shared/timeUtils";

const SHUTDOWN_TIMEOUT_MS = 30_000;

// Track in-flight job promises so graceful shutdown can await them
const inFlight = new Set<Promise<void>>();
let shuttingDown = false;

/**
 * Schedule a job to run at every 30-minute UTC boundary.
 * Returns a cancel function that stops future scheduling (does not abort
 * an already-running job — use the inFlight set for that).
 */
function scheduleJob(
  name: string,
  run: (now: Date) => Promise<void>
): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const scheduleNext = () => {
    if (shuttingDown) return;

    const now = new Date();
    const delay = msUntilNextHalfHour(now);
    const nextRun = new Date(now.getTime() + delay);

    console.log(
      `[${name}] Next run scheduled for ${nextRun.toUTCString()} (in ${Math.round(delay / 60_000)} min)`
    );

    timer = setTimeout(async () => {
      if (shuttingDown) return;

      const jobNow = new Date();
      const promise = run(jobNow).finally(() => inFlight.delete(promise));
      inFlight.add(promise);

      await promise;
      scheduleNext();
    }, delay);
  };

  scheduleNext();

  return () => {
    if (timer !== null) clearTimeout(timer);
  };
}

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`[Worker] Received ${signal}. Shutting down gracefully…`);

  if (inFlight.size > 0) {
    console.log(`[Worker] Waiting for ${inFlight.size} in-flight job(s) to complete…`);

    const timeout = new Promise<void>((resolve) =>
      setTimeout(() => {
        console.warn(`[Worker] Shutdown timeout reached after ${SHUTDOWN_TIMEOUT_MS / 1000}s. Forcing exit.`);
        resolve();
      }, SHUTDOWN_TIMEOUT_MS)
    );

    await Promise.race([Promise.all(Array.from(inFlight)), timeout]);
  }

  console.log("[Worker] Shutdown complete.");
  process.exit(0);
}

// ── Start ──────────────────────────────────────────────────────────────────

console.log("[Worker] Starting Taskbloom background worker…");

scheduleJob("StreakReminder", runStreakReminderJob);
scheduleJob("DueDateReminder", runDueDateReminderJob);

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

console.log("[Worker] All jobs scheduled. Worker is running.");
