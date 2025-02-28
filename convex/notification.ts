import { mutation, query, action } from './_generated/server';
import { v } from 'convex/values';
import { api } from './_generated/api';

export const registerPushToken = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const userId = identity.subject;
    const user = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("clerkId"), userId))
      .unique();
    
    if (!user) {
      throw new Error("User not found");
    }
    

    const existingToken = await ctx.db
      .query("pushTokens")
      .filter(q => 
        q.and(
          q.eq(q.field("userId"), user._id),
          q.eq(q.field("token"), args.token)
        )
      )
      .first();
    
    if (existingToken) {
      return existingToken._id;
    }
    

    return await ctx.db.insert("pushTokens", {
      userId: user._id,
      token: args.token,
      createdAt: new Date().toISOString(),
    });
  },
});


export const sendPushNotification = action({
  args: {
    token: v.string(),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.object({})),
  },
  handler: async (ctx, args) => {
    try {
      const message = {
        to: args.token,
        sound: 'default',
        title: args.title,
        body: args.body,
        data: args.data || {},
      };

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  },
});


export const processNewNotification = action({
  args: {
    notificationId: v.id('notifications'),
  },
  handler: async (ctx, args) => {
    
    const notification = await ctx.runQuery(api.notification.getNotificationById, {
      id: args.notificationId,
    });
    
    if (!notification) {
      throw new Error("Notification not found");
    }
    
  
    const pushTokens = await ctx.runQuery(api.notification.getUserPushTokens, {
      userId: notification.userId,
    });
    
  
    const results = await Promise.all(
      pushTokens.map(tokenDoc => 
        ctx.runAction(api.notification.sendPushNotification, {
          token: tokenDoc.token,
          title: getNotificationTitle(notification.type),
          body: notification.content,
          data: {
            notificationId: args.notificationId,
            type: notification.type,
            relatedId: notification.relatedId,
          },
        })
      )
    );
    
    return results;
  },
});


export const getNotificationById = query({
  args: {
    id: v.id('notifications'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});


export const getUserPushTokens = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pushTokens")
      .filter(q => q.eq(q.field("userId"), args.userId))
      .collect();
  },
});


function getNotificationTitle(type: string): string {
  const titles: Record<string, string> = {
    'booking_confirmed': 'Booking Confirmed',
    'new_booking': 'New Booking',
    'booking_canceled': 'Booking Canceled',
    'message_received': 'New Message',
    'payment_received': 'Payment Received',
    'review_received': 'New Review',
 
  };
  
  return titles[type] || 'Notification';
}


export const createNotificationWithPush = mutation({
  args: {
    userId: v.id('users'),
    type: v.string(),
    content: v.string(),
    relatedId: v.optional(v.union(
      v.id('posts'),
      v.id('users'),
      v.id('bookings'),
      v.id('messages'),
    )),
    priority: v.optional(v.string()),
    actionUrl: v.optional(v.string()),
    expiresAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // First create the notification in the database
    const notificationId = await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      content: args.content,
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedId: args.relatedId,
      priority: args.priority,
      actionUrl: args.actionUrl,
      expiresAt: args.expiresAt,
    });
    
    // Then schedule the push notification sending
    await ctx.scheduler.runAfter(0, api.notification.processNewNotification, {
      notificationId,
    });
    
    return notificationId;
  },
});