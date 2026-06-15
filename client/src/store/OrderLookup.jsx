import { useState } from "react";
import { ArrowLeft, Check, Search } from "lucide-react";
import { api } from "../api.js";
import { money, statusLabels } from "../utils.js";

function PageHeader({ eyebrow, title, text, onBack }) {
  return (
    <div className="page-hero">
      <div className="shell">
        <button className="text-back" onClick={onBack}><ArrowLeft /> Bosh sahifa</button>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
    </div>
  );
}

export default function OrderLookup({ navigate }) {
  const [form, setForm] = useState({ orderNumber: "", phone: "" });
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setOrder(null);
    try {
      setOrder(await api("/orders/lookup", { method: "POST", body: JSON.stringify(form) }));
    } catch (err) {
      setError(err.message);
    }
  };

  const steps = ["new", "confirmed", "packing", "shipped", "delivered"];

  return (
    <main className="content-page">
      <PageHeader
        eyebrow="Buyurtmalarim"
        title="Buyurtmani kuzatish"
        text="Buyurtma raqami va rasmiylashtirishda ishlatilgan telefon raqamini kiriting."
        onBack={() => navigate("home")}
      />
      <div className="shell lookup-layout">
        <form className="lookup-card" onSubmit={submit}>
          <label>Buyurtma raqami
            <input
              required
              placeholder="ASR-2026-123456"
              value={form.orderNumber}
              onChange={(e) => setForm({ ...form, orderNumber: e.target.value })}
            />
          </label>
          <label>Telefon raqami
            <input
              required
              placeholder="+998 90 000 00 00"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="button primary"><Search /> Buyurtmani topish</button>
        </form>
        {order && (
          <section className="order-result">
            <div className="order-result-head">
              <div>
                <p className="eyebrow">Buyurtma</p>
                <h2>{order.order_number}</h2>
              </div>
              <span className={`status ${order.status}`}>{statusLabels[order.status]}</span>
            </div>
            <div className="order-progress">
              {steps.map((step, index) => {
                const active = steps.indexOf(order.status) >= index;
                return (
                  <div className={active ? "active" : ""} key={step}>
                    <span>{active ? <Check /> : index + 1}</span>
                    <b>{statusLabels[step]}</b>
                  </div>
                );
              })}
            </div>
            <div className="order-lines">
              {order.items.map((item) => (
                <div key={item.name}>
                  <span>{item.name} × {item.quantity}</span>
                  <b>{money(item.price * item.quantity)}</b>
                </div>
              ))}
            </div>
            <div className="order-total">
              <span>Jami</span>
              <strong>{money(order.total)}</strong>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
