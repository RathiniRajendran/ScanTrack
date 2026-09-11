import type { ScanStatus as ScanStatusType } from "../../types/scan";

const STYLES: Record<ScanStatusType, string> = {
  SUCCESS: "badge-green",
  LOCATION_MISMATCH: "badge-amber",
  NOT_FOUND: "badge-red",
};

const LABELS: Record<ScanStatusType, string> = {
  SUCCESS: "Success",
  LOCATION_MISMATCH: "Location Mismatch",
  NOT_FOUND: "Not Found",
};

export function ScanStatus({ status }: { status: ScanStatusType }) {
  return <span className={`badge ${STYLES[status]}`}>{LABELS[status]}</span>;
}
