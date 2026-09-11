import prisma from "../utils/prisma";
import type { AuditAction } from "@prisma/client";

interface CreateAuditLogInput {
  assetId: string;
  userId?: string | null;
  action: AuditAction;
  oldValue?: string | null;
  newValue?: string | null;
}

export async function createAuditLog({
  assetId,
  userId,
  action,
  oldValue = null,
  newValue = null,
}: CreateAuditLogInput) {
  return prisma.auditLog.create({
    data: {
      assetId,
      userId: userId ?? null,
      action,
      oldValue,
      newValue,
    },
  });
}

export async function listAuditLogs(limit = 50) {
  const safeLimit = Math.min(100, Math.max(1, limit));

  return prisma.auditLog.findMany({
    take: safeLimit,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      asset: {
        select: {
          id: true,
          assetCode: true,
          name: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
}

export async function listAssetAuditLogs(assetId: string) {
  return prisma.auditLog.findMany({
    where: {
      assetId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
}