import { LogOut, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button className="header-menu-btn" onClick={onMenuClick} aria-label="Toggle menu">
          <Menu size={22} />
        </button>
        <span className="header-title">{title}</span>
      </div>
      {user && (
        <div className="header-user">
          <div className="header-user-info">
            <span className="header-user-name">{user.name}</span>
            <span className="header-user-role">{user.role}</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={logout}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      )}
    </header>
  );
}

