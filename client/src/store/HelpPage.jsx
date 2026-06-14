import { useState } from "react";
import { ArrowLeft, Check, Mail, MapPin, Phone, Plus } from "lucide-react";
import { api } from "../api.js";
import Select from "../components/Select.jsx";

const subjectOptions = [
  "Buyurtma bo'yicha",
  "Qaytarish",
  "Ulgurji hamkorlik",
  "Texnik yordam",
].map((s) => ({ value: s, label: s }));

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

export default function HelpPage({ navigate }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", subject: "Buyurtma bo'yicha", message: "" });
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const ticket = await api("/support", { method: "POST", body: JSON.stringify(form) });
      setResult(ticket.ticket_number);
    } catch (err) {
      setError(err.message);
    }
  };

  const faqs = [
    ["Yetkazib berish qancha vaqt oladi?", "Toshkent bo'ylab 1 kun, boshqa hududlarga odatda 2-4 ish kuni."],
    ["Mahsulotni qanday qaytaraman?", "14 kun ichida yorliqlari saqlangan mahsulotni qo'llab-quvvatlash orqali qaytarishingiz mumkin."],
    ["To'lov qanday amalga oshiriladi?", "Hozircha buyurtma yetkazilganda naqd yoki terminal orqali to'lanadi."],
    ["Ulgurji narxlar bormi?", "Ha. Biznes kabineti yoki yordam shakli orqali savdo bo'limiga murojaat qiling."]
  ];

  return (
    <main className="content-page">
      <PageHeader
        eyebrow="Yordam markazi"
        title="Qanday yordam bera olamiz?"
        text="Yetkazish, qaytarish, to'lov va buyurtmalar bo'yicha javoblar."
        onBack={() => navigate("home")}
      />
      <div className="shell help-layout">
        <section>
          <div className="contact-grid">
            <a href="tel:+998712002026"><Phone /><span><b>Telefon</b>+998 71 200 20 26</span></a>
            <a href="mailto:info@asrmoda.uz"><Mail /><span><b>Email</b>info@asrmoda.uz</span></a>
            <div><MapPin /><span><b>Manzil</b>Toshkent shahri</span></div>
          </div>
          <h2>Ko'p so'raladigan savollar</h2>
          <div className="faq-list">
            {faqs.map(([q, a]) => (
              <details key={q}>
                <summary>{q}<Plus /></summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="support-card">
          <p className="eyebrow">Bizga yozing</p>
          <h2>Murojaat qoldirish</h2>
          {result ? (
            <div className="ticket-success">
              <Check />
              <h3>Murojaat qabul qilindi</h3>
              <p>Raqamingiz: <b>{result}</b></p>
              <button className="button secondary" onClick={() => setResult("")}>Yangi murojaat</button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <label>Ism<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
              <label>Telefon<input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
              <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
              <label>Mavzu
                <Select value={form.subject} onChange={(v) => setForm({ ...form, subject: v })} options={subjectOptions} />
              </label>
              <label>Xabar<textarea required minLength="10" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label>
              {error && <p className="error">{error}</p>}
              <button className="button primary wide">Yuborish</button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
