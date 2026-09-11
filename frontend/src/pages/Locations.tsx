import { useEffect, useState, type FormEvent } from "react";
import { Plus, Building2, Trash2, Pencil, X } from "lucide-react";
import { PageContainer } from "../components/layout/PageContainer";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { EmptyState } from "../components/common/EmptyState";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import {
  createLocation,
  deleteLocation,
  listLocations,
  updateLocation,
} from "../services/locationService";
import { ApiClientError } from "../services/api";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../context/AuthContext";
import { canManageLocations } from "../utils/permissions";
import type { Location } from "../types/location";

function LocationForm({
  location,
  onClose,
  onSaved,
}: {
  location?: Location;
  onClose: () => void;
  onSaved: (loc: Location) => void;
}) {
  const { showToast } = useToast();
  const [name, setName] = useState(location?.name ?? "");
  const [building, setBuilding] = useState(location?.building ?? "");
  const [room, setRoom] = useState(location?.room ?? "");
  const [description, setDescription] = useState(
    location?.description ?? ""
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors([]);
    setSaving(true);

    try {
      const payload = {
        name,
        building,
        room,
        description: description || undefined,
      };

      const saved = location
        ? await updateLocation(location.id, payload)
        : await createLocation(payload);

      showToast(
        location
          ? "Location updated successfully."
          : "Location created successfully.",
        "success"
      );

      onSaved(saved);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setErrors(err.errors ?? [err.message]);
        showToast(
          "Unable to save location. Please check the highlighted fields.",
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
          <span className="modal-title">
            {location ? "Edit Location" : "Add Location"}
          </span>

          <button
            className="icon-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errors.length > 0 && (
              <div
                className="form-error"
                style={{ marginBottom: 12 }}
              >
                {errors.map((err) => (
                  <div key={err}>{err}</div>
                ))}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Name</label>

              <input
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Computer Lab 01"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Building</label>

                <input
                  className="form-input"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Room</label>

                <input
                  className="form-input"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>

              <textarea
                className="form-textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : location
                  ? "Save Changes"
                  : "Create Location"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Locations() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const canManage = canManageLocations(user?.role);

  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] =
    useState<Location | undefined>(undefined);

  const [deleteTarget, setDeleteTarget] =
    useState<Location | null>(null);

  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      setLocations(await listLocations());
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Unable to load locations."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditingLocation(undefined);
    setFormOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      await deleteLocation(deleteTarget.id);

      showToast("Location deleted successfully.", "success");

      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(
        err instanceof ApiClientError
          ? err.message
          : "Unable to delete location.",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <PageContainer>
      <div className="page-header">
        <div>
          <h1>Locations</h1>
          <p>
            Manage the physical locations where assets are tracked.
          </p>
        </div>

        {canManage && (
          <button
            className="btn btn-primary"
            onClick={openCreate}
          >
            <Plus size={16} /> Add Location
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner label="Loading locations..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : locations.length === 0 ? (
        <EmptyState
          title="No locations configured."
          icon={<Building2 size={32} />}
          action={
            canManage && (
              <button
                className="btn btn-primary"
                onClick={openCreate}
              >
                <Plus size={16} /> Add Location
              </button>
            )
          }
        />
      ) : (
        <div className="location-grid">
          {locations.map((loc) => (
            <div
              key={loc.id}
              className="card location-card"
            >
              <div className="location-card-header">
                <div>
                  <div style={{ fontWeight: 700 }}>
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
                    fontSize: 13,
                    color: "var(--color-text-muted)",
                    marginTop: 10,
                  }}
                >
                  {loc.description}
                </p>
              )}

              {canManage && (
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 14,
                  }}
                >
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setEditingLocation(loc);
                      setFormOpen(true);
                    }}
                  >
                    <Pencil size={14} /> Edit
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => setDeleteTarget(loc)}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {formOpen && canManage && (
        <LocationForm
          location={editingLocation}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            load();
          }}
        />
      )}

      {deleteTarget && canManage && (
        <ConfirmDialog
          title="Delete Location"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          danger
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </PageContainer>
  );
}