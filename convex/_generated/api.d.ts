/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as booking from "../booking.js";
import type * as earnings from "../earnings.js";
import type * as file from "../file.js";
import type * as flutterwave from "../flutterwave.js";
import type * as http from "../http.js";
import type * as post from "../post.js";
import type * as subaccounts from "../subaccounts.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  booking: typeof booking;
  earnings: typeof earnings;
  file: typeof file;
  flutterwave: typeof flutterwave;
  http: typeof http;
  post: typeof post;
  subaccounts: typeof subaccounts;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
