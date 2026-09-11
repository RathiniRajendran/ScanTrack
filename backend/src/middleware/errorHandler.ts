import { Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";

// Maps known Prisma error codes to safe, human-readable messages without leaking internals
function mapPrismaError(err: Prisma.PrismaClientKnownRequestError): ApiError {
  switch (err.code) {
    case "P2002": {
      const target = (err.meta?.target as string[] | undefined)?.join(", ") ?? "field";
      return new ApiError(409, `A record with this ${target} already exists`);
    }
    case "P2003":
      return new ApiError(400, "Referenced record does not exist");
    case "P2025":
      return new ApiError(404, "Record not found");
    default:
      return new ApiError(500, "Database error occurred");
  }
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  let apiError: ApiError;

  if (err instanceof ApiError) {
    apiError = err;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    apiError = mapPrismaError(err);
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    apiError = new ApiError(400, "Invalid request data");
  } else {
    console.error(err);
    apiError = new ApiError(500, "Internal server error");
  }

  res.status(apiError.statusCode).json({
    success: false,
    message: apiError.message,
    ...(apiError.errors ? { errors: apiError.errors } : {}),
  });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ success: false, message: "Route not found" });
}
