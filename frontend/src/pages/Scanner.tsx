import { useEffect, useState } from "react";
import { PageContainer } from "../components/layout/PageContainer";
import { ScannerInput } from "../components/scanner/ScannerInput";
import { ScanResult } from "../components/scanner/ScanResult";
import { EmptyState } from "../components/common/EmptyState";
import { listLocations } from "../services/locationService";
import { createScan } from "../services/scanService";
import { updateAssetLocation } from "../services/assetService";
import { ApiClientError } from "../services/api";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../context/AuthContext";
import { canManageAssets } from "../utils/permissions";
import type { Location } from "../types/location";
import type { ScanResult as ScanResultType } from "../types/scan";
import { ScanLine } from "lucide-react";

export function Scanner() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const canManage = canManageAssets(user?.role);

  const [locations, setLocations] = useState<Location[]>([]);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResultType | null>(null);
  const [updatingLocation, setUpdatingLocation] = useState(false);

  useEffect(() => {
    listLocations()
      .then(setLocations)
      .catch(() =>
        showToast(
          "Unable to load locations for scanning.",
          "error"
        )
      );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleScan(
    rfidTag: string,
    locationId: string
  ) {
    setScanning(true);
    setResult(null);

    try {
      const res = await createScan({
        rfidTag,
        locationId: locationId || undefined,
      });

      setResult({
        ...res,
        rfidTag,
      });

      if (res.scanStatus === "SUCCESS") {
        showToast(
          "Asset scanned successfully.",
          "success"
        );
      } else if (
        res.scanStatus === "LOCATION_MISMATCH"
      ) {
        showToast(
          "Asset scanned at an unexpected location.",
          "info"
        );
      } else {
        showToast(
          "RFID tag is not registered in ScanTrack.",
          "info"
        );
      }
    } catch (err) {
      showToast(
        err instanceof ApiClientError
          ? err.message
          : "Unable to process scan.",
        "error"
      );
    } finally {
      setScanning(false);
    }
  }

  async function handleUpdateLocation() {
    if (
      !canManage ||
      !result?.asset ||
      !result.scannedLocation
    ) {
      return;
    }

    setUpdatingLocation(true);

    try {
      const updated = await updateAssetLocation(
        result.asset.id,
        result.scannedLocation.id
      );

      setResult({
        ...result,
        asset: updated,
        expectedLocation: result.scannedLocation,
      });

      showToast(
        "Location updated successfully.",
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
      setUpdatingLocation(false);
    }
  }

  return (
    <PageContainer>
      <div className="page-header">
        <div>
          <h1>Scan Asset</h1>
          <p>
            Simulate an RFID scan to verify an asset's
            location.
          </p>
        </div>
      </div>

      <div className="scanner-layout">
        <ScannerInput
          locations={locations}
          scanning={scanning}
          onScan={handleScan}
        />

        <div>
          {result ? (
            <ScanResult
              result={result}
              updatingLocation={updatingLocation}
              onUpdateLocation={
                canManage
                  ? handleUpdateLocation
                  : undefined
              }
              onKeepExisting={() =>
                showToast(
                  "Registered location kept unchanged.",
                  "info"
                )
              }
            />
          ) : (
            <div className="card">
              <EmptyState
                title="No scan performed yet."
                description="Enter an RFID tag and select a scan location to get started."
                icon={<ScanLine size={32} />}
              />
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}