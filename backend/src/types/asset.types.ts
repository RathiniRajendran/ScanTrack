import { AssetStatus } from "@prisma/client";

export interface CreateAssetInput {
  assetCode: string;
  name: string;
  category: string;
  serialNumber?: string | null;
  rfidTag?: string | null;
  status?: AssetStatus;
  locationId?: string | null;
  assignedToId?: string | null;
}

export interface UpdateAssetInput {
  name?: string;
  category?: string;
  serialNumber?: string | null;
  rfidTag?: string | null;
  status?: AssetStatus;
  locationId?: string | null;
  assignedToId?: string | null;
}

export interface AssetListQuery {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  category?: string;
  locationId?: string;
}

export interface UpdateAssetLocationInput {
  locationId: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
