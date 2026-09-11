import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/assets": "Assets",
  "/locations": "Locations",
  "/scanner": "Scan Asset",
  "/scans": "Scan History",
};

function resolveTitle(pathname: string): string {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith("/assets/")) return "Asset Details";
  return "ScanTrack";
}

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 35 }}
        />
      )}
      <div className="app-main">
        <Header title={resolveTitle(location.pathname)} onMenuClick={() => setMenuOpen((v) => !v)} />
        <Outlet />
      </div>
    </div>
  );
}
