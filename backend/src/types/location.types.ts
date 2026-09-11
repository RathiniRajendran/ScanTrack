export interface CreateLocationInput {
  name: string;
  building: string;
  room: string;
  description?: string | null;
}

export interface UpdateLocationInput {
  name?: string;
  building?: string;
  room?: string;
  description?: string | null;
}
