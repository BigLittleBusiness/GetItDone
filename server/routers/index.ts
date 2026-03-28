/**
 * Root tRPC router — assembles all domain routers into a single appRouter.
 *
 * Import paths for consumers:
 *   import { appRouter, AppRouter } from "./routers";   // from server/
 *   import { appRouter, AppRouter } from "../routers";  // from server/__tests__/
 */
import { router } from "../_core/trpc";
import { systemRouter } from "../_core/systemRouter";
import { authRouter }          from "./auth";
import { userRouter }          from "./user";
import { tasksRouter }         from "./tasks";
import { achievementsRouter }  from "./achievements";
import { notificationsRouter } from "./notifications";
import { voiceRouter }         from "./voice";
import { adminRouter }         from "./admin";
import { surveyRouter }        from "./survey";

export const appRouter = router({
  system:        systemRouter,
  auth:          authRouter,
  user:          userRouter,
  tasks:         tasksRouter,
  achievements:  achievementsRouter,
  notifications: notificationsRouter,
  voice:         voiceRouter,
  admin:         adminRouter,
  survey:        surveyRouter,
});

export type AppRouter = typeof appRouter;
