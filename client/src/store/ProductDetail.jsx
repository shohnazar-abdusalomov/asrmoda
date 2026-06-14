import { Heart, PackageCheck, ShieldCheck, ShoppingBag, Truck, X } from "lucide-react";
import { categories, money, productImage } from "../utils.js";

export default function ProductDetail({ product, favorite, onClose, onFavorite, onAdd }) {
  return (
    <div className="overlay modal-layer" onMouseDown={onClose}>
      <div className="modal product-modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X /></button>
        <div className="product-detail-art">
          <img src={productImage(product)} alt={product.name_uz} />
        </div>
        <div className="product-detail-copy">
          <p className="eyebrow">{categories.find((c) => c.id === product.category)?.label} · {product.sku}</p>
          <h1>{product.name_uz}</h1>
          <p>{product.description}</p>
          <div className="detail-price">
            <strong>{money(product.price)}</strong>
            {product.compare_price > 0 && <del>{money(product.compare_price)}</del>}
          </div>
          <div className="detail-facts">
            <span><PackageCheck /><b>{product.stock} dona</b> omborda</span>
            <span><Truck /><b>1-3 kun</b> yetkazish</span>
            <span><ShieldCheck /><b>14 kun</b> qaytarish</span>
          </div>
          <div className="detail-actions">
            <button className="button primary" onClick={() => onAdd(product)}>
              <ShoppingBag /> Savatga qo'shish
            </button>
            <button
              className={`button secondary ${favorite ? "favorite-active" : ""}`}
              onClick={() => onFavorite(product.id)}
            >
              <Heart fill={favorite ? "currentColor" : "none"} /> {favorite ? "Saqlandi" : "Saqlash"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
