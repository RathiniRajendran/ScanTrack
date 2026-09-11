import type { NextFunction, Response } from "express";
import type { Role } from "@prisma/client";
import { ApiError } from "../utils/ApiError";
import type { AuthenticatedRequest } from "./authMiddleware";

// Assumes `authenticate` has already run and populated req.user; does not verify the JWT itself
export function authorizeRoles(...allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ApiError(401, "Authentication required"));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new ApiError(403, "You do not have permission to perform this action"));
      return;
    }

    next();
  };
}
