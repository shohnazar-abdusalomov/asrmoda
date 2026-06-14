import { useState } from "react";
import { Save, X, Plus } from "lucide-react";
import { api } from "../api.js";
import { fileToDataUrl } from "../utils.js";

export default function ProfileModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState({ name: user.name || "", email: user.email || "", password: "" });
  const [avatar, setAvatar] = useState(user.avatar || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const pickAvatar = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Faqat rasm fayllari qabul qilinadi"); return; }
    setUploading(true);
    setError("");
    try {
      const dataUrl = await fileToDataUrl(file, 400);
      setAvatar(dataUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const body = { name: form.name, email: form.email };
      if (form.password) body.password = form.password;
      const updated = await api("/auth/profile", { method: "PATCH", body: JSON.stringify(body) });
      // Merge avatar into user object stored locally
      const withAvatar = { ...updated, avatar };
      localStorage.setItem("asrmoda_user", JSON.stringify(withAvatar));
      onSaved(withAvatar);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const initials = (form.name || "?").split(" ").map((n) => n[0]).slice(0, 2).join("");

  return (
    <div className="overlay modal-layer" onMouseDown={onClose}>
      <form className="modal small-modal" onSubmit={submit} onMouseDown={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <div>
            <p className="eyebrow">Hisob sozlamalari</p>
            <h2>Profilni tahrirlash</h2>
          </div>
          <button type="button" onClick={onClose}><X /></button>
        </div>

        <div className="profile-identity">
          {/* Avatar — clickable to upload */}
          <label className="avatar-upload-label" title="Rasm yuklash">
            {avatar
              ? <img src={avatar} alt="" className="profile-avatar-img" />
              : <span>{initials}</span>
            }
            <div className="avatar-upload-overlay">
              {uploading ? "..." : <Plus size={14} />}
            </div>
            <input
              type="file"
              accept="image/*"
              hidden
              disabled={uploading}
              onChange={(e) => { pickAvatar(e.target.files?.[0]); e.target.value = ""; }}
            />
          </label>
          <div>
            <b>{form.name || "—"}</b>
            <small className={`role-badge ${user.role}`}>{user.role}</small>
          </div>
        </div>

        <label>To'liq ism
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label>Email
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label>Yangi parol
          <input
            type="password"
            minLength="8"
            placeholder="O'zgartirmaslik uchun bo'sh qoldiring"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="button primary wide" disabled={busy}>
          {busy ? "Saqlanmoqda..." : <><Save /> Saqlash</>}
        </button>
      </form>
    </div>
  );
}
