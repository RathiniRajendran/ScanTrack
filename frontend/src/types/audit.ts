export type AuditAction =
  | "ASSET_CREATED"
  | "ASSET_UPDATED"
  | "ASSET_DELETED"
  | "ASSET_ASSIGNED"
  | "LOCATION_CHANGED"
  | "STATUS_CHANGED";

export interface AuditAsset {
  id: string;
  assetCode: string;
  name: string;
}

export interface AuditUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "ASSET_MANAGER" | "VIEWER";
}

export interface AuditLog {
  id: string;
  assetId: string;
  userId: string | null;
  action: AuditAction;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  asset?: AuditAsset;
  user?: AuditUser | null;
}