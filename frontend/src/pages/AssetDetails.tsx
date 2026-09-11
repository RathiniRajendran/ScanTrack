import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Pencil,
  MapPin,
  ScanLine,
} from "lucide-react";
import { PageContainer } from "../components/layout/PageContainer";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { EmptyState } from "../components/common/EmptyState";
import { AssetStatusBadge } from "../components/assets/AssetStatusBadge";
import { AssetForm } from "../components/assets/AssetForm";
import { getAsset, updateAssetLocation } from "../services/assetService";
import { listLocations } from "../services/locationService";
import { getAssetScanHistory } from "../services/scanService";
import { ApiClientError } from "../services/api";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../context/AuthContext";
import { canManageAssets } from "../utils/permissions";
import type { Asset } from "../types/asset";
import type { Location } from "../types/location";
import type { ScanRecord } from "../types/scan";

function groupLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();

  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AssetDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();

  const canManage = canManageAssets(user?.role);

  const [asset, setAsset] = useState<Asset | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [locationPanelOpen, setLocationPanelOpen] = useState(false);
  const [newLocationId, setNewLocationId] = useState("");
  const [savingLocation, setSavingLocation] = useState(false);

  async function load() {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const [assetData, locs, hist] = await Promise.all([
        getAsset(id),
        listLocations(),
        getAssetScanHistory(id),
      ]);

      setAsset(assetData);
      setLocations(locs);
      setHistory(hist);
      setNewLocationId(assetData.locationId ?? "");
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Unable to load asset details."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleChangeLocation() {
    if (!asset || !newLocationId || !canManage) return;

    setSavingLocation(true);

    try {
      const updated = await updateAssetLocation(
        asset.id,
        newLocationId
      );

      setAsset(updated);
      setLocationPanelOpen(false);

      showToast(
        "Asset location updated successfully.",
        "success"
      );
    } catch (err) {
      showToast(
        err instanceof ApiClientError
          ? err.message
          : "Unable to update location.",
        "error"
      );
    } finally {
      setSavingLocation(false);
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <LoadingSpinner label="Loading asset..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorMessage message={error} onRetry={load} />
      </PageContainer>
    );
  }

  if (!asset) return null;

  return (
    <PageContainer>
      <button
        className="btn btn-secondary btn-sm"
        onClick={() => navigate("/assets")}
        style={{ marginBottom: 16 }}
      >
        <ArrowLeft size={14} /> Back to Assets
      </button>

      <div className="page-header">
        <div>
          <h1>{asset.name}</h1>
          <p>{asset.assetCode}</p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          {canManage && (
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setEditOpen(true)}
              >
                <Pencil size={15} /> Edit Asset
              </button>

              <button
                className="btn btn-secondary"
                onClick={() =>
                  setLocationPanelOpen((v) => !v)
                }
              >
                <MapPin size={15} /> Change Location
              </button>
            </>
          )}

          <button
            className="btn btn-primary"
            onClick={() => navigate("/scanner")}
          >
            <ScanLine size={15} /> Scan Asset
          </button>
        </div>
      </div>

      {locationPanelOpen && canManage && (
        <div
          className="card card-padded"
          style={{ marginBottom: 20 }}
        >
          <h2 className="section-title">
            Update Registered Location
          </h2>

          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <select
              className="form-select"
              style={{ maxWidth: 300 }}
              value={newLocationId}
              onChange={(e) =>
                setNewLocationId(e.target.value)
              }
            >
              <option value="">Select a location</option>

              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.building} - {loc.room})
                </option>
              ))}
            </select>

            <button
              className="btn btn-primary"
              onClick={handleChangeLocation}
              disabled={
                savingLocation || !newLocationId
              }
            >
              {savingLocation
                ? "Updating..."
                : "Save Location"}
            </button>
          </div>
        </div>
      )}

      <div
        className="card card-padded"
        style={{ marginBottom: 20 }}
      >
        <div className="detail-grid">
          <div>
            <div className="detail-label">Status</div>
            <AssetStatusBadge status={asset.status} />
          </div>

          <div>
            <div className="detail-label">Category</div>
            <div className="detail-value">
              {asset.category}
            </div>
          </div>

          <div>
            <div className="detail-label">
              Serial Number
            </div>
            <div className="detail-value">
              {asset.serialNumber ?? "—"}
            </div>
          </div>

          <div>
            <div className="detail-label">RFID Tag</div>
            <div className="detail-value">
              {asset.rfidTag ?? "—"}
            </div>
          </div>

          <div>
            <div className="detail-label">
              Current Location
            </div>
            <div className="detail-value">
              {asset.location?.name ?? "Unassigned"}
            </div>
          </div>

          <div>
            <div className="detail-label">
              Assigned User
            </div>
            <div className="detail-value">
              {asset.assignedTo?.name ?? "Unassigned"}
            </div>
          </div>
        </div>
      </div>

      <div className="card card-padded">
        <h2 className="section-title">
          Recent Scan History
        </h2>

        {history.length === 0 ? (
          <EmptyState title="No scan activity yet." />
        ) : (
          <div className="timeline">
            {history.map((scan, idx) => {
              const prevLabel =
                idx > 0
                  ? groupLabel(
                      history[idx - 1].scannedAt
                    )
                  : null;

              const label = groupLabel(scan.scannedAt);
              const showLabel = label !== prevLabel;

              const icon =
                scan.scanStatus === "SUCCESS" ? (
                  <CheckCircle2
                    size={16}
                    color="var(--color-success)"
                  />
                ) : scan.scanStatus ===
                  "LOCATION_MISMATCH" ? (
                  <AlertTriangle
                    size={16}
                    color="var(--color-warning)"
                  />
                ) : (
                  <HelpCircle
                    size={16}
                    color="var(--color-danger)"
                  />
                );

              return (
                <div key={scan.id}>
                  {showLabel && (
                    <div
                      className="sidebar-section-label"
                      style={{
                        padding: "12px 0 4px",
                        color:
                          "var(--color-text-muted)",
                      }}
                    >
                      {label}
                    </div>
                  )}

                  <div className="timeline-item">
                    <div
                      className="timeline-icon"
                      style={{
                        background:
                          scan.scanStatus ===
                          "SUCCESS"
                            ? "var(--color-success-bg)"
                            : scan.scanStatus ===
                              "LOCATION_MISMATCH"
                            ? "var(--color-warning-bg)"
                            : "var(--color-danger-bg)",
                      }}
                    >
                      {icon}
                    </div>

                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                        }}
                      >
                        {new Date(
                          scan.scannedAt
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        ·{" "}
                        {scan.location?.name ??
                          "Unknown location"}
                      </div>

                      {scan.scanStatus ===
                        "LOCATION_MISMATCH" && (
                        <div
                          className="cell-muted"
                          style={{ fontSize: 13 }}
                        >
                          Location mismatch
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editOpen && canManage && (
        <AssetForm
          mode="edit"
          asset={asset}
          locations={locations}
          onClose={() => setEditOpen(false)}
          onSaved={(updated) => {
            setAsset(updated);
            setEditOpen(false);
          }}
        />
      )}
    </PageContainer>
  );
}