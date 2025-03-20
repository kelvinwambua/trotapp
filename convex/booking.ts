import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

export const getRecentBookings = query({
    args: {
        userId: v.id("users"),
        limit: v.optional(v.number()),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let bookingsQuery = ctx.db.query("bookings").filter((q) =>
            q.or(
                q.eq(q.field("renterId"), args.userId),
                q.eq(q.field("ownerId"), args.userId)
            )
        );

        if (args.status) {
            bookingsQuery = bookingsQuery.filter((q) =>
                q.eq(q.field("status"), args.status)
            );
        }

        const bookings = await bookingsQuery
            .order("desc")
            .take(args.limit || 10);

        const enrichedBookings = await Promise.all(
            bookings.map(async (booking) => {
                const [post, renter, owner, review] = await Promise.all([
                    ctx.db.get(booking.postId),
                    ctx.db.get(booking.renterId),
                    ctx.db.get(booking.ownerId),
                    ctx.db
                        .query("reviews")
                        .filter((q) => q.eq(q.field("bookingId"), booking._id))
                        .first(),
                ]);

                let carImageUrls: string[] = [];
                if (post?.carImageUrl && Array.isArray(post.carImageUrl)) {
                    carImageUrls = (await Promise.all(
                        post.carImageUrl.map(async (storageId) => {
                            if (typeof storageId !== 'string') return null;
                            try {
                                return await ctx.storage.getUrl(storageId as Id<'_storage'>);
                            } catch (error) {
                                console.error(`Error generating URL for ${storageId}:`, error);
                                return null;
                            }
                        })
                    )).filter((url): url is string => typeof url === 'string');
                }

                return {
                    ...booking,
                    post: post
                        ? {
                            carMake: post.carMake,
                            carModel: post.carModel,
                            carYear: post.carYear,
                            carImageUrl: post.carImageUrl,
                            carImageUrls,
                            carLocation: post.carLocation,
                        }
                        : null,
                    renter: renter
                        ? {
                            username: renter.username,
                            imageUrl: renter.imageUrl,
                        }
                        : null,
                    owner: owner
                        ? {
                            username: owner.username,
                            imageUrl: owner.imageUrl,
                        }
                        : null,
                    review: review || null,
                };
            })
        );

        return enrichedBookings;
    },
});

export const getBookingStats = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const bookings = await ctx.db
            .query("bookings")
            .filter((q) =>
                q.or(
                    q.eq(q.field("renterId"), args.userId),
                    q.eq(q.field("ownerId"), args.userId)
                )
            )
            .collect();

        return {
            total: bookings.length,
            asRenter: bookings.filter((b) => b.renterId === args.userId).length,
            asOwner: bookings.filter((b) => b.ownerId === args.userId).length,
            active: bookings.filter((b) => b.status === "active").length,
            completed: bookings.filter((b) => b.status === "completed").length,
        };
    },
});

export const getBookingById = query({
    args: { bookingId: v.id("bookings") },
    handler: async (ctx, args) => {
        const booking = await ctx.db.get(args.bookingId);
        if (!booking) return null;

        const [post, renter, owner] = await Promise.all([
            ctx.db.get(booking.postId),
            ctx.db.get(booking.renterId),
            ctx.db.get(booking.ownerId),
        ]);

        let carImageUrls: string[] = [];
        if (post?.carImageUrl && Array.isArray(post.carImageUrl)) {
            carImageUrls = (await Promise.all(
                post.carImageUrl.map(async (storageId) => {
                    if (typeof storageId !== 'string') return null;
                    try {
                        return await ctx.storage.getUrl(storageId as Id<'_storage'>);
                    } catch (error) {
                        console.error(`Error generating URL for ${storageId}:`, error);
                        return null;
                    }
                })
            )).filter((url): url is string => typeof url === 'string');
        }

        return {
            ...booking,
            post: post ? { ...post, carImageUrls } : null,
            renter,
            owner,
        };
    },
});

export const getBookingsByPost = query({
    args: { postId: v.id("posts") },
    handler: async (ctx, args) => {
        const bookings = await ctx.db
            .query("bookings")
            .filter((q) => q.eq(q.field("postId"), args.postId))
            .collect();

        const post = await ctx.db.get(args.postId);
        let carImageUrls: string[] = [];
        
        if (post?.carImageUrl && Array.isArray(post.carImageUrl)) {
            carImageUrls = (await Promise.all(
                post.carImageUrl.map(async (storageId) => {
                    if (typeof storageId !== 'string') return null;
                    try {
                        return await ctx.storage.getUrl(storageId as Id<'_storage'>);
                    } catch (error) {
                        console.error(`Error generating URL for ${storageId}:`, error);
                        return null;
                    }
                })
            )).filter((url): url is string => typeof url === 'string');
        }

        return bookings.map(booking => ({
            ...booking,
            post: post ? { ...post, carImageUrls } : null
        }));
    },
});

export const getUpcomingBookings = query({
    args: { 
        userId: v.id("users"),
        limit: v.optional(v.number())
    },
    handler: async (ctx, args) => {
        const currentDate = new Date().toISOString();
        
        const bookings = await ctx.db
            .query("bookings")
            .filter((q) =>
                q.and(
                    q.or(
                        q.eq(q.field("renterId"), args.userId),
                        q.eq(q.field("ownerId"), args.userId)
                    ),
                    q.gt(q.field("startDate"), currentDate)
                )
            )
            .order("asc")
            .take(args.limit || 5);

        return Promise.all(bookings.map(async (booking) => {
            const post = await ctx.db.get(booking.postId);
            let carImageUrls: string[] = [];

            if (post?.carImageUrl && Array.isArray(post.carImageUrl)) {
                carImageUrls = (await Promise.all(
                    post.carImageUrl.map(async (storageId) => {
                        if (typeof storageId !== 'string') return null;
                        try {
                            return await ctx.storage.getUrl(storageId as Id<'_storage'>);
                        } catch (error) {
                            console.error(`Error generating URL for ${storageId}:`, error);
                            return null;
                        }
                    })
                )).filter((url): url is string => typeof url === 'string');
            }

            return {
                ...booking,
                post: post ? { ...post, carImageUrls } : null
            };
        }));
    },
});

export const createBooking = mutation({
  args: {
    postId: v.id('posts'),
    startDate: v.string(),
    endDate: v.string(),
    totalAmount: v.number(),
    additionalRequests: v.optional(v.string()),
    paymentMethod: v.string(),
    transactionId: v.string(),
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
    
    const post = await ctx.db.get(args.postId);
    
    if (!post) {
      throw new Error("Post not found");
    }
    
    if (post.status !== 'active') {
      throw new Error("This car is not available for booking");
    }
    
    
    const bookingId = await ctx.db.insert("bookings", {
      renterId: user._id,
      ownerId: post.posterId,
      postId: args.postId,
      startDate: args.startDate,
      endDate: args.endDate,
      status: "confirmed",
      totalAmount: args.totalAmount,
      paymentStatus: "paid",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      additionalRequests: args.additionalRequests,
      paymentMethod: args.paymentMethod,
      transactionId: args.transactionId,
    });
    const trackingId = await ctx.db.insert("vehicleTracking", {
        bookingId,
        postId: args.postId,
        renterId: user._id,
        ownerId: post.posterId,
        status: "active",
        currentLocation: {
          latitude: 0, // These will be updated when tracking begins
          longitude: 0,
        },
        locationHistory: [],
        startedAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
      });
    
    await ctx.db.insert("transactions", {
      bookingId,
      amount: args.totalAmount,
      type: "booking_payment",
      status: "completed",
      createdAt: new Date().toISOString(),
      paymentMethod: args.paymentMethod,
      transactionId: args.transactionId,
      payerId: user._id,
      receiverId: post.posterId,
      description: `Payment for ${post.carMake} ${post.carModel} rental`,
    });
    
    
    await ctx.db.insert("notifications", {
      userId: user._id,
      type: "booking_confirmed",
      content: `Your booking for ${post.carMake} ${post.carModel} has been confirmed.`,
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedId: bookingId,
    });
    
    await ctx.db.insert("notifications", {
      userId: post.posterId,
      type: "new_booking",
      content: `${user.username || 'Someone'} has booked your ${post.carMake} ${post.carModel}.`,
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedId: bookingId,
    });
    

    const renterTokens = await ctx.db
      .query("pushTokens")
      .filter(q => q.eq(q.field("userId"), user._id))
      .collect();
      
    const ownerTokens = await ctx.db
      .query("pushTokens")
      .filter(q => q.eq(q.field("userId"), post.posterId))
      .collect();
    

    for (const tokenObj of ownerTokens) {
      await ctx.scheduler.runAfter(0, internal.push.sendPushNotification, {
        pushToken: tokenObj.token,
        messageTitle: "New Booking",
        messageBody: `${user.username || 'Someone'} has booked your ${post.carMake} ${post.carModel}.`,
        bookingId: post._id,
      });
    }
    
    
    for (const tokenObj of renterTokens) {
      await ctx.scheduler.runAfter(0, internal.push.sendPushNotification, {
        pushToken: tokenObj.token,
        messageTitle: "Booking Confirmed",
        messageBody: `Your booking for ${post.carMake} ${post.carModel} has been confirmed.`,
        bookingId: post._id,
      });
    }
    
    return bookingId;
  },
});