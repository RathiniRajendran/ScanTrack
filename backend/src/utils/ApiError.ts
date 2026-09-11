// Custom error class carrying an HTTP status and optional field-level error details
export class ApiError extends Error {
  public statusCode: number;
  public errors?: string[];

  constructor(statusCode: number, message: string, errors?: string[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
