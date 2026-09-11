import { useEffect, useState } from "react";
import {
  Boxes,
  MapPin,
  CheckCircle2,
  UserCheck,
  AlertTriangle,
  Truck,
  Activity,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "../components/layout/PageContainer";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { EmptyState } from "../components/common/EmptyState";
import { ScanStatus } from "../components/scanner/ScanStatus";
import { listAssets } from "../services/assetService";
import { listLocations } from "../services/locationService";
import { listScans } from "../services/scanService";
import { ApiClientError } from "../services/api";
import type { Asset } from "../types/asset";
import type { Location } from "../types/location";
import type { ScanRecord } from "../types/scan";

interface DashboardData {
  assets: Asset[];
  totalAssets: number;
  locations: Location[];
  recentScans: ScanRecord[];
}

export function Dashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const [assetsRes, locations, scansRes] = await Promise.all([
        listAssets({ page: 1, limit: 100 }),
        listLocations(),
        listScans({ page: 1, limit: 5 }),
      ]);

      setData({
        assets: assetsRes.data,
        totalAssets: assetsRes.pagination.total,
        locations,
        recentScans: scansRes.data,
      });
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <LoadingSpinner label="Loading dashboard..." />
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

  if (!data) return null;

  const counts = {
    AVAILABLE: 0,
    ASSIGNED: 0,
    IN_TRANSIT: 0,
    MAINTENANCE: 0,
    LOST: 0,
    DAMAGED: 0,
    RETIRED: 0,
  };

  data.assets.forEach((asset) => {
    counts[asset.status] += 1;
  });

  const attentionCount =
    counts.LOST + counts.DAMAGED + counts.MAINTENANCE;

  const mismatchCount = data.recentScans.filter(
    (scan) => scan.scanStatus === "LOCATION_MISMATCH"
  ).length;

  const stats = [
    {
      label: "Total Assets",
      value: data.totalAssets,
      icon: Boxes,
    },
    {
      label: "Available",
      value: counts.AVAILABLE,
      icon: CheckCircle2,
    },
    {
      label: "Assigned",
      value: counts.ASSIGNED,
      icon: UserCheck,
    },
    {
      label: "In Transit",
      value: counts.IN_TRANSIT,
      icon: Truck,
    },
    {
      label: "Needs Attention",
      value: attentionCount,
      icon: AlertTriangle,
    },
    {
      label: "Locations",
      value: data.locations.length,
      icon: MapPin,
    },
  ];

  const statusRows = [
    { key: "AVAILABLE" as const, label: "Available" },
    { key: "ASSIGNED" as const, label: "Assigned" },
    { key: "IN_TRANSIT" as const, label: "In Transit" },
    { key: "MAINTENANCE" as const, label: "Maintenance" },
    { key: "LOST" as const, label: "Lost" },
    { key: "DAMAGED" as const, label: "Damaged" },
    { key: "RETIRED" as const, label: "Retired" },
  ];

  return (
    <PageContainer>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>
            Live overview of your tracked assets and scan activity.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate("/scanner")}
        >
          <Activity size={16} />
          Scan Asset
        </button>
      </div>

      {/* Statistics */}
      <div className="stat-grid">
        {stats.map(({ label, value, icon: Icon }) => (
          <div className="stat-card" key={label}>
            <div
              className="stat-card-label"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Icon size={14} />
              {label}
            </div>

            <div className="stat-card-value">
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Attention banner */}
      {(attentionCount > 0 || mismatchCount > 0) && (
        <div
          className="card card-padded"
          style={{
            marginTop: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2
              className="section-title"
              style={{ marginBottom: 6 }}
            >
              Attention Required
            </h2>

            <p
              style={{
                margin: 0,
                color: "var(--color-text-muted)",
                fontSize: 14,
              }}
            >
              {attentionCount > 0 &&
                `${attentionCount} asset${
                  attentionCount === 1 ? "" : "s"
                } need attention.`}

              {attentionCount > 0 && mismatchCount > 0 && " "}

              {mismatchCount > 0 &&
                `${mismatchCount} recent location mismatch${
                  mismatchCount === 1 ? "" : "es"
                } detected.`}
            </p>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate("/assets")}
          >
            View Assets
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Main dashboard panels */}
      <div
        className="form-row"
        style={{ alignItems: "start", marginTop: 20 }}
      >
        {/* Status distribution */}
        <div className="card card-padded">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <h2 className="section-title">
              Asset Status Distribution
            </h2>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate("/assets")}
            >
              View Assets
            </button>
          </div>

          {data.totalAssets === 0 ? (
            <EmptyState title="No assets found." />
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {statusRows.map(({ key, label }) => {
                const count = counts[key];

                const percentage =
                  data.totalAssets > 0
                    ? Math.round(
                        (count / data.totalAssets) * 100
                      )
                    : 0;

                return (
                  <div key={key}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 14,
                        marginBottom: 5,
                      }}
                    >
                      <span>{label}</span>

                      <strong>
                        {count}{" "}
                        <span
                          style={{
                            fontWeight: 400,
                            color: "var(--color-text-muted)",
                          }}
                        >
                          ({percentage}%)
                        </span>
                      </strong>
                    </div>

                    <div
                      style={{
                        height: 7,
                        borderRadius: 999,
                        background:
                          "var(--color-surface-muted)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: "100%",
                          borderRadius: 999,
                          background:
                            "var(--color-primary)",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent scans */}
        <div className="card card-padded">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <h2 className="section-title">
              Recent Scan Activity
            </h2>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate("/scans")}
            >
              View History
            </button>
          </div>

          {data.recentScans.length === 0 ? (
            <EmptyState title="No scan activity yet." />
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {data.recentScans.map((scan) => (
                <div
                  key={scan.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {scan.asset?.name ??
                        scan.rfidTag}
                    </div>

                    <div
                      className="cell-muted"
                      style={{ fontSize: 12 }}
                    >
                      {scan.rfidTag} ·{" "}
                      {scan.location?.name ??
                        "Unknown location"}
                    </div>

                    <div
                      className="cell-muted"
                      style={{
                        fontSize: 12,
                        marginTop: 2,
                      }}
                    >
                      {new Date(
                        scan.scannedAt
                      ).toLocaleString()}
                    </div>
                  </div>

                  <ScanStatus
                    status={scan.scanStatus}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Location overview */}
      <div
        className="card card-padded"
        style={{ marginTop: 20 }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <h2 className="section-title">
            Location Overview
          </h2>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate("/locations")}
          >
            View Locations
          </button>
        </div>

        {data.locations.length === 0 ? (
          <EmptyState title="No locations configured." />
        ) : (
          <div className="location-grid">
            {data.locations.map((loc) => (
              <div
                key={loc.id}
                className="card location-card"
              >
                <div className="location-card-header">
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {loc.name}
                    </div>

                    <div
                      className="cell-muted"
                      style={{ fontSize: 13 }}
                    >
                      {loc.building} · {loc.room}
                    </div>
                  </div>

                  <span className="badge badge-blue">
                    {loc.assetCount ?? 0} assets
                  </span>
                </div>

                {loc.description && (
                  <p
                    style={{
                      fontSize: 12,
                      color:
                        "var(--color-text-muted)",
                      marginTop: 8,
                    }}
                  >
                    {loc.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div
        className="card card-padded"
        style={{ marginTop: 20 }}
      >
        <h2 className="section-title">
          Quick Actions
        </h2>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <button
            className="btn btn-primary"
            onClick={() => navigate("/scanner")}
          >
            <Activity size={15} />
            Scan Asset
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => navigate("/assets")}
          >
            <Boxes size={15} />
            Browse Assets
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => navigate("/locations")}
          >
            <MapPin size={15} />
            View Locations
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => navigate("/scans")}
          >
            <Activity size={15} />
            Scan History
          </button>
        </div>
      </div>
    </PageContainer>
  );
}