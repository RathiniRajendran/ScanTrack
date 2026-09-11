import { apiClient } from "./api";
import type { ApiSuccess } from "../types/api";
import type { Asset, AssetListParams, CreateAssetPayload, Pagination, UpdateAssetPayload } from "../types/asset";

export async function listAssets(params: AssetListParams): Promise<{ data: Asset[]; pagination: Pagination }> {
  const res = await apiClient.get<ApiSuccess<Asset[]>>("/assets", { params });
  return { data: res.data.data, pagination: res.data.pagination! };
}

export async function getAsset(id: string): Promise<Asset> {
  const res = await apiClient.get<ApiSuccess<Asset>>(`/assets/${id}`);
  return res.data.data;
}

export async function createAsset(payload: CreateAssetPayload): Promise<Asset> {
  const res = await apiClient.post<ApiSuccess<Asset>>("/assets", payload);
  return res.data.data;
}

export async function updateAsset(id: string, payload: UpdateAssetPayload): Promise<Asset> {
  const res = await apiClient.put<ApiSuccess<Asset>>(`/assets/${id}`, payload);
  return res.data.data;
}

export async function retireAsset(id: string): Promise<Asset> {
  const res = await apiClient.delete<ApiSuccess<Asset>>(`/assets/${id}`);
  return res.data.data;
}

export async function updateAssetLocation(id: string, locationId: string): Promise<Asset> {
  const res = await apiClient.patch<ApiSuccess<Asset>>(`/assets/${id}/location`, { locationId });
  return res.data.data;
}
