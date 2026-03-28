/**
 * Auth router — me query and logout mutation.
 */
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import { publicProcedure, router } from "../_core/trpc";

export const authRouter = router({
  /** Returns the currently authenticated user, or null if not logged in. */
  me: publicProcedure.query(opts => opts.ctx.user),

  /** Clears the session cookie, effectively logging the user out. */
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
});
