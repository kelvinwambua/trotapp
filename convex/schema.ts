import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export const User = {
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
  createdAt: v.string(),
  lastActive: v.string(),
  rating: v.optional(v.number()),
  verificationStatus: v.optional(v.string()),
  phoneNumber: v.optional(v.string()),
  location: v.optional(v.string()),
  preferences: v.optional(v.array(v.string())),
  notifications: v.optional(v.boolean()),
};

export const Post = {
  posterId: v.id('users'),
  carReg: v.string(),
  carMake: v.string(),
  carModel: v.string(),
  carYear: v.string(),
  rentRange: v.string(),
  carLocation: v.string(),
  carDescription: v.string(),
  carImageUrl: v.array(v.string()),
  postDate: v.string(),
  fuelType: v.optional(v.string()),
  features: v.optional(v.array(v.string())),
  status: v.string(),
  price: v.number(),
  mileage: v.optional(v.number()),
  transmission: v.optional(v.string()),
  views: v.optional(v.number()),
  
  savedBy: v.optional(v.array(v.id('users'))),
  insurance: v.optional(v.string()),
  availability: v.optional(v.array(v.string())),
  rules: v.optional(v.array(v.string())),
  deposit: v.optional(v.number()),
};

export const Message = {
  senderId: v.id('users'),
  receiverId: v.id('users'),
  threadId: v.optional(v.string()),
  content: v.string(),
  timestamp: v.string(),
  status: v.string(),
  type: v.string(),
  mediaFiles: v.optional(v.array(v.string())),
  websiteUrl: v.optional(v.string()),
  replyTo: v.optional(v.id('messages')),
  metadata: v.optional(v.string()),
};

export const Booking = {
  renterId: v.id('users'),
  ownerId: v.id('users'),
  postId: v.id('posts'),
  startDate: v.string(),
  endDate: v.string(),
  status: v.string(),
  totalAmount: v.number(),
  paymentStatus: v.string(),
  createdAt: v.string(),
  updatedAt: v.string(),
  pickupLocation: v.optional(v.string()),
  dropoffLocation: v.optional(v.string()),
  additionalRequests: v.optional(v.string()),
  insuranceOption: v.optional(v.string()),
  paymentMethod: v.optional(v.string()),
  transactionId: v.optional(v.string()),
};
export const Earnings = {
  userId: v.id('users'),
  amount: v.number(),
  type: v.string(), 
  date: v.string(),
  bookingId: v.optional(v.id('bookings')),
  transactionId: v.optional(v.id('transactions')),
  status: v.string(), 
  description: v.optional(v.string()),
  metadata: v.optional(v.object({
    platform_fee: v.optional(v.number()),
    insurance_fee: v.optional(v.number()),
    net_amount: v.optional(v.number()),
  })),
};

export const Review = {
  reviewerId: v.id('users'),
  targetId: v.id('users'),
  postId: v.optional(v.id('posts')),
  bookingId: v.id('bookings'),
  rating: v.number(),
  content: v.string(),
  createdAt: v.string(),
  photos: v.optional(v.array(v.string())),
  reply: v.optional(v.string()),
  replyDate: v.optional(v.string()),
  helpfulCount: v.optional(v.number()),
  reported: v.optional(v.boolean()),
};

export const Notification = {
  userId: v.id('users'),
  type: v.string(),
  content: v.string(),
  isRead: v.boolean(),
  createdAt: v.string(),
  relatedId: v.optional(v.union(
    v.id('posts'),
    v.id('users'),
    v.id('bookings'),
    v.id('messages'),
  )),
  priority: v.optional(v.string()),
  actionUrl: v.optional(v.string()),
  expiresAt: v.optional(v.string()),
};

export const Transaction = {
  bookingId: v.id('bookings'),
  amount: v.number(),
  type: v.string(),
  status: v.string(),
  createdAt: v.string(),
  paymentMethod: v.string(),
  transactionId: v.string(),
  payerId: v.id('users'),
  receiverId: v.id('users'),
  description: v.optional(v.string()),
  fees: v.optional(v.number()),
  currency: v.optional(v.string()),
};
export const PaymentAccount = {
  userId: v.id('users'),
  flutterwaveSubAccountId: v.string(),
  accountType: v.string(), 
  accountNumber: v.string(),
  bankCode: v.string(),
  bankName: v.string(),
  splitRatio: v.number(), 
  status: v.string(), 
  createdAt: v.string(),
  updatedAt: v.string(),
  metadata: v.optional(v.object({
    settlement_bank: v.optional(v.string()),
    account_holder_name: v.optional(v.string()),
    mobile_number: v.optional(v.string()),
  })),
};
export const PushToken = {
  userId: v.id('users'),
  token: v.string(),
  createdAt: v.string(),
};



export default defineSchema({
  users: defineTable(User)
    .index('byClerkId', ['clerkId'])
    .searchIndex('searchUsers', {
      searchField: 'username',
      filterFields: ['location', 'verificationStatus']
    }),
    pushTokens: defineTable(PushToken)
  .index('byUserId', ['userId'])
  .index('byToken', ['token']),
    paymentAccounts: defineTable(PaymentAccount)
    .index('byUserId', ['userId'])
    .index('bySubAccountId', ['flutterwaveSubAccountId'])
    .index('byStatus', ['status']),

  messages: defineTable(Message)
    .index('byThreadId', ['threadId'])
    .index('byParticipants', ['senderId', 'receiverId'])
    .index('byTimestamp', ['timestamp']),

  posts: defineTable(Post)
    .index('byPosterId', ['posterId'])
    .index('byLocation', ['carLocation'])
    .index('byStatus', ['status'])
    .searchIndex('searchPosts', {
      searchField: 'carDescription',
      filterFields: ['carMake', 'carModel', 'carYear', 'carLocation', 'status']
    }),
    

  bookings: defineTable(Booking)
    .index('byRenter', ['renterId'])
    .index('byOwner', ['ownerId'])
    .index('byStatus', ['status'])
    .index('byDates', ['startDate', 'endDate']),

  reviews: defineTable(Review)
    .index('byTarget', ['targetId'])
    .index('byReviewer', ['reviewerId'])
    .index('byPost', ['postId'])
    .index('byBooking', ['bookingId']),

  notifications: defineTable(Notification)
    .index('byUser', ['userId'])
    .index('byType', ['type'])
    .index('byCreatedAt', ['createdAt']),

  transactions: defineTable(Transaction)
    .index('byBooking', ['bookingId'])
    .index('byPayer', ['payerId'])
    .index('byReceiver', ['receiverId'])
    .index('byStatus', ['status']),
  earnings: defineTable(Earnings)
  .index('byUserId', ['userId'])
  .index('byDate', ['date'])
  .index('byStatus', ['status'])
  .index('byType', ['type']),
});