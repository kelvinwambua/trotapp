import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { Id } from './_generated/dataModel';
import { Doc } from './_generated/dataModel';

export const getUserNotifications = query({
  args: { 
    userId: v.id('users'),
    limit: v.optional(v.number()),
    includeRead: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const { userId, limit = 50, includeRead = false } = args;
    
    let notificationsQuery = ctx.db
      .query('notifications')
      .filter(q => q.eq(q.field('userId'), userId));
    
    if (!includeRead) {
      notificationsQuery = notificationsQuery.filter(q => 
        q.eq(q.field('isRead'), false)
      );
    }
    
    const notifications = await notificationsQuery
      .order('desc')
      .take(limit);
    
    return Promise.all(notifications.map(async (notification: Doc<'notifications'>) => {
      const relatedEntity = notification.relatedId 
        ? await fetchRelatedEntity(ctx, notification.relatedId, notification.type)
        : null;
      
      return {
        ...notification,
        relatedEntity
      };
    }));
  }
});

async function fetchRelatedEntity(ctx: any, relatedId: Id<'posts' | 'users' | 'bookings' | 'messages'>, type: string) {
  try {
    if (type.includes('post')) {
      const post = await ctx.db.get(relatedId);
      if (!post) return null;
      
      
      let imageUrl = null;
      if (post.carImageUrl && post.carImageUrl.length > 0) {
        imageUrl = await ctx.storage.getUrl(post.carImageUrl[0] as Id<'_storage'>);
      }
      
      return {
        type: 'post',
        title: `${post.carYear} ${post.carMake} ${post.carModel}`,
        imageUrl
      };
    } else if (type.includes('user')) {
      const user = await ctx.db.get(relatedId);
      if (!user) return null;
      
      return {
        type: 'user',
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        imageUrl: user.imageUrl
      };
    } else if (type.includes('booking')) {
      const booking = await ctx.db.get(relatedId);
      if (!booking) return null;
      
      
      const post = await ctx.db.get(booking.postId);
      
      return {
        type: 'booking',
        dates: `${booking.startDate} - ${booking.endDate}`,
        status: booking.status,
        carDetails: post ? `${post.carYear} ${post.carMake} ${post.carModel}` : null
      };
    } else if (type.includes('message')) {
      const message = await ctx.db.get(relatedId);
      if (!message) return null;
      
    
      const sender = await ctx.db.get(message.senderId);
      
      return {
        type: 'message',
        sender: sender ? `${sender.first_name || ''} ${sender.last_name || ''}`.trim() : null,
        preview: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '')
      };
    }
  } catch (error) {
    console.error('Error fetching related entity:', error);
    return null;
  }
  
  return null;
}


export const markNotificationRead = mutation({
  args: { notificationId: v.id('notifications') },
  handler: async (ctx, args) => {
    const { notificationId } = args;
    const notification = await ctx.db.get(notificationId);
    
    if (!notification) {
      throw new Error('Notification not found');
    }
    
    return await ctx.db.patch(notificationId, { isRead: true });
  }
});


export const markAllNotificationsRead = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const { userId } = args;
    
    const unreadNotifications = await ctx.db
      .query('notifications')
      .filter(q => q.eq(q.field('userId'), userId))
      .filter(q => q.eq(q.field('isRead'), false))
      .collect();
    
    await Promise.all(unreadNotifications.map(notification => 
      ctx.db.patch(notification._id, { isRead: true })
    ));
    
    return { success: true, count: unreadNotifications.length };
  }
});

export const createNotification = mutation({
  args: {
    userId: v.id('users'),
    type: v.string(),
    content: v.string(),
    relatedId: v.optional(v.union(
      v.id('posts'),
      v.id('users'),
      v.id('bookings'),
      v.id('messages')
    )),
    priority: v.optional(v.string()),
    actionUrl: v.optional(v.string()),
    expiresAt: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { userId, type, content, relatedId, priority, actionUrl, expiresAt } = args;
    
    const notification = {
      userId,
      type,
      content,
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedId,
      priority: priority || 'normal',
      actionUrl,
      expiresAt
    };
    
    return await ctx.db.insert('notifications', notification);
  }
})
export const deleteNotification = mutation({
  args: { notificationId: v.id('notifications') },
  handler: async (ctx, args) => {
    const { notificationId } = args;
    const notification = await ctx.db.get(notificationId);
    
    if (!notification) {
      throw new Error('Notification not found');
    }
    
    await ctx.db.delete(notificationId);
    return true;
  }
});


export const getUnreadNotificationCount = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const { userId } = args;
    
    const unreadNotifications = await ctx.db
      .query('notifications')
      .filter(q => q.eq(q.field('userId'), userId))
      .filter(q => q.eq(q.field('isRead'), false))
      .collect();
    
    return { count: unreadNotifications.length };
  }
});


export const clearExpiredNotifications = mutation({
  args: {},
  handler: async (ctx) => {
    const now = new Date().toISOString();
    

    const expiredNotifications = await ctx.db
      .query('notifications')
      .filter(q => q.lt(q.field('expiresAt'), now))
      .collect();
    

    await Promise.all(expiredNotifications.map(notification => 
      ctx.db.delete(notification._id)
    ));
    
    return { success: true, count: expiredNotifications.length };
  }
});