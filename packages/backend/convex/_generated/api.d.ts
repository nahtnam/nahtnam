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
import type * as admin_bnb from "../admin/bnb.js";
import type * as admin_golf_r from "../admin/golf_r.js";
import type * as admin_resume from "../admin/resume.js";
import type * as admin_seed_golf_r from "../admin/seed_golf_r.js";
import type * as admin_travel from "../admin/travel.js";
import type * as blog_queries from "../blog/queries.js";
import type * as bnb_actions from "../bnb/actions.js";
import type * as bnb_mutations from "../bnb/mutations.js";
import type * as bnb_queries from "../bnb/queries.js";
import type * as contact_actions from "../contact/actions.js";
import type * as fluent from "../fluent.js";
import type * as golf_r_queries from "../golf_r/queries.js";
import type * as lib_env from "../lib/env.js";
import type * as lib_secrets from "../lib/secrets.js";
import type * as lib_telegram from "../lib/telegram.js";
import type * as lib_tweets from "../lib/tweets.js";
import type * as posthog from "../posthog.js";
import type * as print_jobs from "../print_jobs.js";
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
  "admin/bnb": typeof admin_bnb;
  "admin/golf_r": typeof admin_golf_r;
  "admin/resume": typeof admin_resume;
  "admin/seed_golf_r": typeof admin_seed_golf_r;
  "admin/travel": typeof admin_travel;
  "blog/queries": typeof blog_queries;
  "bnb/actions": typeof bnb_actions;
  "bnb/mutations": typeof bnb_mutations;
  "bnb/queries": typeof bnb_queries;
  "contact/actions": typeof contact_actions;
  fluent: typeof fluent;
  "golf_r/queries": typeof golf_r_queries;
  "lib/env": typeof lib_env;
  "lib/secrets": typeof lib_secrets;
  "lib/telegram": typeof lib_telegram;
  "lib/tweets": typeof lib_tweets;
  posthog: typeof posthog;
  print_jobs: typeof print_jobs;
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

export declare const components: {
  migrations: import("@convex-dev/migrations/_generated/component.js").ComponentApi<"migrations">;
  posthog: import("@posthog/convex/_generated/component.js").ComponentApi<"posthog">;
  workflow: import("@convex-dev/workflow/_generated/component.js").ComponentApi<"workflow">;
};
