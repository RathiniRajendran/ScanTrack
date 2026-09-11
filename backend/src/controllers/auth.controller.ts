import type { Response } from "express";
import * as authService from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";
import type { LoginInput, RegisterInput } from "../types/auth.types";

export const register = asyncHandler(async (req, res: Response) => {
  const result = await authService.register(req.body as RegisterInput);
  res.status(201).json({ success: true, data: result });
});

export const login = asyncHandler(async (req, res: Response) => {
  const result = await authService.login(req.body as LoginInput);
  res.status(200).json({ success: true, data: result });
});

export const me = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const user = await authService.getCurrentUser(req.user.userId);
  res.status(200).json({ success: true, data: { user } });
});
