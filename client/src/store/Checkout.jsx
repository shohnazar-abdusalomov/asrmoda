import { useState } from "react";
import { CreditCard, X } from "lucide-react";
import { api } from "../api.js";
import { money } from "../utils.js";
import Select from "../components/Select.jsx";

const cityOptions = ["Toshkent","Samarqand","Farg'ona","Buxoro","Andijon","Namangan","Qarshi","Nukus"].map((c) => ({ value: c, label: c }));

export default function Checkout({ cart, total, onClose, onComplete }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", city: "Toshkent", address: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const order = await api("/checkout", {
        method: "POST",
        body: JSON.stringify({
          customer: form,
          items: cart.map((item) => ({ productId: item.id, quantity: item.quantity }))
        })
      });
      onComplete(order.order_number);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="overlay modal-layer">
      <div className="modal checkout-modal">
        <div className="drawer-head">
          <div>
            <p className="eyebrow">Xavfsiz buyurtma</p>
            <h2>Yetkazib berish</h2>
          </div>
          <button onClick={onClose}><X /></button>
        </div>
        <form onSubmit={submit} className="checkout-form">
          <div className="form-grid">
            <label>Ism va familiya
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ismingiz" />
            </label>
            <label>Telefon
              <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+998 90 000 00 00" />
            </label>
            <label>Email
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.uz" />
            </label>
            <label>Shahar
              <Select value={form.city} onChange={(v) => setForm({ ...form, city: v })} options={cityOptions} />
            </label>
            <label className="full">Manzil
              <input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Ko'cha, uy, xonadon" />
            </label>
          </div>
          <div className="payment-note">
            <CreditCard />
            <div>
              <b>Yetkazilganda to'lash</b>
              <span>Naqd yoki terminal orqali</span>
            </div>
          </div>
          {error && <p className="error">{error}</p>}
          <button className="button primary wide" disabled={busy}>
            {busy ? "Yuborilmoqda..." : `${money(total)} - tasdiqlash`}
          </button>
        </form>
      </div>
    </div>
  );
}
