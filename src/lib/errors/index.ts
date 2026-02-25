/* eslint-disable unicorn/throw-new-error */
import { Define } from "within-ts";

export class NotFoundError extends Define.Error("NotFound")() {}

export class UnauthorizedError extends Define.Error("Unauthorized")() {}

export class ValidationError extends Define.Error("Validation")<{
  readonly field: string;
  readonly message: string;
}>() {}
