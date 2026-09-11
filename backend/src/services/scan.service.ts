import { ScanStatus, Prisma } from "@prisma/client";
import prisma from "../utils/prisma";
import { ApiError } from "../utils/ApiError";
import { ASSET_INCLUDE } from "./asset.service";
import type { CreateScanInput, Pagination, ScanListQuery } from "../types/scan.types";

const SCAN_INCLUDE = {
  location: true,
  scannedBy: { select: { id: true, name: true, email: true, role: true } },
} satisfies Prisma.ScanRecordInclude;

export async function createScan(input: CreateScanInput) {
  const asset = await prisma.asset.findUnique({ where: { rfidTag: input.rfidTag }, include: ASSET_INCLUDE });

  if (!asset) {
    // ScanRecord.assetId is a required FK in the current schema, so an unknown RFID
    // scan cannot be persisted without a schema change. We report NOT_FOUND without
    // creating a ScanRecord to keep the response fast and side-effect free.
    return {
      scanStatus: ScanStatus.NOT_FOUND,
      message: "Asset not found",
    };
  }

  if (input.locationId) {
    const location = await prisma.location.findUnique({ where: { id: input.locationId } });
    if (!location) throw new ApiError(400, "locationId does not reference an existing location");
  }

  const scannedLocationId = input.locationId ?? null;
  const scanStatus: ScanStatus =
    (asset.locationId ?? null) === scannedLocationId ? ScanStatus.SUCCESS : ScanStatus.LOCATION_MISMATCH;

  const scanRecord = await prisma.scanRecord.create({
    data: {
      assetId: asset.id,
      rfidTag: input.rfidTag,
      locationId: scannedLocationId,
      scannedById: input.scannedById ?? null,
      scanStatus,
    },
    include: SCAN_INCLUDE,
  });

  return {
    scanStatus,
    asset,
    expectedLocation: asset.location,
    scannedLocation: scanRecord.location,
    scanRecord,
    message: scanStatus === ScanStatus.SUCCESS ? "Asset scanned successfully" : "Asset scanned at an unexpected location",
  };
}

export async function listScans(query: ScanListQuery) {
  const page = Math.max(1, Number.parseInt(query.page ?? "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit ?? "10", 10) || 10));
  const skip = (page - 1) * limit;

  const where: Prisma.ScanRecordWhereInput = {};

  if (query.status) {
    if (!Object.values(ScanStatus).includes(query.status as ScanStatus)) {
      throw new ApiError(400, `status must be one of: ${Object.values(ScanStatus).join(", ")}`);
    }
    where.scanStatus = query.status as ScanStatus;
  }
  if (query.assetId) where.assetId = query.assetId;
  if (query.locationId) where.locationId = query.locationId;

  const [data, total] = await Promise.all([
    prisma.scanRecord.findMany({
      where,
      include: SCAN_INCLUDE,
      orderBy: { scannedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.scanRecord.count({ where }),
  ]);

  const pagination: Pagination = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 0,
  };

  return { data, pagination };
}

export async function getAssetScanHistory(assetId: string) {
  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) throw new ApiError(404, "Asset not found");

  return prisma.scanRecord.findMany({
    where: { assetId },
    include: SCAN_INCLUDE,
    orderBy: { scannedAt: "desc" },
  });
}
