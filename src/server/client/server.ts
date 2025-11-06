import "server-only";
import { createRouterClient } from "@orpc/server";
import { routes } from "../routes";

globalThis.$orpcClient = createRouterClient(routes, {});
