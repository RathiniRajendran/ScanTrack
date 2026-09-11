import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { Asset, AssetStatus, CreateAssetPayload, UpdateAssetPayload } from "../../types/asset";
import { ASSET_STATUSES } from "../../types/asset";
import type { Location } from "../../types/location";
import { createAsset, updateAsset } from "../../services/assetService";
import { ApiClientError } from "../../services/api";
import { useToast } from "../../hooks/useToast";

interface AssetFormProps {
  mode: "create" | "edit";
  asset?: Asset;
  locations: Location[];
  onClose: () => void;
  onSaved: (asset: Asset) => void;
}

export function AssetForm({ mode, asset, locations, onClose, onSaved }: AssetFormProps) {
  const { showToast } = useToast();
  const [assetCode, setAssetCode] = useState(asset?.assetCode ?? "");
  const [name, setName] = useState(asset?.name ?? "");
  const [category, setCategory] = useState(asset?.category ?? "");
  const [serialNumber, setSerialNumber] = useState(asset?.serialNumber ?? "");
  const [rfidTag, setRfidTag] = useState(asset?.rfidTag ?? "");
  const [status, setStatus] = useState<AssetStatus>(asset?.status ?? "AVAILABLE");
  const [locationId, setLocationId] = useState(asset?.locationId ?? "");
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors([]);
    setSaving(true);
    try {
      if (mode === "create") {
        const payload: CreateAssetPayload = {
          assetCode,
          name,
          category,
          serialNumber: serialNumber || undefined,
          rfidTag: rfidTag || undefined,
          status,
          locationId: locationId || undefined,
        };
        const created = await createAsset(payload);
        showToast("Asset created successfully.", "success");
        onSaved(created);
      } else if (asset) {
        const payload: UpdateAssetPayload = {
          name,
          category,
          serialNumber: serialNumber || undefined,
          rfidTag: rfidTag || undefined,
          status,
          locationId: locationId || undefined,
        };
        const updated = await updateAsset(asset.id, payload);
        showToast("Asset updated successfully.", "success");
        onSaved(updated);
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        setErrors(err.errors ?? [err.message]);
        showToast(
          mode === "create" ? "Unable to create asset. Please check the highlighted fields." : "Unable to update asset.",
          "error"
        );
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{mode === "create" ? "Add Asset" : "Edit Asset"}</span>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errors.length > 0 && (
              <div className="form-error" style={{ marginBottom: 12 }}>
                {errors.map((err) => (
                  <div key={err}>{err}</div>
                ))}
              </div>
            )}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Asset Code</label>
                <input
                  className="form-input"
                  value={assetCode}
                  onChange={(e) => setAssetCode(e.target.value)}
                  disabled={mode === "edit"}
                  required
                  placeholder="AST-0001"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <input className="form-input" value={category} onChange={(e) => setCategory(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value as AssetStatus)}>
                  {ASSET_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Serial Number</label>
                <input className="form-input" value={serialNumber ?? ""} onChange={(e) => setSerialNumber(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">RFID Tag</label>
                <input className="form-input" value={rfidTag ?? ""} onChange={(e) => setRfidTag(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <select className="form-select" value={locationId ?? ""} onChange={(e) => setLocationId(e.target.value)}>
                <option value="">Unassigned</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.building} - {loc.room})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : mode === "create" ? "Create Asset" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
