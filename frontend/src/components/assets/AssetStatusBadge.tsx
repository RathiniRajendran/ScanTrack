import type { AssetStatus } from "../../types/asset";

const STYLES: Record<AssetStatus, string> = {
  AVAILABLE: "badge-green",
  ASSIGNED: "badge-blue",
  IN_TRANSIT: "badge-blue",
  MAINTENANCE: "badge-amber",
  LOST: "badge-red",
  DAMAGED: "badge-red",
  RETIRED: "badge-gray",
};

export function AssetStatusBadge({ status }: { status: AssetStatus }) {
  return <span className={`badge ${STYLES[status]}`}>{status.replace("_", " ")}</span>;
}
