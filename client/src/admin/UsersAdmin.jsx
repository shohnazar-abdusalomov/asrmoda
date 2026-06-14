import { useState } from "react";
import { Plus, X } from "lucide-react";
import { api } from "../api.js";
import Select from "../components/Select.jsx";

const roleOptions = [
  { value: "sales", label: "Savdo" },
  { value: "warehouse", label: "Ombor" },
  { value: "finance", label: "Moliya" },
  { value: "admin", label: "Administrator" },
];

export default function UsersAdmin({ rows, reload }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "sales" });
  const [error, setError] = useState("");
  const safeRows = Array.isArray(rows) ? rows : [];

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api("/users", { method: "POST", body: JSON.stringify(form) });
      setOpen(false);
      reload();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="panel full-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Kirish nazorati</p>
          <h2>Foydalanuvchilar va rollar</h2>
        </div>
        <button className="button primary compact" onClick={() => setOpen(true)}>
          <Plus /> Yangi foydalanuvchi
        </button>
      </div>
      <div className="user-list">
        {safeRows.map((item) => (
          <article key={item.id}>
            {item.avatar
              ? <img src={item.avatar} alt="" className="user-list-avatar" />
              : <span>{item.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}</span>
            }
            <div>
              <h3>{item.name}</h3>
              <p>{item.email}</p>
            </div>
            <b className={`role-badge ${item.role}`}>{item.role}</b>
          </article>
        ))}
      </div>
      {open && (
        <div className="overlay modal-layer" onMouseDown={() => setOpen(false)}>
          <form className="modal small-modal" onSubmit={submit} onMouseDown={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <h2>Yangi foydalanuvchi</h2>
              <button type="button" onClick={() => setOpen(false)}><X /></button>
            </div>
            <label>To'liq ism<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            <label>Vaqtinchalik parol<input required minLength="8" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
            <label>Rol
              <Select value={form.role} onChange={(v) => setForm({ ...form, role: v })} options={roleOptions} />
            </label>
            {error && <p className="error">{error}</p>}
            <button className="button primary wide">Foydalanuvchi yaratish</button>
          </form>
        </div>
      )}
    </section>
  );
}
