import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createSurveyResponse, getAllSurveyResponses } from "./db";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  survey: router({
    submit: publicProcedure
      .input(
        z.object({
          roleValidation: z.enum(['spot-on', 'mostly', 'no']).optional(),
          painPoint: z.enum(['starting', 'planning', 'remembering', 'shame']).optional(),
          featureFit: z.enum(['body-double', 'shield', 'cheerleader', 'secretary']).optional(),
          email: z.string().email().optional().or(z.literal('')),
        })
      )
      .mutation(async ({ input }) => {
        await createSurveyResponse({
          roleValidation: input.roleValidation,
          painPoint: input.painPoint,
          featureFit: input.featureFit,
          email: input.email || undefined,
        });
        return { success: true };
      }),

    getAll: publicProcedure.query(async () => {
      return await getAllSurveyResponses();
    }),
  }),
});

export type AppRouter = typeof appRouter;
