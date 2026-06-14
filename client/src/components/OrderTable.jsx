import { api } from "../api.js";
import { money, statusLabels } from "../utils.js";
import Select from "./Select.jsx";

const orderStatusOptions = Object.entries(statusLabels).map(([value, label]) => ({ value, label }));

export default function OrderTable({ rows, compact, reload }) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const update = async (id, status) => {
    await api(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
    reload?.();
  };
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Buyurtma</th>
            <th>Mijoz</th>
            <th>Sana</th>
            <th>Summa</th>
            <th>Holat</th>
          </tr>
        </thead>
        <tbody>
          {safeRows.map((row) => (
            <tr key={row.id}>
              <td>
                <b>{row.order_number}</b>
                {!compact && <small>{row.item_count} mahsulot</small>}
              </td>
              <td>{row.customer}</td>
              <td>{new Date(row.created_at).toLocaleDateString("uz-UZ")}</td>
              <td><b>{money(row.total)}</b></td>
              <td>
                {compact
                  ? <span className={`status ${row.status}`}>{statusLabels[row.status]}</span>
                  : <Select
                      variant="pill"
                      value={row.status}
                      onChange={(val) => update(row.id, val)}
                      options={orderStatusOptions}
                    />
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
