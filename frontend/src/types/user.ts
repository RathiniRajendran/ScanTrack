export type UserRole = "ADMIN" | "ASSET_MANAGER" | "VIEWER";

export interface AssignedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
