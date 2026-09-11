export interface Location {
  id: string;
  name: string;
  building: string;
  room: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  assetCount?: number;
  assets?: import("./asset").Asset[];
}

export interface CreateLocationPayload {
  name: string;
  building: string;
  room: string;
  description?: string;
}

export type UpdateLocationPayload = Partial<CreateLocationPayload>;
