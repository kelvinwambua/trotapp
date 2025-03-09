import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { Id } from './_generated/dataModel';

export const startTracking = mutation({
  args: {
    bookingId: v.id('bookings'),
    initialLocation: v.object({
      latitude: v.number(),
      longitude: v.number(),
      timestamp: v.number(),
    }),
    trackingSettings: v.optional(v.object({
      updateFrequency: v.optional(v.number()),
      privacyMode: v.optional(v.string()),
      geofenceRadius: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    // Get the booking to verify permissions
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check if tracking already exists
    const existingTracking = await ctx.db
      .query('carTracking')
      .filter(q => q.eq(q.field('bookingId'), args.bookingId))
      .first();

    if (existingTracking) {
      // Update existing tracking
      return await ctx.db.patch(existingTracking._id, {
        lastLocation: args.initialLocation,
        locationHistory: [...existingTracking.locationHistory, args.initialLocation],
        activeSharing: true,
        consentGranted: true,
        lastUpdateRequest: Date.now(),
        trackingSettings: args.trackingSettings || existingTracking.trackingSettings,
      });
    } else {
      // Create new tracking
      return await ctx.db.insert('carTracking', {
        bookingId: args.bookingId,
        lastLocation: args.initialLocation,
        locationHistory: [args.initialLocation],
        activeSharing: true,
        consentGranted: true,
        lastUpdateRequest: Date.now(),
        trackingSettings: args.trackingSettings || {
          updateFrequency: 60000, // Default: update every minute
          privacyMode: 'standard',
          geofenceRadius: 500, // 500 meters
        },
      });
    }
  },
});

export const stopTracking = mutation({
  args: {
    bookingId: v.id('bookings'),
  },
  handler: async (ctx, args) => {
    const tracking = await ctx.db
      .query('carTracking')
      .filter(q => q.eq(q.field('bookingId'), args.bookingId))
      .first();

    if (!tracking) {
      throw new Error('Tracking not found');
    }

    return await ctx.db.patch(tracking._id, {
      activeSharing: false,
      lastUpdateRequest: Date.now(),
    });
  },
});

export const updateLocation = mutation({
  args: {
    bookingId: v.id('bookings'),
    location: v.object({
      latitude: v.number(),
      longitude: v.number(),
      timestamp: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const tracking = await ctx.db
      .query('carTracking')
      .filter(q => q.eq(q.field('bookingId'), args.bookingId))
      .first();

    if (!tracking) {
      throw new Error('Tracking not found');
    }

    if (!tracking.activeSharing) {
      throw new Error('Tracking is not active for this booking');
    }

    // Add new location to history and update last location
    return await ctx.db.patch(tracking._id, {
      lastLocation: args.location,
      locationHistory: [...tracking.locationHistory, args.location],
      lastUpdateRequest: Date.now(),
    });
  },
});

export const getActiveTrackings = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    // Find bookings where the user is either the renter or owner
    const bookings = await ctx.db
      .query('bookings')
      .filter(q => 
        q.or(
          q.eq(q.field('renterId'), args.userId),
          q.eq(q.field('ownerId'), args.userId)
        )
      )
      .filter(q => q.eq(q.field('status'), 'active'))
      .collect();

    if (bookings.length === 0) {
      return [];
    }

    // Get tracking info for these bookings
    const bookingIds = bookings.map(booking => booking._id);
    const trackings = await Promise.all(
      bookingIds.map(async (bookingId) => {
        const tracking = await ctx.db
          .query('carTracking')
          .filter(q => q.eq(q.field('bookingId'), bookingId))
          .filter(q => q.eq(q.field('activeSharing'), true))
          .first();
        
        if (!tracking) return null;

        const booking = bookings.find(b => b._id === bookingId);
        if (!booking) return null;

        // Get car details
        const post = await ctx.db.get(booking.postId);
        if (!post) return null;

        // Get user details (either owner or renter, depending on who is viewing)
        const otherUserId = booking.renterId === args.userId ? booking.ownerId : booking.renterId;
        const otherUser = await ctx.db.get(otherUserId);
        if (!otherUser) return null;

        // Get car image
        let carImageUrl = null;
        if (post.carImageUrl && post.carImageUrl.length > 0) {
          try {
            carImageUrl = await ctx.storage.getUrl(post.carImageUrl[0] as Id<'_storage'>);
          } catch (error) {
            console.error('Failed to get car image URL:', error);
          }
        }

        return {
          trackingId: tracking._id,
          bookingId: booking._id,
          startDate: booking.startDate,
          endDate: booking.endDate,
          carDetails: {
            id: post._id,
            make: post.carMake,
            model: post.carModel,
            year: post.carYear,
            registration: post.carReg,
            imageUrl: carImageUrl,
          },
          userDetails: {
            id: otherUser._id,
            name: `${otherUser.first_name || ''} ${otherUser.last_name || ''}`.trim(),
            imageUrl: otherUser.imageUrl,
            role: booking.renterId === args.userId ? 'owner' : 'renter',
          },
          lastLocation: tracking.lastLocation,
          lastUpdated: new Date(tracking.lastLocation.timestamp).toISOString(),
          isActive: tracking.activeSharing,
        };
      })
    );

    return trackings.filter(Boolean);
  },
});

export const getTrackingDetails = query({
  args: {
    bookingId: v.id('bookings'),
  },
  handler: async (ctx, args) => {
    const tracking = await ctx.db
      .query('carTracking')
      .filter(q => q.eq(q.field('bookingId'), args.bookingId))
      .first();

    if (!tracking) {
      return null;
    }

    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      return null;
    }

    const post = await ctx.db.get(booking.postId);
    if (!post) {
      return null;
    }

    const owner = await ctx.db.get(booking.ownerId);
    const renter = await ctx.db.get(booking.renterId);

    if (!owner || !renter) {
      return null;
    }

    let carImageUrl = null;
    if (post.carImageUrl && post.carImageUrl.length > 0) {
      try {
        carImageUrl = await ctx.storage.getUrl(post.carImageUrl[0] as Id<'_storage'>);
      } catch (error) {
        console.error('Failed to get car image URL:', error);
      }
    }

    // Calculate distance traveled if we have a history
    let distanceTraveled = 0;
    if (tracking.locationHistory.length > 1) {
      for (let i = 1; i < tracking.locationHistory.length; i++) {
        const prevLoc = tracking.locationHistory[i - 1];
        const currLoc = tracking.locationHistory[i];
        
        // Calculate distance between points (simple Haversine formula)
        const R = 6371; // Earth radius in km
        const dLat = (currLoc.latitude - prevLoc.latitude) * Math.PI / 180;
        const dLon = (currLoc.longitude - prevLoc.longitude) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(prevLoc.latitude * Math.PI / 180) * Math.cos(currLoc.latitude * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        distanceTraveled += distance;
      }
    }

    return {
      trackingId: tracking._id,
      bookingId: booking._id,
      startDate: booking.startDate,
      endDate: booking.endDate,
      carDetails: {
        id: post._id,
        make: post.carMake,
        model: post.carModel,
        year: post.carYear,
        registration: post.carReg,
        imageUrl: carImageUrl,
      },
      ownerDetails: {
        id: owner._id,
        name: `${owner.first_name || ''} ${owner.last_name || ''}`.trim(),
        imageUrl: owner.imageUrl,
      },
      renterDetails: {
        id: renter._id,
        name: `${renter.first_name || ''} ${renter.last_name || ''}`.trim(),
        imageUrl: renter.imageUrl,
      },
      lastLocation: tracking.locationHistory[tracking.locationHistory.length - 1],
      locationHistory: tracking.locationHistory.map(loc => ({
        ...loc,
        time: new Date(loc.timestamp).toISOString()
      })),
      distanceTraveled: parseFloat(distanceTraveled.toFixed(2)),
      tripDuration: tracking.locationHistory.length > 1 ? 
        (tracking.locationHistory[tracking.locationHistory.length - 1].timestamp - 
         tracking.locationHistory[0].timestamp) / 1000 / 60 : 0, // in minutes
      isActive: tracking.activeSharing,
      lastUpdated: new Date(tracking.lastUpdateRequest || Date.now()).toISOString(),
      settings: tracking.trackingSettings,
    };
  },
});