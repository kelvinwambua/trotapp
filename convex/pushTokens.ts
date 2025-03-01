import { v } from 'convex/values';
import { mutation } from './_generated/server';

export const storePushToken = mutation({
  args: {
    userId: v.id('users'),
    token: v.string(),
    createdAt: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if this token already exists for this user
    const existingToken = await ctx.db
      .query('pushTokens')
      .filter(q => 
        q.and(
          q.eq(q.field('userId'), args.userId),
          q.eq(q.field('token'), args.token)
        )
      )
      .first();
    
    // If token doesn't exist yet, store it
    if (!existingToken) {
      const tokenId = await ctx.db.insert('pushTokens', {
        userId: args.userId,
        token: args.token,
        createdAt: args.createdAt,
      });
      
      return tokenId;
    }
    
    // Token already exists, just return its ID
    return existingToken._id;
  },
});