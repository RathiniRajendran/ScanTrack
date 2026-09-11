import type { Location } from "./location";
import type { AssignedUser } from "./user";

export type AssetStatus =
  | "AVAILABLE"
  | "ASSIGNED"
  | "IN_TRANSIT"
  | "MAINTENANCE"
  | "LOST"
  | "DAMAGED"
  | "RETIRED";

export interface Asset {
  id: string;
  assetCode: string;
  name: string;
  category: string;
  serialNumber: string | null;
  rfidTag: string | null;
  status: AssetStatus;
  locationId: string | null;
  assignedToId: string | null;
  location: Location | null;
  assignedTo: AssignedUser | null;
  createdAt: string;
  updatedAt: string;
  recentScans?: unknown[];
  auditHistory?: unknown[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateAssetPayload {
  assetCode: string;
  name: string;
  category: string;
  serialNumber?: string;
  rfidTag?: string;
  status?: AssetStatus;
  locationId?: string;
}

export type UpdateAssetPayload = Partial<CreateAssetPayload>;

export interface AssetListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
  locationId?: string;
}

export const ASSET_STATUSES: AssetStatus[] = [
  "AVAILABLE",
  "ASSIGNED",
  "IN_TRANSIT",
  "MAINTENANCE",
  "LOST",
  "DAMAGED",
  "RETIRED",
];
