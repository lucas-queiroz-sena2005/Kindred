/**
 * Base class for custom API errors, containing a status code.
 */
export class ApiError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    // Set the prototype explicitly to ensure 'instanceof' works correctly
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Represents a user input validation error (HTTP 400).
 */
export class ValidationError extends ApiError {
  constructor(message = "Input validation failed") {
    super(message, 400);
  }
}

/**
 * Represents a resource conflict, e.g., a user already exists (HTTP 409).
 */
export class ConflictError extends ApiError {
  constructor(message = "Resource already exists") {
    super(message, 409);
  }
}
