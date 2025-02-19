import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { Id } from './_generated/dataModel';

export const createPost = mutation({
    args: {
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
        deposit: v.optional(v.number())
    },
    handler: async (ctx, args) => {
        const newPost = {
            ...args,
            views: 0,
            savedBy: [],
            status: 'active'
        };
        return await ctx.db.insert('posts', newPost);
    },
});

export const getAllPosts = query({
    handler: async (ctx) => {
        const posts = await ctx.db.query('posts')
            .order('desc')
            .collect();
        
        console.log("Starting to process posts");

        const processedPosts = await Promise.all(posts.map(async (post) => {
            console.log(`Processing post ${post._id} with image IDs:`, post.carImageUrl);

            if (!post.carImageUrl || !Array.isArray(post.carImageUrl)) {
                console.log(`No image URLs for post ${post._id}`);
                return { 
                    ...post, 
                    carImageUrls: [],
                    ownerDetails: null 
                };
            }

            try {
                const carImageUrls = await Promise.all(
                    post.carImageUrl.map(async (storageId) => {
                        if (typeof storageId !== 'string') {
                            console.log(`Invalid storage ID for post ${post._id}:`, storageId);
                            return null;
                        }
                        try {
                            const url = await ctx.storage.getUrl(storageId as Id<'_storage'>);
                            console.log(`Generated URL for ${storageId}:`, url);
                            return url;
                        } catch (error) {
                            console.error(`Error generating URL for ${storageId}:`, error);
                            return null;
                        }
                    })
                );

                const owner = await ctx.db.get(post.posterId);
                
                const validUrls = carImageUrls.filter((url): url is string => typeof url === 'string');
                console.log(`Final URLs for post ${post._id}:`, validUrls);

                return {
                    ...post,
                    carImageUrls: validUrls,
                    ownerDetails: owner ? {
                        id: owner._id,
                        name: `${owner.first_name || ''} ${owner.last_name || ''}`.trim(),
                        imageUrl: owner.imageUrl,
                        rating: owner.rating,
                        verificationStatus: owner.verificationStatus
                    } : null
                };
            } catch (error) {
                console.error(`Error processing post ${post._id}:`, error);
                return { 
                    ...post, 
                    carImageUrls: [],
                    ownerDetails: null 
                };
            }
        }));

        console.log("Final processed posts:", processedPosts);
        return processedPosts;
    }
});

export const getPostById = query({
    args: { postId: v.id('posts') },
    handler: async (ctx, args) => {
        const post = await ctx.db.get(args.postId);
        if (!post) return null;

        try {
            const carImageUrls = await Promise.all(
                post.carImageUrl.map(async (storageId) => {
                    if (typeof storageId !== 'string') return null;
                    try {
                        return await ctx.storage.getUrl(storageId as Id<'_storage'>);
                    } catch (error) {
                        console.error(`Error generating URL for ${storageId}:`, error);
                        return null;
                    }
                })
            );

            const owner = await ctx.db.get(post.posterId);
            const validUrls = carImageUrls.filter((url): url is string => typeof url === 'string');

            return {
                ...post,
                carImageUrls: validUrls,
                ownerDetails: owner ? {
                    id: owner._id,
                    name: `${owner.first_name || ''} ${owner.last_name || ''}`.trim(),
                    imageUrl: owner.imageUrl,
                    rating: owner.rating,
                    verificationStatus: owner.verificationStatus
                } : null
            };
        } catch (error) {
            console.error(`Error processing post ${post._id}:`, error);
            return {
                ...post,
                carImageUrls: [],
                ownerDetails: null
            };
        }
    }
});

export const updatePost = mutation({
    args: {
        postId: v.id('posts'),
        updates: v.object({
            carReg: v.optional(v.string()),
            carMake: v.optional(v.string()),
            carModel: v.optional(v.string()),
            carYear: v.optional(v.string()),
            rentRange: v.optional(v.string()),
            carLocation: v.optional(v.string()),
            carDescription: v.optional(v.string()),
            carImageUrl: v.optional(v.array(v.string())),
            fuelType: v.optional(v.string()),
            features: v.optional(v.array(v.string())),
            status: v.optional(v.string()),
            price: v.optional(v.number()),
            mileage: v.optional(v.number()),
            transmission: v.optional(v.string()),
            insurance: v.optional(v.string()),
            availability: v.optional(v.array(v.string())),
            rules: v.optional(v.array(v.string())),
            deposit: v.optional(v.number())
        })
    },
    handler: async (ctx, args) => {
        const { postId, updates } = args;
        const existingPost = await ctx.db.get(postId);
        
        if (!existingPost) {
            throw new Error('Post not found');
        }

        return await ctx.db.patch(postId, updates);
    }
});

export const deletePost = mutation({
    args: { postId: v.id('posts') },
    handler: async (ctx, args) => {
        const existingPost = await ctx.db.get(args.postId);
        
        if (!existingPost) {
            throw new Error('Post not found');
        }

        await ctx.db.delete(args.postId);
        return true;
    }
});

export const incrementViews = mutation({
    args: { postId: v.id('posts') },
    handler: async (ctx, args) => {
        const post = await ctx.db.get(args.postId);
        if (!post) throw new Error('Post not found');
        
        return await ctx.db.patch(args.postId, {
            views: (post.views || 0) + 1
        });
    }
});

export const toggleSavePost = mutation({
    args: { 
        postId: v.id('posts'),
        userId: v.id('users')
    },
    handler: async (ctx, args) => {
        const post = await ctx.db.get(args.postId);
        if (!post) throw new Error('Post not found');

        const savedBy = post.savedBy || [];
        const userIndex = savedBy.findIndex(id => id === args.userId);

        if (userIndex === -1) {
            savedBy.push(args.userId);
        } else {
            savedBy.splice(userIndex, 1);
        }

        return await ctx.db.patch(args.postId, { savedBy });
    }
});

export const getPostsByUser = query({
    args: { userId: v.id('users') },
    handler: async (ctx, args) => {
        const posts = await ctx.db
            .query('posts')
            .filter(q => q.eq(q.field('posterId'), args.userId))
            .collect();

        return Promise.all(posts.map(async (post) => {
            const carImageUrls = await Promise.all(
                post.carImageUrl.map(async (storageId) => {
                    if (typeof storageId !== 'string') return null;
                    try {
                        return await ctx.storage.getUrl(storageId as Id<'_storage'>);
                    } catch {
                        return null;
                    }
                })
            );

            return {
                ...post,
                carImageUrls: carImageUrls.filter((url): url is string => typeof url === 'string')
            };
        }));
    }
});

// export const getSavedPosts = query({
//     args: { userId: v.id('users') },
//     handler: async (ctx, args) => {
//         const posts = await ctx.db
//             .query('posts')
//             .filter(q => q.includes(q.field('savedBy'), args.userId))
//             .collect();

//         return Promise.all(posts.map(async (post) => {
//             const carImageUrls = await Promise.all(
//                 post.carImageUrl.map(async (storageId) => {
//                     if (typeof storageId !== 'string') return null;
//                     try {
//                         return await ctx.storage.getUrl(storageId as Id<'_storage'>);
//                     } catch {
//                         return null;
//                     }
//                 })
//             );

//             const owner = await ctx.db.get(post.posterId);

//             return {
//                 ...post,
//                 carImageUrls: carImageUrls.filter((url): url is string => typeof url === 'string'),
//                 ownerDetails: owner ? {
//                     id: owner._id,
//                     name: `${owner.first_name || ''} ${owner.last_name || ''}`.trim(),
//                     imageUrl: owner.imageUrl,
//                     rating: owner.rating,
//                     verificationStatus: owner.verificationStatus
//                 } : null
//             };
//         }));
//     }
// });
export const getUserCars = query({
  args: {
    userId: v.string()
  },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query('posts')
      .filter(q => q.eq(q.field('posterId'), args.userId))
      .collect();

    console.log(`Fetching posts for user ${args.userId}`);

    const processedPosts = await Promise.all(posts.map(async (post) => {
      console.log(`Processing post ${post._id} with image IDs:`, post.carImageUrl);

      if (!post.carImageUrl || !Array.isArray(post.carImageUrl)) {
        console.log(`No image URLs for post ${post._id}`);
        return { ...post, carImageUrls: [] };
      }

      try {
        const carImageUrls = await Promise.all(
          post.carImageUrl.map(async (storageId) => {
            if (typeof storageId !== 'string') {
              console.log(`Invalid storage ID for post ${post._id}:`, storageId);
              return null;
            }
            try {
              const url = await ctx.storage.getUrl(storageId as Id<'_storage'>);
              console.log(`Generated URL for ${storageId}:`, url);
              return url;
            } catch (error) {
              console.error(`Error generating URL for ${storageId}:`, error);
              return null;
            }
          })
        );

        const validUrls = carImageUrls.filter((url): url is string => typeof url === 'string');
        console.log(`Final URLs for post ${post._id}:`, validUrls);

        return {
          ...post,
          carImageUrls: validUrls
        };
      } catch (error) {
        console.error(`Error processing post ${post._id}:`, error);
        return { ...post, carImageUrls: [] };
      }
    }));

    console.log("Final processed user posts:", processedPosts);
    return processedPosts;
  }
});
export const searchPosts = query({
    args: {
        searchTerm: v.string(),
        filters: v.optional(v.object({
            make: v.optional(v.string()),
            model: v.optional(v.string()),
            location: v.optional(v.string()),
            minPrice: v.optional(v.number()),
            maxPrice: v.optional(v.number()),
            transmission: v.optional(v.string()),
            fuelType: v.optional(v.string())
        }))
    },
    handler: async (ctx, args) => {
        let query = ctx.db.query('posts');

        if (args.filters) {
            const { make, model, location, minPrice, maxPrice, transmission, fuelType } = args.filters;
            
            if (make) query = query.filter(q => q.eq(q.field('carMake'), make));
            if (model) query = query.filter(q => q.eq(q.field('carModel'), model));
            if (location) query = query.filter(q => q.eq(q.field('carLocation'), location));
            if (minPrice) query = query.filter(q => q.gte(q.field('price'), minPrice));
            if (maxPrice) query = query.filter(q => q.lte(q.field('price'), maxPrice));
            if (transmission) query = query.filter(q => q.eq(q.field('transmission'), transmission));
            if (fuelType) query = query.filter(q => q.eq(q.field('fuelType'), fuelType));
        }

        const posts = await query.collect();

        return Promise.all(posts.map(async (post) => {
            const carImageUrls = await Promise.all(
                post.carImageUrl.map(async (storageId) => {
                    if (typeof storageId !== 'string') return null;
                    try {
                        return await ctx.storage.getUrl(storageId as Id<'_storage'>);
                    } catch {
                        return null;
                    }
                })
            );

            const owner = await ctx.db.get(post.posterId);

            return {
                ...post,
                carImageUrls: carImageUrls.filter((url): url is string => typeof url === 'string'),
                ownerDetails: owner ? {
                    id: owner._id,
                    name: `${owner.first_name || ''} ${owner.last_name || ''}`.trim(),
                    imageUrl: owner.imageUrl,
                    rating: owner.rating,
                    verificationStatus: owner.verificationStatus
                } : null
            };
        }));
    }
});

