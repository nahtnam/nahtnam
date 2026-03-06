/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as blog_mutations from "../blog/mutations.js";
import type * as blog_queries from "../blog/queries.js";
import type * as bnb_actions from "../bnb/actions.js";
import type * as bnb_mutations from "../bnb/mutations.js";
import type * as bnb_queries from "../bnb/queries.js";
import type * as contact_actions from "../contact/actions.js";
import type * as http from "../http.js";
import type * as lib_admin from "../lib/admin.js";
import type * as lib_config_env from "../lib/config/env.js";
import type * as resume_mutations from "../resume/mutations.js";
import type * as resume_queries from "../resume/queries.js";
import type * as travel_airlines from "../travel/airlines.js";
import type * as travel_airports from "../travel/airports.js";
import type * as travel_computeStats from "../travel/computeStats.js";
import type * as travel_mutations from "../travel/mutations.js";
import type * as travel_queries from "../travel/queries.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "blog/mutations": typeof blog_mutations;
  "blog/queries": typeof blog_queries;
  "bnb/actions": typeof bnb_actions;
  "bnb/mutations": typeof bnb_mutations;
  "bnb/queries": typeof bnb_queries;
  "contact/actions": typeof contact_actions;
  http: typeof http;
  "lib/admin": typeof lib_admin;
  "lib/config/env": typeof lib_config_env;
  "resume/mutations": typeof resume_mutations;
  "resume/queries": typeof resume_queries;
  "travel/airlines": typeof travel_airlines;
  "travel/airports": typeof travel_airports;
  "travel/computeStats": typeof travel_computeStats;
  "travel/mutations": typeof travel_mutations;
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
