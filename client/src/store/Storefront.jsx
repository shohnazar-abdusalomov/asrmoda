import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ArrowRight, Check, Minus, Plus, ShoppingBag, Truck, PackageCheck, Heart } from "lucide-react";
import { api } from "../api.js";
import { categories, money, productImage } from "../utils.js";
import Header from "./Header.jsx";
import ProductCard from "./ProductCard.jsx";
import ProductDetail from "./ProductDetail.jsx";
import HelpPage from "./HelpPage.jsx";
import OrderLookup from "./OrderLookup.jsx";
import Drawer from "./Drawer.jsx";
import Checkout from "./Checkout.jsx";
import Empty from "../components/Empty.jsx";
import Logo from "../components/Logo.jsx";

function useProducts(category, search) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    api(`/products?category=${category}&q=${encodeURIComponent(search)}`)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [category, search]);
  return { products, loading };
}

export default function Storefront({ onStaff }) {
  const routerNavigate = useNavigate();
  const location = useLocation();
  const page = location.pathname === "/yordam" ? "help" : location.pathname === "/buyurtmalarim" ? "orders" : "home";
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("asrmoda_cart") || "[]"));
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem("asrmoda_favorites") || "[]"));
  const [drawer, setDrawer] = useState(null);
  const [checkout, setCheckout] = useState(false);
  const [notice, setNotice] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { products, loading } = useProducts(category, search);

  const navigate = (nextPage) => {
    const paths = { home: "/", help: "/yordam", orders: "/buyurtmalarim" };
    routerNavigate(paths[nextPage] || "/");
    setSearch("");
    window.scrollTo(0, 0);
  };

  useEffect(() => localStorage.setItem("asrmoda_cart", JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem("asrmoda_favorites", JSON.stringify(favorites)), [favorites]);

  const add = (product) => {
    setCart((current) => {
      const found = current.find((item) => item.id === product.id);
      return found
        ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { ...product, quantity: 1 }];
    });
    setNotice("Mahsulot savatga qo'shildi");
    setTimeout(() => setNotice(""), 1800);
  };

  const updateQuantity = (id, change) => setCart((items) =>
    items.map((item) => item.id === id ? { ...item, quantity: Math.max(0, item.quantity + change) } : item)
      .filter((item) => item.quantity > 0)
  );

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="store">
      <Header
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        favoriteCount={favorites.length}
        onCart={() => setDrawer("cart")}
        onFavorites={() => setDrawer("favorites")}
        onLogin={onStaff}
        onRegister={() => routerNavigate("/register")}
        navigate={navigate}
        category={category}
        setCategory={setCategory}
        search={search}
        setSearch={setSearch}
        products={products}
        onProduct={setSelectedProduct}
      />

      {page === "help" ? (
        <HelpPage navigate={navigate} />
      ) : page === "orders" ? (
        <OrderLookup navigate={navigate} />
      ) : (
        <main>
          <section className="hero shell">
            <div className="hero-background" />
            <img
              className="hero-people"
              src="/assets/hero/hero-people.png"
              alt="AsrModa yangi kolleksiyasi"
              onError={(event) => { event.currentTarget.style.display = "none"; }}
            />
            <div className="hero-copy">
              <p className="eyebrow">2026 bahor kolleksiyasi</p>
              <h1>Zamonaviy uslub.<br />Siz uchun.</h1>
              <p>Sifatli kiyimlar, qulay narxlar va butun O'zbekiston bo'ylab tez yetkazib berish.</p>
              <div className="hero-buttons">
                <button className="button primary" onClick={() => document.querySelector("#catalog").scrollIntoView({ behavior: "smooth" })}>
                  Katalogni ko'rish <ArrowRight />
                </button>
                <button className="button secondary" onClick={() => setCategory("women")}>Yangi kolleksiya</button>
              </div>
              <div className="trust">
                <span><Check /> Sifat kafolati</span>
                <span><Truck /> Tez yetkazish</span>
                <span><PackageCheck /> 14 kun ichida qaytarish</span>
              </div>
            </div>
          </section>

          <section className="shell category-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Kolleksiyalar</p>
                <h2>Mashhur toifalar</h2>
              </div>
            </div>
            <div className="categories">
              {categories.map((item, index) => (
                <button key={item.id} className="category-card" onClick={() => { setCategory(item.id); setTimeout(() => document.querySelector("#catalog")?.scrollIntoView({ behavior: "smooth" }), 50); }}>
                  <img src={item.image} alt="" />
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <small>{item.count}</small>
                    <h3>{item.label}</h3>
                    <p>{item.note}</p>
                    <b>Kolleksiyani ko'rish <ArrowRight /></b>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="shell catalog" id="catalog">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Saralangan mahsulotlar</p>
                <h2>{category === "all" ? "Yangi mahsulotlar" : categories.find((c) => c.id === category)?.label}</h2>
              </div>
              <div className="filter-pills">
                <button className={category === "all" ? "active" : ""} onClick={() => setCategory("all")}>Barchasi</button>
                {categories.map((item) => (
                  <button className={category === item.id ? "active" : ""} key={item.id} onClick={() => setCategory(item.id)}>
                    {item.label.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
            {loading
              ? <div className="loading">Katalog yuklanmoqda...</div>
              : <div className="product-grid">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      favorite={favorites.includes(product.id)}
                      onFavorite={(id) => setFavorites((list) => list.includes(id) ? list.filter((item) => item !== id) : [...list, id])}
                      onAdd={add}
                      onOpen={setSelectedProduct}
                    />
                  ))}
                </div>
            }
          </section>

          <section className="business-banner">
            <div className="shell business-inner">
              <div>
                <p className="eyebrow">Hamkorlar uchun</p>
                <h2>Ulgurji xarid qilasizmi?</h2>
                <p>Maxsus narxlar, shaxsiy menejer va ombordan to'g'ridan-to'g'ri yetkazib berish.</p>
              </div>
              <button className="button light" onClick={onStaff}>Biznes kabineti <ArrowRight /></button>
            </div>
          </section>
        </main>
      )}

      <footer>
        <div className="shell footer-grid">
          <div>
            <div className="light-brand">
              <Logo dark width={120} />
            </div>
            <p>O'zbekiston uchun zamonaviy va ishonchli moda platformasi.</p>
          </div>
          <div>
            <b>Xaridorlarga</b>
            <button onClick={() => navigate("home")}>Katalog</button>
            <button onClick={() => navigate("help")}>Yetkazib berish</button>
            <button onClick={() => navigate("help")}>Qaytarish</button>
          </div>
          <div>
            <b>Xizmatlar</b>
            <button onClick={() => navigate("orders")}>Buyurtmani kuzatish</button>
            <button onClick={() => navigate("help")}>Yordam markazi</button>
            <button onClick={onStaff}>Biznes kabineti</button>
          </div>
          <div>
            <b>Aloqa</b>
            <a href="tel:+998712002026">+998 71 200 20 26</a>
            <a href="mailto:info@asrmoda.uz">info@asrmoda.uz</a>
            <span>Toshkent, O'zbekiston</span>
          </div>
        </div>
      </footer>

      {notice && <div className="toast"><Check />{notice}</div>}

      {drawer && (
        <Drawer title={drawer === "cart" ? "Savat" : "Sevimlilar"} onClose={() => setDrawer(null)}>
          {drawer === "cart" ? (
            <>
              {!cart.length && <Empty icon={ShoppingBag} text="Savatingiz hozircha bo'sh" />}
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div className="mini-art"><img src={productImage(item)} alt="" /></div>
                  <div>
                    <b>{item.name_uz}</b>
                    <span>{money(item.price)}</span>
                    <div className="qty">
                      <button onClick={() => updateQuantity(item.id, -1)}><Minus /></button>
                      <b>{item.quantity}</b>
                      <button onClick={() => updateQuantity(item.id, 1)}><Plus /></button>
                    </div>
                  </div>
                </div>
              ))}
              {!!cart.length && (
                <div className="drawer-total">
                  <span>Jami</span>
                  <strong>{money(total)}</strong>
                  <button className="button primary wide" onClick={() => setCheckout(true)}>Buyurtma berish</button>
                </div>
              )}
            </>
          ) : (
            <>
              {!favorites.length && <Empty icon={Heart} text="Sevimli mahsulotlar yo'q" />}
              {products.filter((p) => favorites.includes(p.id)).map((item) => (
                <div className="favorite-row" key={item.id}>
                  <span>{item.name_uz}</span>
                  <b>{money(item.price)}</b>
                  <button onClick={() => add(item)}><Plus /></button>
                </div>
              ))}
            </>
          )}
        </Drawer>
      )}

      {checkout && (
        <Checkout
          cart={cart}
          total={total}
          onClose={() => setCheckout(false)}
          onComplete={(number) => {
            setCart([]);
            setCheckout(false);
            setDrawer(null);
            setNotice(`Buyurtma qabul qilindi: ${number}`);
          }}
        />
      )}

      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          favorite={favorites.includes(selectedProduct.id)}
          onClose={() => setSelectedProduct(null)}
          onFavorite={(id) => setFavorites((list) => list.includes(id) ? list.filter((item) => item !== id) : [...list, id])}
          onAdd={(product) => { add(product); setSelectedProduct(null); }}
        />
      )}
    </div>
  );
}
