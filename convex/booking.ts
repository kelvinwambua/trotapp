import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

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