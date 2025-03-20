import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";


export const getTrackedVehicles = query({
  args: {
    role: v.string(),
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
    
    
    if (args.role === "owner") {
      return await ctx.db
        .query("vehicleTracking")
        .filter(q => q.eq(q.field("ownerId"), user._id))
        .order("desc")
        .collect();
    } else if (args.role === "renter") {
      return await ctx.db
        .query("vehicleTracking")
        .filter(q => q.eq(q.field("renterId"), user._id))
        .order("desc")
        .collect();
    } else {
      throw new Error("Invalid role specified");
    }
  }
});

export const getVehicleTrackingDetails = query({
  args: {
    trackingId: v.id("vehicleTracking"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const tracking = await ctx.db.get(args.trackingId);
    
    if (!tracking) {
      throw new Error("Tracking record not found");
    }
    
  
    const booking = await ctx.db.get(tracking.bookingId);
    const car = await ctx.db.get(tracking.postId);
    
    if (!booking || !car) {
      throw new Error("Associated booking or car not found");
    }
    
  
    const renter = await ctx.db.get(tracking.renterId);
    
    return {
      tracking,
      booking,
      car,
      renter: renter ? {
        _id: renter._id,
        username: renter.username,
        imageUrl: renter.imageUrl,
      } : null,
    };
  }
});


export const startVehicleTracking = mutation({
  args: {
    bookingId: v.id("bookings"),
    initialLatitude: v.number(),
    initialLongitude: v.number(),
    boundaries: v.optional(v.object({
      maxLatitude: v.number(),
      minLatitude: v.number(),
      maxLongitude: v.number(),
      minLongitude: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const booking = await ctx.db.get(args.bookingId);
    
    if (!booking) {
      throw new Error("Booking not found");
    }
    
  
    const existingTracking = await ctx.db
      .query("vehicleTracking")
      .filter(q => q.eq(q.field("bookingId"), args.bookingId))
      .first();
    
    if (existingTracking) {
      throw new Error("Vehicle tracking already started for this booking");
    }
    
    const timestamp = new Date().toISOString();
    
    const trackingId = await ctx.db.insert("vehicleTracking", {
      bookingId: args.bookingId,
      postId: booking.postId,
      renterId: booking.renterId,
      ownerId: booking.ownerId,
      status: "active",
      currentLocation: {
        latitude: args.initialLatitude,
        longitude: args.initialLongitude,
      },
      locationHistory: [{
        latitude: args.initialLatitude,
        longitude: args.initialLongitude,
        timestamp,
      }],
      startedAt: timestamp,
      lastUpdatedAt: timestamp,
      boundaries: args.boundaries,
      alerts: [],
    });
    
  
    await ctx.db.insert("notifications", {
      userId: booking.ownerId,
      type: "tracking_started",
      content: `Tracking has started for your rented vehicle.`,
      isRead: false,
      createdAt: timestamp,
      relatedId: booking.postId,
    });
    
    const ownerTokens = await ctx.db
      .query("pushTokens")
      .filter(q => q.eq(q.field("userId"), booking.ownerId))
      .collect();
    
    for (const tokenObj of ownerTokens) {
      await ctx.scheduler.runAfter(0, internal.push.sendPushNotification, {
        pushToken: tokenObj.token,
        messageTitle: "Vehicle Tracking Started",
        messageBody: `You can now monitor your rented vehicle's location.`,
        bookingId: args.bookingId
      });
    }
    
    return trackingId;
  }
});
export const updateVehicleLocation = mutation({
  args: {
    trackingId: v.id("vehicleTracking"),
    latitude: v.number(),
    longitude: v.number(),
  },
  handler: async (ctx, args) => {
    const tracking = await ctx.db.get(args.trackingId);
    
    if (!tracking) {
      throw new Error("Tracking record not found");
    }
    
    if (tracking.status !== "active") {
      throw new Error("Tracking is not active");
    }
    
    const timestamp = new Date().toISOString();
    
  
    const updatedHistory = [
      ...tracking.locationHistory.slice(-999),
      {
        latitude: args.latitude,
        longitude: args.longitude,
        timestamp,
      }
    ];
    

    let alerts = tracking.alerts || [];
    if (tracking.boundaries) {
      if (args.latitude > tracking.boundaries.maxLatitude ||
          args.latitude < tracking.boundaries.minLatitude ||
          args.longitude > tracking.boundaries.maxLongitude ||
          args.longitude < tracking.boundaries.minLongitude) {
        
        
        const hasUnresolvedBoundaryAlert = alerts.some(
          alert => alert.type === "boundary_exit" && !alert.resolved
        );
        
        if (!hasUnresolvedBoundaryAlert) {
          alerts = [
            ...alerts,
            {
              type: "boundary_exit",
              timestamp,
              details: `Vehicle has left the designated area.`,
              resolved: false,
            }
          ];
          
        
          await ctx.db.insert("notifications", {
            userId: tracking.ownerId,
            type: "boundary_violation",
            content: `Your rented vehicle has left the designated area.`,
            isRead: false,
            createdAt: timestamp,
            relatedId: tracking.postId,
          });
          
          
          const ownerTokens = await ctx.db
            .query("pushTokens")
            .filter(q => q.eq(q.field("userId"), tracking.ownerId))
            .collect();
          
          for (const tokenObj of ownerTokens) {
            await ctx.scheduler.runAfter(0, internal.push.sendPushNotification, {
              pushToken: tokenObj.token,
              messageTitle: "Boundary Alert",
              messageBody: `Your rented vehicle has left the designated area.`,
              bookingId: tracking.bookingId
            });
          }
        }
      } else {
      
        alerts = alerts.map(alert => {
          if (alert.type === "boundary_exit" && !alert.resolved) {
            return { ...alert, resolved: true };
          }
          return alert;
        });
      }
    }
    

    return await ctx.db.patch(args.trackingId, {
      currentLocation: {
        latitude: args.latitude,
        longitude: args.longitude,
      },
      locationHistory: updatedHistory,
      lastUpdatedAt: timestamp,
      alerts,
    });
  }
});

export const endVehicleTracking = mutation({
  args: {
    trackingId: v.id("vehicleTracking"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const tracking = await ctx.db.get(args.trackingId);
    
    if (!tracking) {
      throw new Error("Tracking record not found");
    }
    
    const timestamp = new Date().toISOString();
    
    
    await ctx.db.patch(args.trackingId, {
      status: "completed",
      endedAt: timestamp,
      lastUpdatedAt: timestamp,
    });
    
    await ctx.db.insert("notifications", {
      userId: tracking.ownerId,
      type: "tracking_ended",
      content: `Tracking has ended for your rented vehicle.`,
      isRead: false,
      createdAt: timestamp,
      relatedId: tracking.postId,
    });
    
    await ctx.db.insert("notifications", {
      userId: tracking.renterId,
      type: "tracking_ended",
      content: `Vehicle tracking has ended for your rental.`,
      isRead: false,
      createdAt: timestamp,
      relatedId: tracking.postId,
    });
    
    return {
      success: true,
    };
  }
});

export const getActiveTrackedVehiclesForMap = query({
  handler: async (ctx) => {
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
    
    // Get all active tracking records where user is either owner or renter
    const trackingRecords = await ctx.db
      .query("vehicleTracking")
      .filter(q => 
        q.and(
          q.eq(q.field("status"), "active"),
          q.or(
            q.eq(q.field("ownerId"), user._id),
            q.eq(q.field("renterId"), user._id)
          )
        )
      )
      .collect();
    
    // Get all the related car and booking information
    const enhancedRecords = await Promise.all(trackingRecords.map(async (record) => {
      const car = await ctx.db.get(record.postId);
      const booking = await ctx.db.get(record.bookingId);
      
      return {
        id: record._id,
        tracking: record,
        car: car ? {
          id: car._id,
          make: car.carMake,
          model: car.carModel,
          year: car.carYear,
          image: car.carImageUrl?.[0] || null,
          registration: car.carReg,
        } : null,
        booking: booking ? {
          id: booking._id,
          startDate: booking.startDate,
          endDate: booking.endDate,
          status: booking.status,
        } : null,
        coordinates: {
          latitude: record.currentLocation.latitude,
          longitude: record.currentLocation.longitude,
        },
        userRole: record.ownerId === user._id ? "owner" : "renter",
      };
    }));
    
    return enhancedRecords;
  }
});

// Set or update geofence boundaries for a tracked vehicle
export const setTrackingBoundaries = mutation({
  args: {
    trackingId: v.id("vehicleTracking"),
    boundaries: v.object({
      maxLatitude: v.number(),
      minLatitude: v.number(),
      maxLongitude: v.number(),
      minLongitude: v.number(),
    }),
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
    
    const tracking = await ctx.db.get(args.trackingId);
    
    if (!tracking) {
      throw new Error("Tracking record not found");
    }
    
    // Check if user is the owner
    if (tracking.ownerId !== user._id) {
      throw new Error("Only the owner can set tracking boundaries");
    }
    
    return await ctx.db.patch(args.trackingId, {
      boundaries: args.boundaries,
      lastUpdatedAt: new Date().toISOString(),
    });
  }
});

// Resolve an alert
export const resolveTrackingAlert = mutation({
  args: {
    trackingId: v.id("vehicleTracking"),
    alertIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    const tracking = await ctx.db.get(args.trackingId);
    
    if (!tracking) {
      throw new Error("Tracking record not found");
    }
    
    if (!tracking.alerts || args.alertIndex >= tracking.alerts.length) {
      throw new Error("Alert not found");
    }
    
    const updatedAlerts = tracking.alerts.map((alert, index) => {
      if (index === args.alertIndex) {
        return { ...alert, resolved: true };
      }
      return alert;
    });
    
    return await ctx.db.patch(args.trackingId, {
      alerts: updatedAlerts,
      lastUpdatedAt: new Date().toISOString(),
    });
  }
});