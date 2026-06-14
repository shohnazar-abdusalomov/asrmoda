import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { api } from "../api.js";
import Logo from "../components/Logo.jsx";

export default function Login({ onSuccess, onBack }) {
  const [email, setEmail] = useState("admin@asrmoda.uz");
  const [password, setPassword] = useState("AsrModa2026!");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      const data = await api("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      localStorage.setItem("asrmoda_token", data.token);
      localStorage.setItem("asrmoda_user", JSON.stringify(data.user));
      onSuccess(data.user);
    } catch (err) {
      setError(err.message);
    }
  };

  const demoAccounts = [
    ["Administrator", "admin@asrmoda.uz"],
    ["Savdo menejeri", "sales@asrmoda.uz"],
    ["Ombor menejeri", "warehouse@asrmoda.uz"],
    ["Moliya menejeri", "finance@asrmoda.uz"]
  ];

  return (
    <div className="login-centered">
      <button className="login-back-btn" onClick={onBack}>
        <ArrowLeft size={16} /> Do'konga qaytish
      </button>
      <div className="login-box">
        <Logo width={110} className="login-box-logo" />
        <p className="eyebrow" style={{ marginTop: 28 }}>Xodimlar kabineti</p>
        <h1 className="login-box-title">Xush kelibsiz</h1>
        <p className="login-box-sub">CRM, ERP va WMS tizimlarini boshqaring.</p>
        <form onSubmit={submit} className="login-box-form">
          <label>Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </label>
          <label>Parol
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="button primary wide">Tizimga kirish</button>
        </form>
        <div className="demo-pills">
          <span className="demo-pills-label">Demo hisoblar</span>
          <div className="demo-pills-grid">
            {demoAccounts.map(([role, mail]) => (
              <button type="button" key={mail} className="demo-pill"
                onClick={() => { setEmail(mail); setPassword("AsrModa2026!"); }}>
                <span>{role}</span>
                <small>{mail}</small>
              </button>
            ))}
          </div>
          <p className="demo-pills-note">Barcha hisoblar paroli: <b>AsrModa2026!</b></p>
        </div>
      </div>
    </div>
  );
}
