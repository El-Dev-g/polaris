import { MutationCtx, QueryCtx } from "./_generated/server";

export const verifyAuth = async (ctx: QueryCtx | MutationCtx) => {
  try {
    const identity = await ctx.auth.getUserIdentity();
    return identity;
  } catch (error) {
    return null;
  }
};
