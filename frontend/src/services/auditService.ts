import { apiClient } from "./api";
import type { AuditLog } from "../types/audit";

export const auditService = {
  async getAuditLogs(limit = 50): Promise<AuditLog[]> {
    const response = await apiClient.get("/audits", {
      params: { limit },
    });

    return response.data.data;
  },

  async getAssetAuditLogs(assetId: string): Promise<AuditLog[]> {
    const response = await apiClient.get(`/audits/asset/${assetId}`);

    return response.data.data;
  },
};