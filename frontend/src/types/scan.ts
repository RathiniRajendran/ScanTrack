import type { Asset } from "./asset";
import type { Location } from "./location";
import type { AssignedUser } from "./user";

export type ScanStatus = "SUCCESS" | "NOT_FOUND" | "LOCATION_MISMATCH";

export interface ScanRecord {
  id: string;
  assetId: string;
  rfidTag: string;
  locationId: string | null;
  scannedById: string | null;
  scanStatus: ScanStatus;
  scannedAt: string;
  location: Location | null;
  scannedBy: AssignedUser | null;
  asset?: Asset;
}

export interface ScanResult {
  scanStatus: ScanStatus;
  message?: string;
  rfidTag?: string;
  asset?: Asset;
  expectedLocation?: Location | null;
  scannedLocation?: Location | null;
  scanRecord?: ScanRecord;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateScanPayload {
  rfidTag: string;
  locationId?: string;
}

export interface ScanListParams {
  page?: number;
  limit?: number;
  status?: string;
  assetId?: string;
  locationId?: string;
}
