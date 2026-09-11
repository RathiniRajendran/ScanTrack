import type { UserRole } from "../types/user";

export const canManageAssets = (role?: UserRole): boolean => {
  return role === "ADMIN" || role === "ASSET_MANAGER";
};

export const canManageLocations = (role?: UserRole): boolean => {
  return role === "ADMIN" || role === "ASSET_MANAGER";
};

export const canViewAssets = (role?: UserRole): boolean => {
  return role === "ADMIN" || role === "ASSET_MANAGER" || role === "VIEWER";
};

export const canViewLocations = (role?: UserRole): boolean => {
  return role === "ADMIN" || role === "ASSET_MANAGER" || role === "VIEWER";
};

export const canUseScanner = (role?: UserRole): boolean => {
  return role === "ADMIN" || role === "ASSET_MANAGER" || role === "VIEWER";
};