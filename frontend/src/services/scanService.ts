import { apiClient } from "./api";
import type { ApiSuccess } from "../types/api";
import type { CreateScanPayload, Pagination, ScanListParams, ScanRecord, ScanResult } from "../types/scan";

export async function createScan(payload: CreateScanPayload): Promise<ScanResult> {
  const res = await apiClient.post<ApiSuccess<ScanResult>>("/scans", payload);
  return { ...res.data.data, message: res.data.message };
}

export async function listScans(params: ScanListParams): Promise<{ data: ScanRecord[]; pagination: Pagination }> {
  const res = await apiClient.get<ApiSuccess<ScanRecord[]>>("/scans", { params });
  return { data: res.data.data, pagination: res.data.pagination! };
}

export async function getAssetScanHistory(assetId: string): Promise<ScanRecord[]> {
  const res = await apiClient.get<ApiSuccess<ScanRecord[]>>(`/scans/asset/${assetId}`);
  return res.data.data;
}
