import { AssetStatus } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";

const VALID_STATUSES = Object.values(AssetStatus);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

// Treats empty string as "no value" so optional relation fields (e.g. locationId: "") are normalized to null
const normalizeOptionalId = (value: unknown): string | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "string" && value.trim().length === 0) return null;
  if (typeof value === "string") return value;
  return undefined;
};

export function validateCreateAsset(req: Request, _res: Response, next: NextFunction): void {
  const body = req.body ?? {};
  const errors: string[] = [];

  if (!isNonEmptyString(body.assetCode)) errors.push("assetCode is required and must be a non-empty string");
  if (!isNonEmptyString(body.name)) errors.push("name is required and must be a non-empty string");
  if (!isNonEmptyString(body.category)) errors.push("category is required and must be a non-empty string");

  if (body.serialNumber !== undefined && body.serialNumber !== null && body.serialNumber !== "" && typeof body.serialNumber !== "string") {
    errors.push("serialNumber must be a string");
  }
  if (body.rfidTag !== undefined && body.rfidTag !== null && body.rfidTag !== "" && typeof body.rfidTag !== "string") {
    errors.push("rfidTag must be a string");
  }

  if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  if (body.locationId !== undefined && body.locationId !== null && body.locationId !== "" && typeof body.locationId !== "string") {
    errors.push("locationId must be a string");
  }
  if (body.assignedToId !== undefined && body.assignedToId !== null && body.assignedToId !== "" && typeof body.assignedToId !== "string") {
    errors.push("assignedToId must be a string");
  }

  if (errors.length > 0) {
    next(new ApiError(400, "Validation failed", errors));
    return;
  }

  req.body.serialNumber = normalizeOptionalId(body.serialNumber);
  req.body.rfidTag = normalizeOptionalId(body.rfidTag);
  req.body.locationId = normalizeOptionalId(body.locationId);
  req.body.assignedToId = normalizeOptionalId(body.assignedToId);

  next();
}

export function validateUpdateAsset(req: Request, _res: Response, next: NextFunction): void {
  const body = req.body ?? {};
  const errors: string[] = [];

  if (body.name !== undefined && !isNonEmptyString(body.name)) errors.push("name must be a non-empty string");
  if (body.category !== undefined && !isNonEmptyString(body.category)) errors.push("category must be a non-empty string");

  if (body.serialNumber !== undefined && body.serialNumber !== null && body.serialNumber !== "" && typeof body.serialNumber !== "string") {
    errors.push("serialNumber must be a string");
  }
  if (body.rfidTag !== undefined && body.rfidTag !== null && body.rfidTag !== "" && typeof body.rfidTag !== "string") {
    errors.push("rfidTag must be a string");
  }

  if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  if (body.locationId !== undefined && body.locationId !== null && body.locationId !== "" && typeof body.locationId !== "string") {
    errors.push("locationId must be a string");
  }
  if (body.assignedToId !== undefined && body.assignedToId !== null && body.assignedToId !== "" && typeof body.assignedToId !== "string") {
    errors.push("assignedToId must be a string");
  }

  if (Object.keys(body).length === 0) {
    errors.push("At least one field must be provided to update");
  }

  if (errors.length > 0) {
    next(new ApiError(400, "Validation failed", errors));
    return;
  }

  if (body.serialNumber !== undefined) req.body.serialNumber = normalizeOptionalId(body.serialNumber);
  if (body.rfidTag !== undefined) req.body.rfidTag = normalizeOptionalId(body.rfidTag);
  if (body.locationId !== undefined) req.body.locationId = normalizeOptionalId(body.locationId);
  if (body.assignedToId !== undefined) req.body.assignedToId = normalizeOptionalId(body.assignedToId);

  next();
}

export function validateUpdateAssetLocation(req: Request, _res: Response, next: NextFunction): void {
  const body = req.body ?? {};

  if (!isNonEmptyString(body.locationId)) {
    next(new ApiError(400, "Validation failed", ["locationId is required and must be a non-empty string"]));
    return;
  }

  next();
}
