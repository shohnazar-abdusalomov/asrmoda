import { Eye, Heart, Plus } from "lucide-react";
import { categories, money, productImage } from "../utils.js";

export default function ProductCard({ product, favorite, onFavorite, onAdd, onOpen }) {
  const discount = product.compare_price ? Math.round((1 - product.price / product.compare_price) * 100) : 0;
  return (
    <article className="product-card">
      <div
        className="product-art"
        role="button"
        tabIndex="0"
        onClick={() => onOpen(product)}
        onKeyDown={(e) => e.key === "Enter" && onOpen(product)}
      >
        {discount > 0 && <span className="sale">-{discount}%</span>}
        <button
          className={`heart ${favorite ? "active" : ""}`}
          onClick={(e) => { e.stopPropagation(); onFavorite(product.id); }}
        >
          <Heart fill={favorite ? "currentColor" : "none"} />
        </button>
        <img src={productImage(product)} alt={product.name_uz} loading="lazy" />
        <span className="quick-view"><Eye /> Batafsil</span>
      </div>
      <div className="product-info">
        <p className="eyebrow">{categories.find((c) => c.id === product.category)?.label}</p>
        <button className="product-title" onClick={() => onOpen(product)}><h3>{product.name_uz}</h3></button>
        <p className="muted">{product.description}</p>
        <div className="price-row">
          <div>
            <strong>{money(product.price)}</strong>
            {product.compare_price > 0 && <del>{money(product.compare_price)}</del>}
          </div>
          <button onClick={() => onAdd(product)} aria-label="Savatga qo'shish"><Plus /></button>
        </div>
      </div>
    </article>
  );
}
