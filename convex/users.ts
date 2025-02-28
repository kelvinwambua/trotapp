import { v } from 'convex/values';
import { internalMutation, mutation, query, QueryCtx } from './_generated/server';
import { Id } from './_generated/dataModel';
export const getAllUsers= query({
  args: {},
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .collect();

    return user;

  
  },
});



export const getUserById = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user?.imageUrl || user.imageUrl.startsWith('http')) {
      return user;
    }

    const url = await ctx.storage.getUrl(user.imageUrl as Id<'_storage'>);

    return {
      ...user,
      imageUrl: url,
    };
  },
});
export const getUserByClerkId = query({
  args: {
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('clerkId'), args.clerkId))
      .unique();

    if (!user?.imageUrl || user.imageUrl.startsWith('http')) {
      return user;
    }

    const url = await ctx.storage.getUrl(user.imageUrl as Id<'_storage'>);

    return {
      ...user,
      imageUrl: url,
    };
  },
});

export const createUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    first_name: v.optional(v.union(v.string(), v.null())),
    last_name: v.optional(v.union(v.string(), v.null())),
    imageUrl: v.optional(v.string()),
    username: v.union(v.string(), v.null()),
    bio: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    MoneyEarned: v.number(),
    MoneySpent: v.number(),
    RentCount: v.number(),
    RenteeCount: v.number(),
    // Added required fields
    createdAt: v.optional(v.string()), // Made optional for backward compatibility
    lastActive: v.optional(v.string()), // Made optional for backward compatibility
    // Added optional fields
    rating: v.optional(v.number()),
    verificationStatus: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    location: v.optional(v.string()),
    preferences: v.optional(v.array(v.string())),
    notifications: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    
    const userId = await ctx.db.insert('users', {
      ...args,
      username: args.username || `${args.first_name || ''}${args.last_name || ''}`,
      createdAt: args.createdAt || now,
      lastActive: args.lastActive || now,
    });
    
    return userId;
  },
});

export const updateUser = mutation({
  args: {
    _id: v.id('users'),
    bio: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    profilePicture: v.optional(v.string()),
    pushToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await getCurrentUserOrThrow(ctx);

    const { _id, ...rest } = args;
    return await ctx.db.patch(_id, rest);
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  await getCurrentUserOrThrow(ctx);

  return await ctx.storage.generateUploadUrl();
});

export const updateImage = mutation({
  args: { storageId: v.id('_storage'), _id: v.id('users') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args._id, {
      imageUrl: args.storageId,
    });
  },
});

export const searchUsers = query({
  args: {
    search: v.string(),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query('users')
      .withSearchIndex('searchUsers', (q) => q.search('username', args.search))
      .collect();

    const usersWithImage = await Promise.all(
      users.map(async (user) => {
        if (!user?.imageUrl || user.imageUrl.startsWith('http')) {
          user.imageUrl;
          return user;
        }

        const url = await ctx.storage.getUrl(user.imageUrl as Id<'_storage'>);
        user.imageUrl = url!;
        return user;
      })
    );

    return usersWithImage;
  },
});

// IDENTITY CHECK
// https://docs.convex.dev/auth/database-auth#mutations-for-upserting-and-deleting-users

export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await userByExternalId(ctx, clerkUserId);

    if (user !== null) {
      await ctx.db.delete(user._id);
    } else {
      console.warn(`Can't delete user, there is none for Clerk user ID: ${clerkUserId}`);
    }
  },
});

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx);
  if (!userRecord) throw new Error("Can't get current user");
  return userRecord;
}

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }
  return await userByExternalId(ctx, identity.subject);
}

async function userByExternalId(ctx: QueryCtx, externalId: string) {
  return await ctx.db
    .query('users')
    .withIndex('byClerkId', (q) => q.eq('clerkId', externalId))
    .unique();
}