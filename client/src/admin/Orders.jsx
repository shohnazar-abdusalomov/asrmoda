import OrderTable from "../components/OrderTable.jsx";

export default function Orders({ rows, reload }) {
  const safeRows = Array.isArray(rows) ? rows : [];
  return (
    <section className="panel full-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Savdo boshqaruvi</p>
          <h2>Barcha buyurtmalar</h2>
        </div>
        <span className="record-count">{safeRows.length} ta yozuv</span>
      </div>
      <OrderTable rows={safeRows} reload={reload} />
    </section>
  );
}
