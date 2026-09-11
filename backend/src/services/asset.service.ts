import { AssetStatus, Prisma } from "@prisma/client";
import prisma from "../utils/prisma";
import { ApiError } from "../utils/ApiError";
import { createAuditLog } from "./auditService";
import type {
  AssetListQuery,
  CreateAssetInput,
  Pagination,
  UpdateAssetInput,
  UpdateAssetLocationInput,
} from "../types/asset.types";

export const ASSET_INCLUDE = {
  location: true,
  assignedTo: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
} satisfies Prisma.AssetInclude;

async function assertLocationExists(
  locationId: string | null | undefined
): Promise<void> {
  if (!locationId) return;

  const location = await prisma.location.findUnique({
    where: { id: locationId },
  });

  if (!location) {
    throw new ApiError(
      400,
      "locationId does not reference an existing location"
    );
  }
}

async function assertUserExists(
  userId: string | null | undefined
): Promise<void> {
  if (!userId) return;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(
      400,
      "assignedToId does not reference an existing user"
    );
  }
}

export async function createAsset(
  input: CreateAssetInput,
  userId?: string | null
) {
  await assertLocationExists(input.locationId);
  await assertUserExists(input.assignedToId);

  const [duplicateCode, duplicateSerial, duplicateRfid] =
    await Promise.all([
      prisma.asset.findUnique({
        where: { assetCode: input.assetCode },
      }),
      input.serialNumber
        ? prisma.asset.findUnique({
            where: { serialNumber: input.serialNumber },
          })
        : null,
      input.rfidTag
        ? prisma.asset.findUnique({
            where: { rfidTag: input.rfidTag },
          })
        : null,
    ]);

  if (duplicateCode) {
    throw new ApiError(409, "assetCode is already in use");
  }

  if (duplicateSerial) {
    throw new ApiError(409, "serialNumber is already in use");
  }

  if (duplicateRfid) {
    throw new ApiError(409, "rfidTag is already in use");
  }

  const asset = await prisma.asset.create({
    data: {
      assetCode: input.assetCode,
      name: input.name,
      category: input.category,
      serialNumber: input.serialNumber ?? null,
      rfidTag: input.rfidTag ?? null,
      status: input.status ?? undefined,
      locationId: input.locationId ?? null,
      assignedToId: input.assignedToId ?? null,
    },
    include: ASSET_INCLUDE,
  });

  await createAuditLog({
    assetId: asset.id,
    userId,
    action: "ASSET_CREATED",
    oldValue: null,
    newValue: `Asset ${asset.assetCode} created`,
  });

  return asset;
}

export async function listAssets(query: AssetListQuery) {
  const page =
    Math.max(
      1,
      Number.parseInt(query.page ?? "1", 10) || 1
    );

  const limit = Math.min(
    100,
    Math.max(
      1,
      Number.parseInt(query.limit ?? "10", 10) || 10
    )
  );

  const skip = (page - 1) * limit;

  const where: Prisma.AssetWhereInput = {};

  if (query.search) {
    const search = query.search;

    where.OR = [
      {
        assetCode: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        serialNumber: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        rfidTag: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (query.status) {
    if (
      !Object.values(AssetStatus).includes(
        query.status as AssetStatus
      )
    ) {
      throw new ApiError(
        400,
        `status must be one of: ${Object.values(AssetStatus).join(
          ", "
        )}`
      );
    }

    where.status = query.status as AssetStatus;
  }

  if (query.category) {
    where.category = query.category;
  }

  if (query.locationId) {
    where.locationId = query.locationId;
  }

  const [data, total] = await Promise.all([
    prisma.asset.findMany({
      where,
      include: ASSET_INCLUDE,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.asset.count({ where }),
  ]);

  const pagination: Pagination = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 0,
  };

  return { data, pagination };
}

export async function getAssetById(id: string) {
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: ASSET_INCLUDE,
  });

  if (!asset) {
    throw new ApiError(404, "Asset not found");
  }

  return {
    ...asset,
    recentScans: [],
    auditHistory: [],
  };
}

export async function updateAsset(
  id: string,
  input: UpdateAssetInput,
  userId?: string | null
) {
  const existing = await prisma.asset.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new ApiError(404, "Asset not found");
  }

  if (input.locationId !== undefined) {
    await assertLocationExists(input.locationId);
  }

  if (input.assignedToId !== undefined) {
    await assertUserExists(input.assignedToId);
  }

  if (input.serialNumber) {
    const duplicate = await prisma.asset.findUnique({
      where: { serialNumber: input.serialNumber },
    });

    if (duplicate && duplicate.id !== id) {
      throw new ApiError(
        409,
        "serialNumber is already in use"
      );
    }
  }

  if (input.rfidTag) {
    const duplicate = await prisma.asset.findUnique({
      where: { rfidTag: input.rfidTag },
    });

    if (duplicate && duplicate.id !== id) {
      throw new ApiError(
        409,
        "rfidTag is already in use"
      );
    }
  }

  const updated = await prisma.asset.update({
    where: { id },
    data: {
      name: input.name,
      category: input.category,
      serialNumber: input.serialNumber,
      rfidTag: input.rfidTag,
      status: input.status,
      locationId: input.locationId,
      assignedToId: input.assignedToId,
    },
    include: ASSET_INCLUDE,
  });

  await createAuditLog({
    assetId: id,
    userId,
    action: "ASSET_UPDATED",
    oldValue: JSON.stringify({
      name: existing.name,
      category: existing.category,
      serialNumber: existing.serialNumber,
      rfidTag: existing.rfidTag,
      status: existing.status,
      locationId: existing.locationId,
      assignedToId: existing.assignedToId,
    }),
    newValue: JSON.stringify({
      name: updated.name,
      category: updated.category,
      serialNumber: updated.serialNumber,
      rfidTag: updated.rfidTag,
      status: updated.status,
      locationId: updated.locationId,
      assignedToId: updated.assignedToId,
    }),
  });

  if (existing.status !== updated.status) {
    await createAuditLog({
      assetId: id,
      userId,
      action: "STATUS_CHANGED",
      oldValue: existing.status,
      newValue: updated.status,
    });
  }

  if (existing.assignedToId !== updated.assignedToId) {
    await createAuditLog({
      assetId: id,
      userId,
      action: "ASSET_ASSIGNED",
      oldValue: existing.assignedToId,
      newValue: updated.assignedToId,
    });
  }

  return updated;
}

// Assets are archived (status = RETIRED) rather than deleted
// to preserve ScanRecord/AuditLog history.
export async function archiveAsset(
  id: string,
  userId?: string | null
) {
  const existing = await prisma.asset.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new ApiError(404, "Asset not found");
  }

  const updated = await prisma.asset.update({
    where: { id },
    data: { status: "RETIRED" },
    include: ASSET_INCLUDE,
  });

  await createAuditLog({
    assetId: id,
    userId,
    action: "ASSET_DELETED",
    oldValue: existing.status,
    newValue: "RETIRED",
  });

  if (existing.status !== "RETIRED") {
    await createAuditLog({
      assetId: id,
      userId,
      action: "STATUS_CHANGED",
      oldValue: existing.status,
      newValue: "RETIRED",
    });
  }

  return updated;
}

// Explicit user-confirmed relocation after a scan mismatch.
// Never called automatically by the scan flow.
export async function updateAssetLocation(
  id: string,
  input: UpdateAssetLocationInput,
  userId?: string | null
) {
  const existing = await prisma.asset.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new ApiError(404, "Asset not found");
  }

  await assertLocationExists(input.locationId);

  const updated = await prisma.asset.update({
    where: { id },
    data: {
      locationId: input.locationId,
    },
    include: ASSET_INCLUDE,
  });

  await createAuditLog({
    assetId: id,
    userId,
    action: "LOCATION_CHANGED",
    oldValue: existing.locationId,
    newValue: input.locationId,
  });

  return updated;
}