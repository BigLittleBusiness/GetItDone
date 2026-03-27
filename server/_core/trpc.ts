import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { verifyAdminSession } from './adminSession';

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

/**
 * adminProcedure — requires a valid signed admin session cookie.
 * The cookie is issued by admin.login after password verification.
 * This is independent of Manus OAuth so the admin panel works even
 * if the owner has not logged in via Manus.
 */
export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    const isAdmin = await verifyAdminSession(ctx.req);
    if (!isAdmin) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: NOT_ADMIN_ERR_MSG });
    }

    return next({ ctx });
  }),
);
