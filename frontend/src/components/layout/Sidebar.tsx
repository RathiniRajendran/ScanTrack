import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Boxes,
  MapPin,
  ScanLine,
  History,
  Settings,
  PackageSearch,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
  open: boolean;
  onNavigate: () => void;
}

const navItems = [
  {
    to: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: "/assets",
    label: "Assets",
    icon: Boxes,
  },
  {
    to: "/locations",
    label: "Locations",
    icon: MapPin,
  },
  {
    to: "/scanner",
    label: "Scan Asset",
    icon: ScanLine,
  },
  {
    to: "/scans",
    label: "Scan History",
    icon: History,
  },
];

function formatRole(role?: string) {
  if (!role) return "User";

  return role
    .replace("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function Sidebar({ open, onNavigate }: SidebarProps) {
  const { user } = useAuth();

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-brand">
        <PackageSearch size={22} />
        ScanTrack
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `sidebar-link${isActive ? " active" : ""}`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}

        <div className="sidebar-section-label">System</div>

        <span
          className="sidebar-link"
          style={{
            cursor: "default",
            opacity: 0.6,
          }}
        >
          <Settings size={18} />
          Settings
        </span>

        {user && (
          <div
            style={{
              margin: "12px 12px 0",
              padding: "12px",
              borderRadius: "10px",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <ShieldCheck size={16} />

              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Access Level
              </span>
            </div>

            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {formatRole(user.role)}
            </div>

            <div
              style={{
                fontSize: 12,
                marginTop: 3,
                color: "var(--color-text-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={user.email}
            >
              {user.email}
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}