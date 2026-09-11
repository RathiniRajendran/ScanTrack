import type { Request, Response } from "express";
import * as scanService from "../services/scan.service";
import { asyncHandler } from "../utils/asyncHandler";
import { assertValidId } from "../utils/validateId";
import type { CreateScanInput, ScanListQuery } from "../types/scan.types";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const result = await scanService.createScan(req.body as CreateScanInput);
  const { message, ...data } = result;
  res.status(200).json({ success: true, data, message });
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { data, pagination } = await scanService.listScans(req.query as ScanListQuery);
  res.status(200).json({ success: true, data, pagination });
});

export const getAssetScanHistory = asyncHandler(async (req: Request, res: Response) => {
  const assetId = String(req.params.assetId);
  assertValidId(assetId, "asset id");
  const history = await scanService.getAssetScanHistory(assetId);
  res.status(200).json({ success: true, data: history });
});
