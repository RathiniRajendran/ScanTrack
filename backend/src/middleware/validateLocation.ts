import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export function validateCreateLocation(req: Request, _res: Response, next: NextFunction): void {
  const body = req.body ?? {};
  const errors: string[] = [];

  if (!isNonEmptyString(body.name)) errors.push("name is required and must be a non-empty string");
  if (!isNonEmptyString(body.building)) errors.push("building is required and must be a non-empty string");
  if (!isNonEmptyString(body.room)) errors.push("room is required and must be a non-empty string");
  if (body.description !== undefined && body.description !== null && typeof body.description !== "string") {
    errors.push("description must be a string");
  }

  if (errors.length > 0) {
    next(new ApiError(400, "Validation failed", errors));
    return;
  }

  next();
}

export function validateUpdateLocation(req: Request, _res: Response, next: NextFunction): void {
  const body = req.body ?? {};
  const errors: string[] = [];

  if (body.name !== undefined && !isNonEmptyString(body.name)) errors.push("name must be a non-empty string");
  if (body.building !== undefined && !isNonEmptyString(body.building)) errors.push("building must be a non-empty string");
  if (body.room !== undefined && !isNonEmptyString(body.room)) errors.push("room must be a non-empty string");
  if (body.description !== undefined && body.description !== null && typeof body.description !== "string") {
    errors.push("description must be a string");
  }
  if (Object.keys(body).length === 0) errors.push("At least one field must be provided to update");

  if (errors.length > 0) {
    next(new ApiError(400, "Validation failed", errors));
    return;
  }

  next();
}
