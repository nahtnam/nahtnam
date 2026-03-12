/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin_auth from "../admin/auth.js";
import type * as admin_blog from "../admin/blog.js";
import type * as admin_resume from "../admin/resume.js";
import type * as admin_travel from "../admin/travel.js";
import type * as blog_queries from "../blog/queries.js";
import type * as bnb_actions from "../bnb/actions.js";
import type * as bnb_mutations from "../bnb/mutations.js";
import type * as bnb_queries from "../bnb/queries.js";
import type * as contact_actions from "../contact/actions.js";
import type * as http from "../http.js";
import type * as lib_builder from "../lib/builder.js";
import type * as lib_config_env from "../lib/config/env.js";
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
  "admin/auth": typeof admin_auth;
  "admin/blog": typeof admin_blog;
  "admin/resume": typeof admin_resume;
  "admin/travel": typeof admin_travel;
  "blog/queries": typeof blog_queries;
  "bnb/actions": typeof bnb_actions;
  "bnb/mutations": typeof bnb_mutations;
  "bnb/queries": typeof bnb_queries;
  "contact/actions": typeof contact_actions;
  http: typeof http;
  "lib/builder": typeof lib_builder;
  "lib/config/env": typeof lib_config_env;
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
