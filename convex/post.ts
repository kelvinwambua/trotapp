import { v } from 'convex/values';
import { internalMutation, mutation, query, QueryCtx } from './_generated/server';
import { Id } from './_generated/dataModel';

export const createPost = mutation({
    args: {posterId: v.id('users'), carReg: v.string(), carMake: v.string(), carModel: v.string(), carYear: v.string(), rentRange: v.string(), carLocation: v.string(), carDescription: v.string(), carImageUrl: v.string(), postDate: v.string()},
    handler: async (ctx,args) => {
      return await ctx.db.insert('posts', {...args});
    },
  });
export const getAllPosts = query({
    handler: async (ctx) => {
        return await ctx.db.query('posts').collect();
    }
})  