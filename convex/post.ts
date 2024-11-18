export const current = query({
    args: {},
    handler: async (ctx) => {
      return await getCurrentUser(ctx);
    },
  });