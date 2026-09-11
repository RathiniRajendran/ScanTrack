import { useNavigate } from "react-router-dom";
import { Pencil, Eye } from "lucide-react";
import type { Asset } from "../../types/asset";
import { AssetStatusBadge } from "./AssetStatusBadge";

interface AssetTableProps {
  assets: Asset[];
  onEdit?: (asset: Asset) => void;
}

export function AssetTable({ assets, onEdit }: AssetTableProps) {
  const navigate = useNavigate();

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Asset</th>
            <th>Asset Code</th>
            <th>RFID</th>
            <th>Location</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {assets.map((asset) => (
            <tr key={asset.id}>
              <td>
                <div className="cell-primary">{asset.name}</div>
                <div className="cell-muted">{asset.category}</div>
              </td>

              <td>{asset.assetCode}</td>

              <td className="cell-muted">
                {asset.rfidTag ?? "—"}
              </td>

              <td className="cell-muted">
                {asset.location?.name ?? "Unassigned"}
              </td>

              <td>
                <AssetStatusBadge status={asset.status} />
              </td>

              <td>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate(`/assets/${asset.id}`)}
                  >
                    <Eye size={14} />
                    View
                  </button>

                  {onEdit && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onEdit(asset)}
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}