import { v } from 'convex/values';
import { internalMutation, mutation, query, QueryCtx } from './_generated/server';

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});