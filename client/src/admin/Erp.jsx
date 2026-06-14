import { api } from "../api.js";
import { money } from "../utils.js";
import Select from "../components/Select.jsx";

const poStatusOptions = [
  { value: "draft", label: "Draft" },
  { value: "approved", label: "Tasdiqlangan" },
  { value: "in_transit", label: "Yo'lda" },
  { value: "received", label: "Qabul qilindi" },
  { value: "cancelled", label: "Bekor qilindi" },
];

export default function Erp({ data, reload }) {
  const monthly = Array.isArray(data?.monthly) ? data.monthly : [];
  const suppliers = Array.isArray(data?.suppliers) ? data.suppliers : [];
  const purchaseOrders = Array.isArray(data?.purchaseOrders) ? data.purchaseOrders : [];
  const max = Math.max(...monthly.map((m) => Number(m.revenue)), 1);

  return (
    <>
      <div className="dashboard-grid erp-grid">
        <section className="panel wide-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Moliyaviy ko'rinish</p>
              <h2>Oylik tushum</h2>
            </div>
          </div>
          <div className="chart">
            {monthly.map((item) => (
              <div key={item.month}>
                <span style={{ height: `${Math.max(8, Number(item.revenue) / max * 100)}%` }}>
                  <i>{money(item.revenue)}</i>
                </span>
                <b>{item.month}</b>
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Ta'minot zanjiri</p>
              <h2>Yetkazib beruvchilar</h2>
            </div>
          </div>
          {suppliers.map((supplier) => (
            <div className="supplier" key={supplier.id}>
              <div><b>{supplier.name}</b><span>{supplier.lead_days} kunlik lead time</span></div>
              <strong>{supplier.rating} / 5</strong>
            </div>
          ))}
        </section>
      </div>
      <section className="panel full-panel purchase-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Xaridlar</p>
            <h2>Xarid buyurtmalari</h2>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>PO raqami</th>
                <th>Yetkazib beruvchi</th>
                <th>Kutilayotgan sana</th>
                <th>Summa</th>
                <th>Holat</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map((po) => (
                <tr key={po.id}>
                  <td><b>{po.po_number}</b></td>
                  <td>{po.supplier}</td>
                  <td>{new Date(po.expected_date).toLocaleDateString("uz-UZ")}</td>
                  <td><b>{money(po.total)}</b></td>
                  <td>
                    <Select
                      variant="pill"
                      value={po.status}
                      onChange={async (val) => {
                        await api(`/purchase-orders/${po.id}`, { method: "PATCH", body: JSON.stringify({ status: val }) });
                        reload();
                      }}
                      options={poStatusOptions}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
