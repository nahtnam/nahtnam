import { ORPCError, onError, ValidationError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import z from "zod";
import { fromZodError } from "zod-validation-error";
import { logger } from "@/lib/logtape";
import { routes } from "./routes";

export const handler = new RPCHandler(routes, {
  clientInterceptors: [
    onError((error) => {
      if (
        error instanceof ORPCError &&
        error.code === "BAD_REQUEST" &&
        error.cause instanceof ValidationError
      ) {
        // If you only use Zod you can safely cast to ZodIssue[]
        const zodError = new z.ZodError(
          error.cause.issues as z.core.$ZodIssue[]
        );

        throw new ORPCError("INPUT_VALIDATION_FAILED", {
          cause: error.cause,
          data: z.flattenError(zodError),
          message: fromZodError(zodError, { includePath: false, prefix: null })
            .message,
          status: 422,
        });
      }

      if (
        error instanceof ORPCError &&
        error.code === "INTERNAL_SERVER_ERROR" &&
        error.cause instanceof ValidationError
      ) {
        throw new ORPCError("OUTPUT_VALIDATION_FAILED", {
          cause: error.cause,
        });
      }
    }),
  ],
  interceptors: [
    onError((error) => {
      logger.error(String(error));
    }),
  ],
});
