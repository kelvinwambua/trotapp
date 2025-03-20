import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";


export const getUserChatThreads = query({
  args: {
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    // Get all chat threads where the user is a participant
    const chatThreads = await ctx.db
      .query("chats")
      .filter(q => 
        q.eq(q.field("threadType"), "direct")
      )
      .collect();
    
    
    const userThreads = chatThreads.filter(thread => 
      thread.participants.some(participantId => participantId.toString() === args.userId.toString())
    );
    
    // Enrich threads with participant details
    return Promise.all(
      userThreads.map(async (thread) => {
        const otherParticipantIds = thread.participants.filter(
          participantId => participantId.toString() !== args.userId.toString()
        );
        
        const otherParticipants = await Promise.all(
          otherParticipantIds.map(async (participantId) => {
            return await ctx.db.get(participantId);
          })
        );
        

        const latestMessage = await ctx.db
          .query("messages")
          .filter(q => q.eq(q.field("threadId"), thread._id))
          .order("desc")
          .first();
        
        // Calculate unread count for current user
        let unreadCount = 0;
        if (thread.unreadCount && thread.unreadCount.userId === args.userId.toString()) {
          unreadCount = thread.unreadCount.count;
        }
        
        return {
          ...thread,
          otherParticipants: otherParticipants.filter(Boolean),
          latestMessage: latestMessage || null,
          unreadCount: unreadCount
        };
      })
    );
  }
});

// Fixed: Get messages for a specific chat thread
export const getMessages = query({
  args: {
    threadId: v.id("chats"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const cursor = args.cursor || Date.now();
    
    // Get messages for the thread with pagination
    const messages = await ctx.db
      .query("messages")
      .filter(q => q.eq(q.field("threadId"), args.threadId))
      .filter(q => q.lt(q.field("timestamp"), cursor))
      .order("desc")
      .take(limit);
    

    const enrichedMessages = await Promise.all(
      messages.map(async (message) => {
    
        const sender = await ctx.db.get(message.senderId);
        return {
          ...message,
          sender: sender ? {
            _id: sender._id,
            username: sender.username || "Anonymous", // Fallback name
            imageUrl: sender.imageUrl || "",
            firstName: sender.first_name || "",
            lastName: sender.last_name || ""
          } : {
            _id: message.senderId,
            username: "Unknown User",
            imageUrl: "",
            firstName: "",
            lastName: ""
          }
        };
      })
    );
    
    // Determine if there are more messages
    const oldestTimestamp = messages.length > 0 ? messages[messages.length - 1].timestamp : 0;
    const hasMore = messages.length === limit;
    
    return {
      messages: enrichedMessages,
      nextCursor: hasMore ? oldestTimestamp : null
    };
  }
});


export const sendMessage = mutation({
  args: {
    threadId: v.id("chats"),
    content: v.string(),
    type: v.optional(v.string()),
    attachments: v.optional(v.array(
      v.object({
        type: v.string(),
        url: v.string(),
        name: v.optional(v.string()),
        size: v.optional(v.number()),
        duration: v.optional(v.number())
      })
    )),
    replyTo: v.optional(v.id("messages"))
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
    
    
    const thread = await ctx.db.get(args.threadId);
    if (!thread) {
      throw new Error("Chat thread not found");
    }
    
    
    if (!thread.participants.some(id => id.toString() === user._id.toString())) {
      throw new Error("User is not a participant in this thread");
    }
    
    
    const now = Date.now();
    const messageId = await ctx.db.insert("messages", {
      threadId: args.threadId,
      senderId: user._id,
      content: args.content,
      timestamp: now,
      status: "sent",
      type: args.type || "text",
      attachments: args.attachments || [],
      replyTo: args.replyTo,
      deliveredTo: [user._id],
      readBy: [user._id]
    });
    
    
    const threadUpdates = {
      lastMessage: args.content,
      lastMessageTime: now,
      updatedAt: now
    };
    
    
    const otherParticipants = thread.participants.filter(id => id.toString() !== user._id.toString());
    if (otherParticipants.length > 0) {
    
      Object.assign(threadUpdates, {
        unreadCount: {
          userId: otherParticipants[0].toString(),
          count: (thread.unreadCount?.count || 0) + 1
        }
      });
    }
    
    await ctx.db.patch(args.threadId, threadUpdates);
    
    
    for (const participantId of otherParticipants) {
      const tokens = await ctx.db
        .query("pushTokens")
        .filter(q => q.eq(q.field("userId"), participantId))
        .collect();
      
      for (const tokenObj of tokens) {
        await ctx.scheduler.runAfter(0, internal.push.sendPushNotification, {
          pushToken: tokenObj.token,
          messageTitle: user.username || user.first_name || "New message",
          messageBody: args.content,
          bookingId: args.threadId
     
        });
      }
    }
    
    
    const message = await ctx.db.get(messageId);
    return {
      ...message,
      sender: {
        _id: user._id,
        username: user.username || "Anonymous",
        imageUrl: user.imageUrl || "",
        firstName: user.first_name || "",
        lastName: user.last_name || ""
      }
    };
  }
});


export const markThreadAsRead = mutation({
  args: {
    threadId: v.id("chats")
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
    
    const thread = await ctx.db.get(args.threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }
    

    if (!thread.participants.some(id => id.toString() === user._id.toString())) {
      throw new Error("User is not a participant in this thread");
    }
    
    
    const unreadMessages = await ctx.db
      .query("messages")
      .filter(q => q.eq(q.field("threadId"), args.threadId))
      .collect();
    

    const messagesToUpdate = unreadMessages.filter(message => 
      !message.readBy || !message.readBy.some(id => id.toString() === user._id.toString())
    );
    

    for (const message of messagesToUpdate) {
      const readBy = [...(message.readBy || []), user._id];
      await ctx.db.patch(message._id, { readBy });
    }
    
    
    if (thread.unreadCount && thread.unreadCount.userId === user._id.toString()) {
      await ctx.db.patch(args.threadId, {
        unreadCount: {
          userId: user._id.toString(),
          count: 0
        }
      });
    }
    
    return messagesToUpdate.length;
  }
});


export const getChatThreadDetails = query({
  args: {
    threadId: v.id("chats")
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
    
    const thread = await ctx.db.get(args.threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }
    
    
    const participants = await Promise.all(
      thread.participants.map(async participantId => {
        const participant = await ctx.db.get(participantId);
        return participant ? {
          _id: participant._id,
          username: participant.username || "Anonymous",
          imageUrl: participant.imageUrl || "",
          firstName: participant.first_name || "",
          lastName: participant.last_name || "",
          isCurrentUser: participant._id.toString() === user._id.toString()
        } : null;
      })
    );
    
    
    const latestMessages = await ctx.db
      .query("messages")
      .filter(q => q.eq(q.field("threadId"), args.threadId))
      .order("desc")
      .take(5);
    
    return {
      ...thread,
      participants: participants.filter(Boolean),
      latestMessages: latestMessages.reverse()
    };
  }
});


export const updateMessageStatus = mutation({
  args: {
    messageId: v.id("messages"),
    status: v.string()
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
    
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }
    
    
    if (args.status === "delivered") {
      const deliveredTo = [...(message.deliveredTo || [])];
      if (!deliveredTo.some(id => id.toString() === user._id.toString())) {
        deliveredTo.push(user._id);
      }
      await ctx.db.patch(args.messageId, { deliveredTo });
    } else if (args.status === "read") {
      const readBy = [...(message.readBy || [])];
      if (!readBy.some(id => id.toString() === user._id.toString())) {
        readBy.push(user._id);
      }
      await ctx.db.patch(args.messageId, { readBy });
    }
    
    return true;
  }
});


export const getChatParticipants = query({
  args: {
    threadId: v.id("chats")
  },
  handler: async (ctx, args) => {
    const thread = await ctx.db.get(args.threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }
    

    const participants = await Promise.all(
      thread.participants.map(async participantId => {
        const user = await ctx.db.get(participantId);
        return user ? {
          _id: user._id,
          username: user.username || "Anonymous",
          imageUrl: user.imageUrl || "",
          firstName: user.first_name || "",
          lastName: user.last_name || "",
          bio: user.bio || "",
          rating: user.rating || 0
        } : null;
      })
    );
    
    return participants.filter(Boolean);
  }
});


export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages")
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
    
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }
    
    
    if (message.senderId.toString() !== user._id.toString()) {
      throw new Error("Can only delete your own messages");
    }
    

    await ctx.db.patch(args.messageId, {
      isDeleted: true,
      content: "This message was deleted"
    });
    
    return true;
  }
});


export const getUnreadMessageCount = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      return 0;
    }
    
    const userId = identity.subject;
    const user = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("clerkId"), userId))
      .unique();
    
    if (!user) {
      return 0;
    }
    

    const chatThreads = await ctx.db
      .query("chats")
      .collect();
    
    
    const userThreads = chatThreads.filter(thread => 
      thread.participants.some(id => id.toString() === user._id.toString())
    );
    

    let totalUnread = 0;
    for (const thread of userThreads) {
      if (thread.unreadCount && thread.unreadCount.userId === user._id.toString()) {
        totalUnread += thread.unreadCount.count;
      }
    }
    
    return totalUnread;
  }
});