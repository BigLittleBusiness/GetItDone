/**
 * Achievements router — lists unlocked achievements and the full catalogue.
 */
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getAchievementsForUser } from "../db";
import { ACHIEVEMENT_CATALOGUE } from "../shared/gamification";

export const achievementsRouter = router({
  /** Returns the achievements unlocked by the authenticated user, merged with catalogue metadata. */
  list: protectedProcedure.query(async ({ ctx }) => {
    const unlocked = await getAchievementsForUser(ctx.user.id);
    return unlocked.map(a => ({ ...a, ...ACHIEVEMENT_CATALOGUE[a.slug] }));
  }),

  /** Returns the full achievement catalogue (public — used on the marketing site). */
  catalogue: publicProcedure.query(() => ACHIEVEMENT_CATALOGUE),
});
