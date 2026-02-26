/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as blog_queries from "../blog/queries.js";
import type * as contact_actions from "../contact/actions.js";
import type * as http from "../http.js";
import type * as resume_queries from "../resume/queries.js";
import type * as travel_airlines from "../travel/airlines.js";
import type * as travel_airports from "../travel/airports.js";
import type * as travel_computeStats from "../travel/computeStats.js";
import type * as travel_queries from "../travel/queries.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "blog/queries": typeof blog_queries;
  "contact/actions": typeof contact_actions;
  http: typeof http;
  "resume/queries": typeof resume_queries;
  "travel/airlines": typeof travel_airlines;
  "travel/airports": typeof travel_airports;
  "travel/computeStats": typeof travel_computeStats;
  "travel/queries": typeof travel_queries;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
