import { createElement } from "react";
import { ArrowRight, BarChart3, Box, Check, ShoppingCart, Users } from "lucide-react";
import OrderTable from "../components/OrderTable.jsx";
import { money } from "../utils.js";

export default function Dashboard({ data, setPage }) {
  const recentOrders = Array.isArray(data?.recentOrders) ? data.recentOrders : [];
  const lowStock = Array.isArray(data?.lowStock) ? data.lowStock : [];
  const cards = [
    ["30 kunlik tushum", money(data.metrics.revenue), BarChart3, "+12.4%", "green"],
    ["Buyurtmalar", data.metrics.orders, ShoppingCart, "Faol savdo", "blue"],
    ["Mijozlar", data.metrics.customers, Users, "CRM bazasi", "violet"],
    ["Ombordagi birlik", data.metrics.units, Box, "4 ta ombor", "orange"]
  ];
  return (
    <>
      <div className="metric-grid">
        {cards.map(([label, value, Icon, note, tone]) => (
          <div className="metric" key={label}>
            <div className={`metric-icon ${tone}`}>{createElement(Icon)}</div>
            <p>{label}</p>
            <h2>{value}</h2>
            <span>{note}</span>
          </div>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="panel wide-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">So'nggi faoliyat</p>
              <h2>Yangi buyurtmalar</h2>
            </div>
            <button onClick={() => setPage("orders")}>Barchasi <ArrowRight /></button>
          </div>
          <OrderTable rows={recentOrders} compact />
        </section>
        <section className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">WMS signal</p>
              <h2>Kam qolganlar</h2>
            </div>
          </div>
          {lowStock.length
            ? lowStock.map((item) => (
                <div className="stock-alert" key={item.sku}>
                  <div><b>{item.name_uz}</b><span>{item.sku}</span></div>
                  <strong>{item.quantity} dona</strong>
                </div>
              ))
            : <div className="success-state">
                <Check />
                <b>Qoldiqlar me'yorda</b>
                <span>Hozircha xarid talab qilinmaydi</span>
              </div>
          }
        </section>
      </div>
    </>
  );
}
