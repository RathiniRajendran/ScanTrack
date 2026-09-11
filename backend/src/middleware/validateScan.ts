import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export function validateCreateScan(req: Request, _res: Response, next: NextFunction): void {
  const body = req.body ?? {};
  const errors: string[] = [];

  if (!isNonEmptyString(body.rfidTag)) errors.push("rfidTag is required and must be a non-empty string");
  if (body.locationId !== undefined && body.locationId !== null && body.locationId !== "" && typeof body.locationId !== "string") {
    errors.push("locationId must be a string");
  }
  if (body.scannedById !== undefined && body.scannedById !== null && body.scannedById !== "" && typeof body.scannedById !== "string") {
    errors.push("scannedById must be a string");
  }

  if (errors.length > 0) {
    next(new ApiError(400, "Validation failed", errors));
    return;
  }

  req.body.locationId = body.locationId ? body.locationId : null;
  req.body.scannedById = body.scannedById ? body.scannedById : null;

  next();
}
