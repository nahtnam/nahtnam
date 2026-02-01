import type { InferRouterInputs, InferRouterOutputs } from "@orpc/server";
import type { routes } from "../routes";

export type Inputs = InferRouterInputs<typeof routes>;
export type Outputs = InferRouterOutputs<typeof routes>;
