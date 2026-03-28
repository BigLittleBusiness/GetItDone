/**
 * Backward-compatibility shim.
 *
 * All existing imports of the form:
 *   import { appRouter } from "./routers"    (from server/)
 *   import { appRouter } from "../routers"   (from server/__tests__/)
 *
 * continue to resolve here without modification.
 *
 * New code should import directly from the domain module, e.g.:
 *   import { tasksRouter } from "./routers/tasks";
 */
export { appRouter } from "./routers/index";
export type { AppRouter } from "./routers/index";
