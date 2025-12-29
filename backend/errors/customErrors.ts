export class ApiError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    // Set the prototype explicitly to ensure 'instanceof' works correctly
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends ApiError {
  constructor(message = "Input validation failed") {
    super(message, 400);
  }
}

export class ConflictError extends ApiError {
  constructor(message = "Resource already exists") {
    super(message, 409);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Invalid credentials") {
    super(message, 401);
  }
}
