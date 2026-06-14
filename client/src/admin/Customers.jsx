import { useState } from "react";
import { ArrowRight, MapPin, Phone, ShoppingBag, X } from "lucide-react";
import { api } from "../api.js";
import OrderTable from "../components/OrderTable.jsx";
import { money } from "../utils.js";

export default function Customers({ rows }) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);

  const open = async (customer) => {
    setSelected(customer);
    setDetail(null);
    setDetail(await api(`/customers/${customer.id}`));
  };

  return (
    <>
      <div className="customer-grid">
        {safeRows.map((customer) => (
          <button className="customer-card" key={customer.id} onClick={() => open(customer)}>
            <div className="customer-top">
              <span>{customer.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}</span>
              <b className={`segment ${customer.segment}`}>{customer.segment}</b>
            </div>
            <h3>{customer.name}</h3>
            <p>{customer.phone}</p>
            <p>{customer.email || "Email kiritilmagan"}</p>
            <div>
              <span><small>Shahar</small><b>{customer.city}</b></span>
              <span><small>Jami xarid</small><b>{money(customer.total_spent)}</b></span>
            </div>
            <i>Batafsil ko'rish <ArrowRight /></i>
          </button>
        ))}
      </div>
      {selected && (
        <div className="overlay modal-layer" onMouseDown={() => setSelected(null)}>
          <div className="modal admin-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <div>
                <p className="eyebrow">CRM mijoz kartasi</p>
                <h2>{selected.name}</h2>
              </div>
              <button onClick={() => setSelected(null)}><X /></button>
            </div>
            {!detail
              ? <div className="loading">Yuklanmoqda...</div>
              : <>
                  <div className="customer-summary">
                    <span><Phone /><b>{detail.customer.phone}</b></span>
                    <span><MapPin /><b>{detail.customer.city}</b></span>
                    <span><ShoppingBag /><b>{money(detail.customer.total_spent)}</b></span>
                  </div>
                  <h3>Buyurtmalar tarixi</h3>
                  <OrderTable
                    rows={(Array.isArray(detail.orders) ? detail.orders : []).map((order) => ({ ...order, customer: selected.name }))}
                    compact
                  />
                </>
            }
          </div>
        </div>
      )}
    </>
  );
}
