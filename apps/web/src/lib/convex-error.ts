import { ConvexError } from "convex/values";

type IsConvexErrorCodeOptions = {
  code: string;
  error: unknown;
};

export function isConvexErrorCode(options: IsConvexErrorCodeOptions) {
  const { code, error } = options;
  if (!(error instanceof ConvexError) || typeof error.data !== "object") {
    return false;
  }

  return (
    error.data !== null && "code" in error.data && error.data.code === code
  );
}
