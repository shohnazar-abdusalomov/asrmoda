import { useState } from "react";
import { Box, Edit3, Plus, Save, X } from "lucide-react";
import { api } from "../api.js";
import { categories, fileToDataUrl, money, productImage } from "../utils.js";
import Select from "../components/Select.jsx";

const categoryOptions = categories.map((c) => ({ value: c.id, label: c.label }));
const colorOptions = ["cream","sage","sand","navy","black","oat","stone","brown"].map((v) => ({ value: v, label: v }));

export default function ProductsAdmin({ rows, reload, user }) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const empty = { sku: "", name_uz: "", name_en: "", category: "women", price: 0, compare_price: 0, color: "cream", description: "", image_url: "", initial_stock: 0, active: true };
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const open = (product = null) => {
    setSelected(product || "new");
    setForm(product ? { ...product, price: Number(product.price), compare_price: Number(product.compare_price) } : empty);
    setError("");
  };

  const pickImage = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Faqat rasm fayllari qabul qilinadi"); return; }
    setUploading(true);
    setError("");
    try {
      setForm((current) => ({ ...current, image_url: "" }));
      const dataUrl = await fileToDataUrl(file);
      setForm((current) => ({ ...current, image_url: dataUrl }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const isNew = selected === "new";
      await api(
        isNew ? "/admin/products" : `/admin/products/${selected.id}`,
        { method: isNew ? "POST" : "PATCH", body: JSON.stringify(form) }
      );
      setSelected(null);
      reload();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="panel full-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Katalog boshqaruvi</p>
          <h2>Mahsulotlar</h2>
        </div>
        {user.role === "admin" && (
          <button className="button primary compact" onClick={() => open()}>
            <Plus /> Yangi mahsulot
          </button>
        )}
      </div>
      <div className="admin-product-grid">
        {safeRows.map((product) => (
          <article key={product.id} className="admin-product-card">
            <div className="admin-product-art"><img src={productImage(product)} alt="" /></div>
            <div>
              <small>{product.sku} · {product.stock} dona</small>
              <h3>{product.name_uz}</h3>
              <p>{money(product.price)}</p>
              <span className={product.active ? "active-dot" : "inactive-dot"}>{product.active ? "Sotuvda" : "Yashirilgan"}</span>
            </div>
            <button onClick={() => open(product)}>
              <Edit3 />{user.role === "admin" ? "Tahrirlash" : "Ko'rish"}
            </button>
          </article>
        ))}
      </div>
      {selected && (
        <div className="overlay modal-layer" onMouseDown={() => setSelected(null)}>
          <div className="modal admin-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <div>
                <p className="eyebrow">{selected === "new" ? "Yangi yozuv" : form.sku}</p>
                <h2>{selected === "new" ? "Mahsulot qo'shish" : "Mahsulotni tahrirlash"}</h2>
              </div>
              <button onClick={() => setSelected(null)}><X /></button>
            </div>
            <form className="admin-form" onSubmit={save}>
              <div className="form-grid">
                <label>SKU<input required disabled={selected !== "new"} value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></label>
                <label>Toifa
                  <Select disabled={user.role !== "admin"} value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={categoryOptions} />
                </label>
                <label>O'zbekcha nom<input required disabled={user.role !== "admin"} value={form.name_uz} onChange={(e) => setForm({ ...form, name_uz: e.target.value })} /></label>
                <label>Inglizcha nom<input required disabled={user.role !== "admin"} value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} /></label>
                <label>Narx<input type="number" min="1" disabled={user.role !== "admin"} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></label>
                <label>Eski narx<input type="number" min="0" disabled={user.role !== "admin"} value={form.compare_price} onChange={(e) => setForm({ ...form, compare_price: Number(e.target.value) })} /></label>
                <label>Rang
                  <Select disabled={user.role !== "admin"} value={form.color} onChange={(v) => setForm({ ...form, color: v })} options={colorOptions} />
                </label>
                {selected === "new" && (
                  <label>Har bir omborga boshlang'ich qoldiq
                    <input type="number" min="0" value={form.initial_stock} onChange={(e) => setForm({ ...form, initial_stock: Number(e.target.value) })} />
                  </label>
                )}
                <label className="full">Tavsif<textarea required disabled={user.role !== "admin"} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
                <div className="full image-upload">
                  <span className="image-upload-label">Mahsulot rasmi</span>
                  <div className="image-upload-body">
                    <div className="image-upload-preview">
                      {form.image_url
                        ? <img src={form.image_url} alt="" />
                        : form.sku
                          ? <img src={`/assets/products/${form.sku}.png`} alt="" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
                          : <Box />
                      }
                    </div>
                    <div className="image-upload-controls">
                      {user.role === "admin" && (
                        <>
                          <label className="button secondary compact upload-btn">
                            {uploading ? "Yuklanmoqda..." : <><Plus /> Rasm tanlash</>}
                            <input type="file" accept="image/*" hidden disabled={uploading} onChange={(e) => { pickImage(e.target.files?.[0]); e.target.value = ""; }} />
                          </label>
                          {form.image_url && (
                            <button type="button" className="link-button" onClick={() => setForm({ ...form, image_url: "" })}>Olib tashlash</button>
                          )}
                        </>
                      )}
                      <input
                        className="image-url-input"
                        disabled={user.role !== "admin"}
                        value={form.image_url?.startsWith("data:") ? "" : (form.image_url || "")}
                        onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                        placeholder="yoki rasm manzilini kiriting"
                      />
                    </div>
                  </div>
                </div>
                {selected !== "new" && (
                  <label className="check-label full">
                    <input type="checkbox" disabled={user.role !== "admin"} checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                    Saytda ko'rsatish
                  </label>
                )}
              </div>
              {error && <p className="error">{error}</p>}
              {user.role === "admin" && <button className="button primary wide"><Save /> Saqlash</button>}
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
