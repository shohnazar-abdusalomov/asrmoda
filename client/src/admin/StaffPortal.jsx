import { createElement, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { LogOut, RefreshCw, Settings, ShoppingBag } from "lucide-react";
import { api } from "../api.js";
import { menuItems } from "../utils.js";
import Logo from "../components/Logo.jsx";
import Dashboard from "./Dashboard.jsx";
import Orders from "./Orders.jsx";
import Customers from "./Customers.jsx";
import ProductsAdmin from "./ProductsAdmin.jsx";
import Inventory from "./Inventory.jsx";
import Erp from "./Erp.jsx";
import SupportAdmin from "./SupportAdmin.jsx";
import UsersAdmin from "./UsersAdmin.jsx";
import ProfileModal from "./ProfileModal.jsx";

export default function StaffPortal({ user, onLogout, onStore, setUser }) {
  const routerNavigate = useNavigate();
  const { section = "dashboard" } = useParams();
  const allowedMenu = menuItems.filter((item) => item[3].includes(user.role));
  const allowedPages = allowedMenu.map((item) => item[0]);
  const page = allowedPages.includes(section) ? section : "dashboard";
  const [data, setData] = useState(null);
  const [dataPage, setDataPage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const load = () => setReloadKey((key) => key + 1);

  useEffect(() => {
    let current = true;
    const paths = {
      dashboard: "/dashboard",
      orders: "/orders",
      crm: "/customers",
      products: "/admin/products",
      wms: "/inventory",
      erp: "/erp",
      support: "/support",
      users: "/users"
    };
    setLoading(true);
    setError("");
    api(paths[page])
      .then((nextData) => { if (current) { setData(nextData); setDataPage(page); } })
      .catch((err) => { if (current) { setError(err.message); setDataPage(page); } })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [page, reloadKey]);

  const selectPage = (nextPage) => {
    routerNavigate(`/admin/${nextPage}`);
    window.scrollTo(0, 0);
  };

  const logout = () => {
    localStorage.removeItem("asrmoda_token");
    localStorage.removeItem("asrmoda_user");
    onLogout();
  };

  // Only treat data as renderable when it was loaded for the page we're showing now.
  // This prevents the previous page's data from briefly reaching the wrong component.
  const dataReady = !loading && !error && data !== null && dataPage === page;

  const initials = (user.name || "?").split(" ").map((n) => n[0]).slice(0, 2).join("");

  return (
    <div className="portal">
      <aside className="sidebar">
        <button
          type="button"
          className="portal-brand"
          onClick={() => selectPage("dashboard")}
          aria-label="Remodulega o'tish"
        >
          <Logo dark width={110} />
        </button>
        <nav>
          {allowedMenu.map(([id, Icon, label]) => (
            <button
              type="button"
              key={id}
              className={page === id ? "active" : ""}
              aria-current={page === id ? "page" : undefined}
              onClick={() => selectPage(id)}
            >
              {createElement(Icon)}<span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="sidebar-store-btn" onClick={onStore}>
            <ShoppingBag /> Onlayn do'kon
          </button>
          <button className="sidebar-logout-btn" onClick={logout}>
            <LogOut /> Chiqish
          </button>
        </div>
      </aside>
      <main className="portal-main">
        <header className="portal-header">
          <div>
            <p>{new Date().toLocaleDateString("uz-UZ", { weekday: "long", day: "numeric", month: "long" })}</p>
            <h1>{menuItems.find((item) => item[0] === page)?.[2]}</h1>
          </div>
          <div className="portal-actions">
            <button
              className={`refresh ${loading ? "is-loading" : ""}`}
              onClick={load}
              disabled={loading}
              title="Yangilash"
            >
              <RefreshCw className={loading ? "spin" : ""} />
            </button>
            <button
              type="button"
              className="user-chip"
              onClick={() => setProfileOpen(true)}
              title="Profilni tahrirlash"
            >
              {user.avatar
                ? <img src={user.avatar} alt="" className="user-chip-avatar" />
                : <span>{initials}</span>
              }
              <div>
                <b>{user.name}</b>
                <small>{user.role}</small>
              </div>
              <Settings className="user-chip-cog" />
            </button>
          </div>
        </header>
        {error
          ? <div className="error-card">
              <b>Ma'lumot yuklanmadi</b>
              <p>{error}</p>
              <button className="button secondary" onClick={load}>Qayta urinish</button>
            </div>
          : !dataReady
            ? <div className="loading"><RefreshCw className="spin" /> Ma'lumotlar yuklanmoqda...</div>
            : page === "dashboard" ? <Dashboard key={page} data={data} setPage={selectPage} /> :
              page === "orders" ? <Orders key={page} rows={data} reload={load} /> :
              page === "crm" ? <Customers key={page} rows={data} /> :
              page === "products" ? <ProductsAdmin key={page} rows={data} reload={load} user={user} /> :
              page === "wms" ? <Inventory key={page} rows={data} reload={load} /> :
              page === "erp" ? <Erp key={page} data={data} reload={load} /> :
              page === "support" ? <SupportAdmin key={page} rows={data} /> :
              <UsersAdmin key={page} rows={data} reload={load} />
        }
      </main>
      {profileOpen && (
        <ProfileModal
          user={user}
          onClose={() => setProfileOpen(false)}
          onSaved={(updated) => { setUser(updated); setProfileOpen(false); }}
        />
      )}
    </div>
  );
}
