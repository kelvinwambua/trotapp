import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export const User = {
  clerkId: v.string(),
  email: v.string(),
  first_name: v.optional(v.union(v.string(),v.null())),
  last_name: v.optional(v.union(v.string(),v.null())),
  imageUrl: v.optional(v.string()),
  username: v.union(v.string(), v.null()),
  bio: v.optional(v.string()),
  websiteUrl: v.optional(v.string()),
  MoneyEarned: v.number(),
  MoneySpent: v.number(),
  RentCount: v.number(),
  RenteeCount: v.number(),
};
export const Post =  {
  posterId: v.id('users'),
  carReg: v.string(),
  carMake: v.string(),
  carModel: v.string(),
  carYear: v.string(),
  rentRange: v.string(),
  carLocation: v.string(),
  carDescription: v.string(),
  carImageUrl: v.string(),
  postDate: v.string(),
}

export const Message = {
  userId: v.id('users'), 
  threadId: v.optional(v.string()),
  content: v.string(),
  likeCount: v.number(), 
  commentCount: v.number(), 
  retweetCount: v.number(), 
  mediaFiles: v.optional(v.array(v.string())), 
  websiteUrl: v.optional(v.string()), 
};

export default defineSchema({
  users: defineTable(User).index('byClerkId', ['clerkId']).searchIndex('searchUsers', {
    searchField: 'username',
  }),
  messages: defineTable(Message),
});