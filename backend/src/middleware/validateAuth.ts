import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegister(req: Request, _res: Response, next: NextFunction): void {
  const body = req.body ?? {};
  const errors: string[] = [];

  if (!isNonEmptyString(body.name)) errors.push("name is required and must be a non-empty string");
  if (!isNonEmptyString(body.email) || !EMAIL_REGEX.test(body.email)) errors.push("email is required and must be a valid email address");
  if (!isNonEmptyString(body.password) || body.password.length < 8) errors.push("password is required and must be at least 8 characters long");

  if (errors.length > 0) {
    next(new ApiError(400, "Validation failed", errors));
    return;
  }

  next();
}

export function validateLogin(req: Request, _res: Response, next: NextFunction): void {
  const body = req.body ?? {};
  const errors: string[] = [];

  if (!isNonEmptyString(body.email)) errors.push("email is required and must be a non-empty string");
  if (!isNonEmptyString(body.password)) errors.push("password is required and must be a non-empty string");

  if (errors.length > 0) {
    next(new ApiError(400, "Validation failed", errors));
    return;
  }

  next();
}
