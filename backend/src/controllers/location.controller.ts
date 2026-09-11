import type { Request, Response } from "express";
import * as locationService from "../services/location.service";
import { asyncHandler } from "../utils/asyncHandler";
import { assertValidId } from "../utils/validateId";
import type { CreateLocationInput, UpdateLocationInput } from "../types/location.types";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const location = await locationService.createLocation(req.body as CreateLocationInput);
  res.status(201).json({ success: true, data: location });
});

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const locations = await locationService.listLocations();
  res.status(200).json({ success: true, data: locations });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  assertValidId(id, "location id");
  const location = await locationService.getLocationById(id);
  res.status(200).json({ success: true, data: location });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  assertValidId(id, "location id");
  const location = await locationService.updateLocation(id, req.body as UpdateLocationInput);
  res.status(200).json({ success: true, data: location });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  assertValidId(id, "location id");
  await locationService.deleteLocation(id);
  res.status(200).json({ success: true, message: "Location deleted" });
});
