import { useState, type FormEvent } from "react";
import { ScanLine } from "lucide-react";
import type { Location } from "../../types/location";

interface ScannerInputProps {
  locations: Location[];
  scanning: boolean;
  onScan: (rfidTag: string, locationId: string) => void;
}

export function ScannerInput({ locations, scanning, onScan }: ScannerInputProps) {
  const [rfidTag, setRfidTag] = useState("");
  const [locationId, setLocationId] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!rfidTag.trim()) return;
    onScan(rfidTag.trim(), locationId);
  }

  return (
    <form className="card card-padded" onSubmit={handleSubmit}>
      <h2 className="section-title">ScanTrack Scanner</h2>
      <div className="form-group">
        <label className="form-label">RFID Tag</label>
        <input
          className="form-input"
          value={rfidTag}
          onChange={(e) => setRfidTag(e.target.value)}
          placeholder="RFID-10001"
          autoFocus
        />
      </div>
      <div className="form-group">
        <label className="form-label">Scan Location</label>
        <select className="form-select" value={locationId} onChange={(e) => setLocationId(e.target.value)}>
          <option value="">No location (unregistered scan)</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name} ({loc.building} - {loc.room})
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={scanning || !rfidTag.trim()}>
        <ScanLine size={16} />
        {scanning ? "Scanning..." : "Scan Asset"}
      </button>
    </form>
  );
}
