import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as auditService from "../services/auditService";
import { assertValidId } from "../utils/validateId";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const requestedLimit = Number.parseInt(
    String(req.query.limit ?? "50"),
    10
  );

  const limit = Number.isNaN(requestedLimit) ? 50 : requestedLimit;

  const data = await auditService.listAuditLogs(limit);

  res.status(200).json({
    success: true,
    data,
  });
});

export const listByAsset = asyncHandler(
  async (req: Request, res: Response) => {
    const assetId = String(req.params.assetId);

    assertValidId(assetId);

    const data = await auditService.listAssetAuditLogs(assetId);

    res.status(200).json({
      success: true,
      data,
    });
  }
);