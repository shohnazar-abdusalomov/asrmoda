import { useState } from "react";
import { ArrowLeft, Check, ShoppingBag, Heart, Zap } from "lucide-react";
import { api } from "../api.js";
import Logo from "../components/Logo.jsx";

const perks = [
  [ShoppingBag, "Buyurtmalaringizni real vaqtda kuzating"],
  [Heart,       "Sevimli mahsulotlarni saqlang"],
  [Zap,         "Tezkor buyurtma berish imkoni"],
];

export default function RegisterPage({ onBack, onSuccess }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Parollar mos kelmayapti"); return; }
    setBusy(true);
    try {
      await api("/register", { method: "POST", body: JSON.stringify({ name: form.name, phone: form.phone, email: form.email, password: form.password }) });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="reg-page">
      {/* Left — branding panel */}
      <div className="reg-left">
        <Logo dark width={120} className="reg-logo" />
        <div className="reg-left-body">
          <h2>AsrModa'ga xush kelibsiz</h2>
          <p>Sifatli kiyimlar, qulay narxlar va butun O'zbekiston bo'ylab tez yetkazib berish.</p>
          <ul className="reg-perks">
            {perks.map(([Icon, text]) => (
              <li key={text}><span className="reg-perk-icon"><Icon size={15} /></span>{text}</li>
            ))}
          </ul>
        </div>
        <button className="reg-back" onClick={onBack}><ArrowLeft size={16} /> Do'konga qaytish</button>
      </div>

      {/* Right — form panel */}
      <div className="reg-right">
        <div className="reg-card">
          {done ? (
            <div className="reg-success">
              <span className="reg-success-icon"><Check size={28} /></span>
              <h2>Hisob yaratildi!</h2>
              <p>Saytimizda xarid qilishingiz mumkin.</p>
              <button className="button primary wide" onClick={onSuccess}>Davom etish</button>
            </div>
          ) : (
            <>
              <p className="eyebrow">Yangi hisob</p>
              <h1>Ro'yxatdan o'tish</h1>
              <form onSubmit={submit} className="reg-form">
                <div className="reg-row">
                  <label>To'liq ism
                    <input required minLength={2} value={form.name} onChange={set("name")} placeholder="Ism va familiya" autoComplete="name" />
                  </label>
                  <label>Telefon
                    <input required value={form.phone} onChange={set("phone")} placeholder="+998 90 000 00 00" autoComplete="tel" />
                  </label>
                </div>
                <label>Email <span className="reg-optional">(ixtiyoriy)</span>
                  <input type="email" value={form.email} onChange={set("email")} placeholder="email@example.uz" autoComplete="email" />
                </label>
                <div className="reg-row">
                  <label>Parol
                    <input required type="password" minLength={8} value={form.password} onChange={set("password")} placeholder="Kamida 8 belgi" autoComplete="new-password" />
                  </label>
                  <label>Tasdiqlang
                    <input required type="password" value={form.confirm} onChange={set("confirm")} placeholder="Parolni qayta kiriting" autoComplete="new-password" />
                  </label>
                </div>
                {error && <p className="error">{error}</p>}
                <button className="button primary wide" disabled={busy}>
                  {busy ? "Saqlanmoqda..." : "Hisob yaratish"}
                </button>
              </form>
              <p className="reg-login-hint">
                Hisobingiz bormi? <button className="reg-link" onClick={onBack}>Do'konga qaytish</button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
