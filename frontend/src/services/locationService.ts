import { apiClient } from "./api";
import type { ApiSuccess } from "../types/api";
import type { CreateLocationPayload, Location, UpdateLocationPayload } from "../types/location";

export async function listLocations(): Promise<Location[]> {
  const res = await apiClient.get<ApiSuccess<Location[]>>("/locations");
  return res.data.data;
}

export async function getLocation(id: string): Promise<Location> {
  const res = await apiClient.get<ApiSuccess<Location>>(`/locations/${id}`);
  return res.data.data;
}

export async function createLocation(payload: CreateLocationPayload): Promise<Location> {
  const res = await apiClient.post<ApiSuccess<Location>>("/locations", payload);
  return res.data.data;
}

export async function updateLocation(id: string, payload: UpdateLocationPayload): Promise<Location> {
  const res = await apiClient.put<ApiSuccess<Location>>(`/locations/${id}`, payload);
  return res.data.data;
}

export async function deleteLocation(id: string): Promise<void> {
  await apiClient.delete(`/locations/${id}`);
}
