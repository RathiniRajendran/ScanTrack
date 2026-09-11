import type { Request, Response } from "express";

import * as assetService from "../services/asset.service";

import { asyncHandler } from "../utils/asyncHandler";

import { assertValidId } from "../utils/validateId";

import type {
  AssetListQuery,
  CreateAssetInput,
  UpdateAssetInput,
  UpdateAssetLocationInput,
} from "../types/asset.types";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const asset = await assetService.createAsset(
    req.body as CreateAssetInput,
    req.user?.userId
  );

  res.status(201).json({
    success: true,
    data: asset,
  });
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { data, pagination } = await assetService.listAssets(
    req.query as AssetListQuery
  );

  res.status(200).json({
    success: true,
    data,
    pagination,
  });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);

  assertValidId(id);

  const asset = await assetService.getAssetById(id);

  res.status(200).json({
    success: true,
    data: asset,
  });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);

  assertValidId(id);

  const asset = await assetService.updateAsset(
    id,
    req.body as UpdateAssetInput,
    req.user?.userId
  );

  res.status(200).json({
    success: true,
    data: asset,
  });
});

export const archive = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);

  assertValidId(id);

  const asset = await assetService.archiveAsset(
    id,
    req.user?.userId
  );

  res.status(200).json({
    success: true,
    data: asset,
    message: "Asset archived (status set to RETIRED)",
  });
});

export const updateLocation = asyncHandler(
  async (req: Request, res: Response) => {
    const id = String(req.params.id);

    assertValidId(id);

    const asset = await assetService.updateAssetLocation(
      id,
      req.body as UpdateAssetLocationInput,
      req.user?.userId
    );

    res.status(200).json({
      success: true,
      data: asset,
    });
  }
);