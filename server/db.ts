/**
 * Backward-compatibility shim.
 *
 * All existing imports of the form:
 *   import { getDb, createTask, ... } from "./db"    (from server/)
 *   import { ... }                    from "../db"   (from server/__tests__/)
 *
 * continue to resolve here.  The shim re-exports everything from the domain
 * barrel so Vitest mocks targeting this path intercept all DB calls made by
 * the domain routers (which also import from "../db").
 *
 * New code should import from this shim (or from the specific sub-module
 * when only a subset of helpers is needed).
 */
export * from "./db/index";
