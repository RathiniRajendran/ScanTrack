import { CheckCircle2, AlertTriangle, HelpCircle, MapPin } from "lucide-react";
import type { ScanResult as ScanResultType } from "../../types/scan";
import { ScanStatus } from "./ScanStatus";

interface ScanResultProps {
  result: ScanResultType;
  updatingLocation: boolean;
  onUpdateLocation?: () => void | Promise<void>;
  onKeepExisting: () => void;
}

export function ScanResult({
  result,
  updatingLocation,
  onUpdateLocation,
  onKeepExisting,
}: ScanResultProps) {
  const isMismatch = result.scanStatus === "LOCATION_MISMATCH";
  const isSuccess = result.scanStatus === "SUCCESS";
  const isNotFound = result.scanStatus === "NOT_FOUND";

  return (
    <div className="card card-padded">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {isSuccess ? (
          <CheckCircle2
            size={22}
            color="var(--color-success)"
          />
        ) : isMismatch ? (
          <AlertTriangle
            size={22}
            color="var(--color-warning)"
          />
        ) : (
          <HelpCircle
            size={22}
            color="var(--color-danger)"
          />
        )}

        <div>
          <h2
            className="section-title"
            style={{ marginBottom: 4 }}
          >
            Scan Result
          </h2>

          <ScanStatus status={result.scanStatus} />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div>
          <div className="detail-label">RFID Tag</div>
          <div className="detail-value">
            {result.rfidTag}
          </div>
        </div>

        {result.asset && (
          <div>
            <div className="detail-label">Asset</div>
            <div className="detail-value">
              {result.asset.name} ({result.asset.assetCode})
            </div>
          </div>
        )}

        {result.scannedLocation && (
          <div>
            <div className="detail-label">
              Scanned Location
            </div>

            <div
              className="detail-value"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <MapPin size={15} />
              {result.scannedLocation.name}
            </div>
          </div>
        )}

        {result.expectedLocation && (
          <div>
            <div className="detail-label">
              Registered Location
            </div>

            <div className="detail-value">
              {result.expectedLocation.name}
            </div>
          </div>
        )}

        {isNotFound && (
          <p
            className="cell-muted"
            style={{ fontSize: 13 }}
          >
            This RFID tag is not registered in ScanTrack.
          </p>
        )}

        {isMismatch && (
          <div
            style={{
              padding: 12,
              borderRadius: 8,
              background: "var(--color-warning-bg)",
              fontSize: 13,
            }}
          >
            <strong>Location mismatch detected.</strong>

            <div style={{ marginTop: 4 }}>
              The asset was scanned at a location different
              from its registered location.
            </div>
          </div>
        )}

        {isMismatch && onUpdateLocation && (
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginTop: 4,
            }}
          >
            <button
              className="btn btn-primary"
              onClick={onUpdateLocation}
              disabled={updatingLocation}
            >
              {updatingLocation
                ? "Updating..."
                : "Update Registered Location"}
            </button>

            <button
              className="btn btn-secondary"
              onClick={onKeepExisting}
              disabled={updatingLocation}
            >
              Keep Existing Location
            </button>
          </div>
        )}

        {isMismatch && !onUpdateLocation && (
          <div
            className="cell-muted"
            style={{
              fontSize: 13,
              padding: 10,
            }}
          >
            You have view-only access. An Asset Manager or
            Admin can update the registered location.
          </div>
        )}
      </div>
    </div>
  );
}