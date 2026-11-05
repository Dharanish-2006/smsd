import { useEffect, useState } from "react";
import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { istDate, istTime } from "../lib/format";
import { AssetIcon } from "./Icon";
const navItems = [
    { label: "Dashboard", to: "/", icon: "1607a.svg" },
    { label: "Reports", to: "/reports", icon: "8f4bf.svg" },
    { label: "Alerts", to: "/alerts", icon: "8aeeb.svg" },
    { label: "Settings", to: "/settings", icon: "fe506.svg" },
];
function titleFor(path) {
    if (path.startsWith("/machines"))
        return "Process Analysis";
    if (path.startsWith("/alerts"))
        return "Alerts & Thresholds";
    if (path.startsWith("/reports"))
        return "Reports";
    if (path.startsWith("/settings"))
        return "Settings";
    return "Dashboard";
}
function Sidebar() {
    const { user, logout } = useAuth();
    const { activeAlertCount } = useData();
    const { pathname } = useLocation();
    const confirmLogout = () => {
        if (window.confirm("Log out of this device?"))
            logout();
    };
    return (<aside className="sidebar">
      <div className="brand">
        <AssetIcon file="00d79.svg" size={48}/>
        <div>
          <strong>Rice Mill Monitor</strong>
          <span>Energy &amp; motors</span>
        </div>
      </div>

      <nav aria-label="Primary navigation">
        {navItems.map((item) => {
            // Machine detail pages belong to the Dashboard section.
            const forced = item.to === "/" && pathname.startsWith("/machines");
            return (<NavLink key={item.to} to={item.to} end={item.to === "/"} className={({ isActive }) => isActive || forced ? "nav-item active" : "nav-item"}>
              <AssetIcon file={item.icon}/>
              <span>{item.label}</span>
              {item.to === "/alerts" && activeAlertCount > 0 && (<b className="nav-badge" aria-label={`${activeAlertCount} active alerts`}>
                  {activeAlertCount}
                </b>)}
            </NavLink>);
        })}
      </nav>

      <div className="account">
        <div className="account-info">
          <span className="avatar">
            {(user?.fullName || user?.username || "?").slice(0, 2).toUpperCase()}
          </span>
          <div>
            <strong>{user?.username}</strong>
            <span>{user?.role === "admin" ? "Admin" : "User"}</span>
          </div>
        </div>
        <button className="logout" onClick={confirmLogout}>
          <AssetIcon file="e9510.svg" size={18}/>
          Log out
        </button>
      </div>
    </aside>);
}
function Topbar() {
    const { plant, plants, setPlant, lastUpdate } = useData();
    const { pathname } = useLocation();
    const [now, setNow] = useState(Date.now());
    const [open, setOpen] = useState(false);
    useEffect(() => {
        const id = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(id);
    }, []);
    return (<header className="topbar">
      <div className="live-datetime">
        <strong>{istDate(now)}</strong>
        <span>{istTime(now)}</span>
      </div>
      <span className="topbar-divider"/>
      <strong>{titleFor(pathname)}</strong>
      <div className="chip-wrap">
        <button className="plant-chip" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)}>
          <AssetIcon file="244ec.svg" size={18}/>
          {plant}
          <AssetIcon file="7012b.svg" size={16}/>
        </button>
        {open && (<div className="plant-menu chip-menu" role="listbox">
            {plants.map((p) => (<button key={p} role="option" aria-selected={p === plant} onClick={() => {
                    setPlant(p);
                    setOpen(false);
                }}>
                {p} {p === plant && <span>Selected</span>}
              </button>))}
          </div>)}
      </div>
      <div className="updated">
        <i />
        Last updated {istTime(lastUpdate)} IST
      </div>
    </header>);
}
export function Layout() {
    const { user, ready } = useAuth();
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    if (!ready)
        return null;
    if (!user)
        return <Navigate to="/login" replace state={{ from: pathname }}/>;
    return (<div className="app-shell">
      <Sidebar />
      <main>
        <Topbar />
        <div className="page">
          <Outlet />
        </div>
      </main>
    </div>);
}
