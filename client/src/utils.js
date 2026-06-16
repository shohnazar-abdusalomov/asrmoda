import {
  LayoutDashboard, ClipboardList, Users, Package,
  Warehouse, Building2, Headphones, UserCog
} from "lucide-react";

export const money = (value) => `${Number(value || 0).toLocaleString("uz-UZ")} so'm`;

export const categories = [
  { id: "women", label: "Ayollar uchun", note: "Yangi mavsum siluetlari", image: "/assets/products/AM-W-101.png", count: "3 mahsulot" },
  { id: "men", label: "Erkaklar uchun", note: "Kundalik aniqlik", image: "/assets/products/AM-M-204.png", count: "2 mahsulot" },
  { id: "kids", label: "Bolalar uchun", note: "Qulay va erkin", image: "/assets/products/AM-K-304.png", count: "1 mahsulot" },
  { id: "accessories", label: "Aksessuarlar", note: "Uslubni yakunlang", image: "/assets/products/AM-A-410.png", count: "2 mahsulot" }
];

export const productImage = (product) => product.image_url || `/assets/products/${product.sku}.png`;

export function fileToDataUrl(file, maxSize = 900) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Faylni o'qib bo'lmadi"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Rasmni yuklab bo'lmadi"));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export const statusLabels = {
  new: "Yangi",
  confirmed: "Tasdiqlangan",
  packing: "Qadoqlanmoqda",
  shipped: "Yo'lda",
  delivered: "Yetkazildi",
  cancelled: "Bekor qilingan"
};

export const menuItems = [
  ["dashboard", LayoutDashboard, "Dashboard", ["admin", "sales", "warehouse", "finance"]],
  ["orders", ClipboardList, "Buyurtmalar", ["admin", "sales", "warehouse"]],
  ["crm", Users, "CRM", ["admin", "sales"]],
  ["products", Package, "Mahsulotlar", ["admin", "sales", "warehouse"]],
  ["wms", Warehouse, "WMS / Ombor", ["admin", "warehouse"]],
  ["erp", Building2, "ERP / Moliya", ["admin", "finance"]],
  ["support", Headphones, "Murojaatlar", ["admin", "sales"]],
  ["users", UserCog, "Foydalanuvchilar", ["admin"]]
];
