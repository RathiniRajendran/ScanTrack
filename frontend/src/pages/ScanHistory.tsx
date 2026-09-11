import { useEffect, useState } from "react";
import { PageContainer } from "../components/layout/PageContainer";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { EmptyState } from "../components/common/EmptyState";
import { ScanStatus } from "../components/scanner/ScanStatus";
import { listScans } from "../services/scanService";
import { listLocations } from "../services/locationService";
import { listAssets } from "../services/assetService";
import { ApiClientError } from "../services/api";
import type { ScanRecord, Pagination } from "../types/scan";
import type { Location } from "../types/location";
import type { Asset } from "../types/asset";

const LIMIT = 10;
const STATUS_OPTIONS = ["SUCCESS", "LOCATION_MISMATCH", "NOT_FOUND"] as const;

export function ScanHistory() {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState("");
  const [assetId, setAssetId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [page, setPage] = useState(1);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [scansRes, locs, assetsRes] = await Promise.all([
        listScans({ page, limit: LIMIT, status: status || undefined, assetId: assetId || undefined, locationId: locationId || undefined }),
        listLocations(),
        listAssets({ page: 1, limit: 100 }),
      ]);
      setScans(scansRes.data);
      setPagination(scansRes.pagination);
      setLocations(locs);
      setAssets(assetsRes.data);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Unable to load scan history.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, assetId, locationId]);

  return (
    <PageContainer>
      <div className="page-header">
        <div>
          <h1>Scan History</h1>
          <p>All recorded RFID scan events, newest first.</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-filters">
          <select
            className="form-select"
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
          <select
            className="form-select"
            value={assetId}
            onChange={(e) => {
              setPage(1);
              setAssetId(e.target.value);
            }}
          >
            <option value="">All Assets</option>
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.assetCode})
              </option>
            ))}
          </select>
          <select
            className="form-select"
            value={locationId}
            onChange={(e) => {
              setPage(1);
              setLocationId(e.target.value);
            }}
          >
            <option value="">All Locations</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading scan history..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : scans.length === 0 ? (
        <EmptyState title="No scan activity yet." />
      ) : (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Asset</th>
                  <th>RFID</th>
                  <th>Location</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {scans.map((scan) => (
                  <tr key={scan.id}>
                    <td>
                      <ScanStatus status={scan.scanStatus} />
                    </td>
                    <td className="cell-primary">{scan.asset?.name ?? assets.find((a) => a.id === scan.assetId)?.name ?? "—"}</td>
                    <td className="cell-muted">{scan.rfidTag}</td>
                    <td className="cell-muted">{scan.location?.name ?? "—"}</td>
                    <td className="cell-muted">{new Date(scan.scannedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="pagination">
              <span>
                Page {pagination.page} of {pagination.totalPages} · {pagination.total} scans
              </span>
              <div className="pagination-controls">
                <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
}
