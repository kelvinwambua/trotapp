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
        fuelType: v.optional(v.string()),
        features: v.array(v.string()),
        carImageUrl: v.array(v.string()), 
        postDate: v.string()
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert('posts', {...args});
    },
});

export const getAllPosts = query({
  handler: async (ctx) => {
    const posts = await ctx.db.query('posts').collect();
    console.log("Starting to process posts");

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

    console.log("Final processed posts:", processedPosts);
    return processedPosts;
  }
});
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