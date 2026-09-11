import type { ScanStatus } from "@prisma/client";

export interface CreateScanInput {
  rfidTag: string;
  locationId?: string | null;
  scannedById?: string | null;
}

export interface ScanListQuery {
  page?: string;
  limit?: string;
  status?: string;
  assetId?: string;
  locationId?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type { ScanStatus };
