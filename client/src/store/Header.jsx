import { useState } from "react";
import { CircleUserRound, Heart, Menu, Search, ShoppingBag, Truck, X } from "lucide-react";
import Logo from "../components/Logo.jsx";
import { money, productImage } from "../utils.js";

export default function Header({ cartCount, favoriteCount, onCart, onFavorites, onLogin, navigate, onRegister, category, setCategory, search, setSearch, products, onProduct }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <>
      <div className="announcement">
        <span><Truck size={15} /> 500 000 so'mdan yuqori buyurtmalar uchun bepul yetkazib berish</span>
        <div>
          <button onClick={() => navigate("help")}>Yordam</button>
          <button onClick={() => navigate("orders")}>Buyurtmalarim</button>
          <button onClick={onRegister}>Ro'yxatdan o'tish</button>
        </div>
      </div>
      <header className="header shell">
        <button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)}><Menu /></button>
        <button
          className="brand"
          onClick={() => { navigate("home"); setCategory("all"); window.scrollTo(0, 0); }}
          aria-label="Bosh sahifaga qaytish"
        >
          <Logo width={120} />
        </button>
        <nav className={mobileOpen ? "nav open" : "nav"}>
          <button className={!category || category === "all" ? "active" : ""} onClick={() => { navigate("home"); setCategory("all"); }}>Bosh sahifa</button>
          <button onClick={() => { navigate("home"); setCategory("all"); setTimeout(() => document.querySelector("#catalog")?.scrollIntoView({ behavior: "smooth" }), 0); }}>Katalog</button>
          <button className={category === "women" ? "active" : ""} onClick={() => { navigate("home"); setCategory("women"); setTimeout(() => document.querySelector("#catalog")?.scrollIntoView({ behavior: "smooth" }), 50); }}>Ayollar</button>
          <button className={category === "men" ? "active" : ""} onClick={() => { navigate("home"); setCategory("men"); setTimeout(() => document.querySelector("#catalog")?.scrollIntoView({ behavior: "smooth" }), 50); }}>Erkaklar</button>
          <button className={category === "kids" ? "active" : ""} onClick={() => { navigate("home"); setCategory("kids"); setTimeout(() => document.querySelector("#catalog")?.scrollIntoView({ behavior: "smooth" }), 50); }}>Bolalar</button>
          <button className={category === "accessories" ? "active" : ""} onClick={() => { navigate("home"); setCategory("accessories"); setTimeout(() => document.querySelector("#catalog")?.scrollIntoView({ behavior: "smooth" }), 50); }}>Aksessuarlar</button>
        </nav>
        <div className="header-actions">
          <div className="store-search">
            <Search size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => navigate("home")}
              placeholder="Mahsulot qidirish..."
            />
            {search && <button onClick={() => setSearch("")}><X /></button>}
            {search && (
              <div className="search-results">
                <small>{products.length} ta natija</small>
                {products.slice(0, 5).map((product) => (
                  <button key={product.id} onClick={() => onProduct(product)}>
                    <span className="search-thumb"><img src={productImage(product)} alt="" /></span>
                    <span><b>{product.name_uz}</b><small>{money(product.price)}</small></span>
                  </button>
                ))}
                {!products.length && <p>Mahsulot topilmadi</p>}
              </div>
            )}
          </div>
          <button onClick={onLogin} title="Xodimlar uchun"><CircleUserRound /></button>
          <button className="count-button" onClick={onFavorites}><Heart /><b>{favoriteCount}</b></button>
          <button className="count-button" onClick={onCart}><ShoppingBag /><b>{cartCount}</b></button>
        </div>
      </header>
    </>
  );
}
