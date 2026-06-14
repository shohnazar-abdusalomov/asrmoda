import { Headphones } from "lucide-react";

const ticketStatusLabels = {
  open: "Yangi",
  in_progress: "Ko'rib chiqilmoqda",
  resolved: "Hal qilindi",
  closed: "Yopildi"
};

export default function SupportAdmin({ rows }) {
  const safeRows = Array.isArray(rows) ? rows : [];
  return (
    <section className="panel full-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Mijozlarga xizmat</p>
          <h2>Murojaatlar</h2>
        </div>
        <span className="record-count">{safeRows.length} ta</span>
      </div>
      {!safeRows.length
        ? <div className="empty"><Headphones /><h3>Murojaatlar yo'q</h3></div>
        : <div className="ticket-list">
            {safeRows.map((ticket) => (
              <article key={ticket.id}>
                <div>
                  <span className={`ticket-badge ${ticket.status}`}>{ticketStatusLabels[ticket.status] || ticket.status}</span>
                  <small>{ticket.ticket_number} · {new Date(ticket.created_at).toLocaleString("uz-UZ")}</small>
                </div>
                <h3>{ticket.subject}</h3>
                <p>{ticket.message}</p>
                <div className="ticket-footer">
                  <span><b>{ticket.name}</b> · {ticket.phone}</span>
                  {ticket.email && <a href={`mailto:${ticket.email}`}>{ticket.email}</a>}
                </div>
              </article>
            ))}
          </div>
      }
    </section>
  );
}
