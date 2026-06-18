export class NotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

type ValidationErrorOptions = {
  readonly field: string;
  readonly message: string;
};

export class ValidationError extends Error {
  readonly field: string;

  constructor(options: ValidationErrorOptions) {
    super(options.message);
    this.name = "ValidationError";
    this.field = options.field;
  }
}
