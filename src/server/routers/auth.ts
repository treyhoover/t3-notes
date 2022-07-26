import { TRPCError } from "@trpc/server";
import { t } from "~/server/trpc";

export const authRouter = t.router({
  getSession: t.procedure.query(({ ctx }) => ctx.session),
});

const isInputObjWithUserId = (input: unknown): input is { userId: string } => {
  if (!input) return false;
  if (typeof input !== "object") return false;

  return Object.entries(input).some(
    ([k, v]) => k === "userId" && typeof v === "string"
  );
};

export const authMiddleware = t.middleware(({ next, ctx, input }) => {
  const userId = ctx.session?.user?.id;
  const isUserIdMismatch =
    isInputObjWithUserId(input) && input.userId !== userId;

  if (!userId || isUserIdMismatch) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      userId,
    },
  });
});
