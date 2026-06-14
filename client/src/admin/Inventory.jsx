import { useState } from "react";
import { Minus, Plus, Search, Truck, X } from "lucide-react";
import { api } from "../api.js";
import Select from "../components/Select.jsx";

export default function Inventory({ rows, reload }) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const [filter, setFilter] = useState("");
  const [transferOpen, setTransferOpen] = useState(false);
  const warehouses = [...new Map(safeRows.map((row) => [row.warehouse, { id: row.warehouse_id, name: row.warehouse }])).values()];
  const products = [...new Map(safeRows.map((row) => [row.product_id, { id: row.product_id, name: row.name_uz }])).values()];
  const [transfer, setTransfer] = useState({
    productId: products[0]?.id || 0,
    fromWarehouseId: warehouses[0]?.id || 0,
    toWarehouseId: warehouses[1]?.id || 0,
    quantity: 1
  });
  const [message, setMessage] = useState("");
  const filtered = safeRows.filter((row) =>
    `${row.name_uz} ${row.sku} ${row.warehouse}`.toLowerCase().includes(filter.toLowerCase())
  );
  const adjust = async (row, change) => {
    await api("/inventory/adjust", { method: "POST", body: JSON.stringify({ inventoryId: row.id, change, reason: "Panel orqali tuzatish" }) });
    reload();
  };
  const submitTransfer = async (e) => {
    e.preventDefault();
    try {
      const result = await api("/inventory/transfer", { method: "POST", body: JSON.stringify(transfer) });
      setMessage(`Ko'chirish bajarildi: ${result.reference}`);
      setTransferOpen(false);
      reload();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <section className="panel full-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Real vaqt qoldiqlari</p>
          <h2>Ombor nazorati</h2>
        </div>
        <div className="panel-tools">
          {/* Proper pill search */}
          <div className="wms-search">
            <Search size={16} />
            <input
              placeholder="SKU, mahsulot yoki ombor"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            {filter && (
              <button className="wms-search-clear" onClick={() => setFilter("")}><X size={14} /></button>
            )}
          </div>
          <button className="button primary compact" onClick={() => setTransferOpen(true)}>
            <Truck /> Omborlararo ko'chirish
          </button>
        </div>
      </div>
      {message && <div className="inline-notice">{message}</div>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Mahsulot</th>
              <th>Ombor</th>
              <th>Qoldiq</th>
              <th>Minimal</th>
              <th>Tuzatish</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                <td><b>{row.name_uz}</b><small>{row.sku}</small></td>
                <td>{row.warehouse}<small>{row.city}</small></td>
                <td>
                  <span className={row.quantity <= row.reorder_level ? "low-qty" : "good-qty"}>
                    {row.quantity}
                  </span>
                </td>
                <td>{row.reorder_level}</td>
                <td>
                  <div className="adjust">
                    <button onClick={() => adjust(row, -1)}><Minus /></button>
                    <button onClick={() => adjust(row, 1)}><Plus /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {transferOpen && (
        <div className="overlay modal-layer" onMouseDown={() => setTransferOpen(false)}>
          <form className="modal small-modal" onSubmit={submitTransfer} onMouseDown={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <h2>Omborlararo ko'chirish</h2>
              <button type="button" onClick={() => setTransferOpen(false)}><X /></button>
            </div>
            <label>Mahsulot
              <Select
                value={transfer.productId}
                onChange={(v) => setTransfer({ ...transfer, productId: Number(v) })}
                options={products.map((p) => ({ value: p.id, label: p.name }))}
              />
            </label>
            <label>Qayerdan
              <Select
                value={transfer.fromWarehouseId}
                onChange={(v) => setTransfer({ ...transfer, fromWarehouseId: Number(v) })}
                options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
              />
            </label>
            <label>Qayerga
              <Select
                value={transfer.toWarehouseId}
                onChange={(v) => setTransfer({ ...transfer, toWarehouseId: Number(v) })}
                options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
              />
            </label>
            <label>Miqdor
              <input type="number" min="1" value={transfer.quantity} onChange={(e) => setTransfer({ ...transfer, quantity: Number(e.target.value) })} />
            </label>
            <button className="button primary wide">Ko'chirishni tasdiqlash</button>
          </form>
        </div>
      )}
    </section>
  );
}
