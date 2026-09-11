import { useEffect, useState } from "react";
import { Activity, Clock, User } from "lucide-react";
import { auditService } from "../services/auditService";
import type { AuditAction, AuditLog } from "../types/audit";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorMessage } from "../components/common/ErrorMessage";

function formatAction(action: AuditAction) {
  switch (action) {
    case "ASSET_CREATED":
      return "Asset Created";
    case "ASSET_UPDATED":
      return "Asset Updated";
    case "ASSET_DELETED":
      return "Asset Archived";
    case "ASSET_ASSIGNED":
      return "Asset Assignment Changed";
    case "LOCATION_CHANGED":
      return "Location Changed";
    case "STATUS_CHANGED":
      return "Status Changed";
    default:
      return action;
  }
}

function formatValue(value: string | null) {
  if (!value) return "—";

  try {
    const parsed = JSON.parse(value);

    if (typeof parsed === "object" && parsed !== null) {
      return JSON.stringify(parsed, null, 2);
    }

    return String(parsed);
  } catch {
    return value;
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleString();
}

export default function AuditActivity() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadAuditLogs() {
      try {
        setLoading(true);
        setError("");

        const data = await auditService.getAuditLogs(50);

        if (!cancelled) {
          setLogs(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load audit activity."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAuditLogs();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <div className="eyebrow">
            <Activity size={15} />
            System Activity
          </div>

          <h1 className="page-title">Audit Activity</h1>

          <p className="page-subtitle">
            Track important asset changes and who performed them.
          </p>
        </div>
      </div>

      {logs.length === 0 ? (
        <EmptyState
          title="No audit activity yet"
          description="Asset changes and other tracked actions will appear here."
        />
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Asset</th>
                  <th>User</th>
                  <th>Change</th>
                  <th>Time</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Activity size={16} />
                        <span className="cell-primary">
                          {formatAction(log.action)}
                        </span>
                      </div>
                    </td>

                    <td>
                      {log.asset ? (
                        <div>
                          <div className="cell-primary">
                            {log.asset.name}
                          </div>
                          <div className="cell-muted">
                            {log.asset.assetCode}
                          </div>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td>
                      {log.user ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <User size={15} />

                          <div>
                            <div className="cell-primary">
                              {log.user.name}
                            </div>
                            <div className="cell-muted">
                              {log.user.email}
                            </div>
                          </div>
                        </div>
                      ) : (
                        "System"
                      )}
                    </td>

                    <td>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                          maxWidth: 320,
                        }}
                      >
                        <div className="cell-muted">
                          From: {formatValue(log.oldValue)}
                        </div>

                        <div className="cell-primary">
                          To: {formatValue(log.newValue)}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Clock size={14} />
                        <span className="cell-muted">
                          {formatDate(log.createdAt)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}