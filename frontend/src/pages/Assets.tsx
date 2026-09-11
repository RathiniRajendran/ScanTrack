import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { PageContainer } from "../components/layout/PageContainer";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { EmptyState } from "../components/common/EmptyState";
import { AssetTable } from "../components/assets/AssetTable";
import { AssetForm } from "../components/assets/AssetForm";
import { listAssets } from "../services/assetService";
import { listLocations } from "../services/locationService";
import { ApiClientError } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { canManageAssets } from "../utils/permissions";
import type { Asset } from "../types/asset";
import { ASSET_STATUSES } from "../types/asset";
import type { Location } from "../types/location";
import type { Pagination } from "../types/asset";

const LIMIT = 10;

export function Assets() {
  const { user } = useAuth();
  const canManage = canManageAssets(user?.role);

  const [assets, setAssets] = useState<Asset[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [locationId, setLocationId] = useState("");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | undefined>(
    undefined
  );

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const [assetsRes, locs] = await Promise.all([
        listAssets({
          page,
          limit: LIMIT,
          search: search || undefined,
          status: status || undefined,
          category: category || undefined,
          locationId: locationId || undefined,
        }),
        listLocations(),
      ]);

      setAssets(assetsRes.data);
      setPagination(assetsRes.pagination);
      setLocations(locs);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Unable to load assets."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, status, category, locationId]);

  const categories = Array.from(
    new Set(assets.map((a) => a.category))
  ).filter(Boolean);

  function openCreate() {
    setEditingAsset(undefined);
    setFormOpen(true);
  }

  function openEdit(asset: Asset) {
    setEditingAsset(asset);
    setFormOpen(true);
  }

  function handleSaved() {
    setFormOpen(false);
    load();
  }

  return (
    <PageContainer>
      <div className="page-header">
        <div>
          <h1>Assets</h1>
          <p>Search, filter, and manage all tracked assets.</p>
        </div>

        {canManage && (
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> Add Asset
          </button>
        )}
      </div>

      <div className="toolbar">
        <div className="search-input-wrap">
          <Search size={16} />

          <input
            className="form-input"
            placeholder="Search by name, code, serial, RFID..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>

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

            {ASSET_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>

          <select
            className="form-select"
            value={category}
            onChange={(e) => {
              setPage(1);
              setCategory(e.target.value);
            }}
          >
            <option value="">All Categories</option>

            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
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
        <LoadingSpinner label="Loading assets..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : assets.length === 0 ? (
        <EmptyState
          title="No assets found."
          description={
            search || status || category || locationId
              ? "Try adjusting your filters."
              : undefined
          }
          action={
            canManage &&
            !(search || status || category || locationId) && (
              <button className="btn btn-primary" onClick={openCreate}>
                <Plus size={16} /> Add Your First Asset
              </button>
            )
          }
        />
      ) : (
        <>
          <AssetTable
            assets={assets}
            onEdit={canManage ? openEdit : undefined}
          />

          {pagination && pagination.totalPages > 1 && (
            <div className="pagination">
              <span>
                Page {pagination.page} of {pagination.totalPages} ·{" "}
                {pagination.total} assets
              </span>

              <div className="pagination-controls">
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
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

      {formOpen && canManage && (
        <AssetForm
          mode={editingAsset ? "edit" : "create"}
          asset={editingAsset}
          locations={locations}
          onClose={() => setFormOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </PageContainer>
  );
}