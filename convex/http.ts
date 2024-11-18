import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { httpRouter, HttpRouter } from "convex/server";

const http = httpRouter();

export const doSomething = httpAction(async (ctx, request) => {
  // implementation will be here
  console.log("Hello from convex/http.ts");
  const {data, type} = await request.json()
  switch(type){
    case "user.created":
        await ctx.runMutation(internal.users.createUser, {
            clerkId: data.id,
            first_name: data.first_name || null, 
            last_name: data.last_name || null, 
            email: data.email_addresses[0].email_address,
            imageUrl: data.image_url,
            username: data.username || "",
            bio: data.bio || "",
            websiteUrl: data.website_url || "",
            MoneyEarned: 0,
            MoneySpent: 0,
            RentCount: 0,
            RenteeCount: 0,
            
            
            });
      break;
    case "user.updated":
      console.log("User updated", data)
      break;
    case "user.deleted":
      await ctx.runMutation(internal.users.deleteFromClerk, {clerkUserId: data.id});
      break;
    default:
      break;
  }
  return new Response(null, {status: 200});
});
//https://academic-goose-442.convex.site/clerk-users-webhook

http.route({
    path:"/clerk-users-webhook",
    method: "POST",
    handler:doSomething,
})
export default http;