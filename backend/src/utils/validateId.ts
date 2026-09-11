import { ApiError } from "./ApiError";

// Basic CUID sanity check to return a clean 400 instead of a database error for malformed ids
export function assertValidId(id: string, label = "id"): void {
  if (!/^[a-zA-Z0-9_-]{20,40}$/.test(id)) {
    throw new ApiError(400, `Invalid ${label} format`);
  }
}
