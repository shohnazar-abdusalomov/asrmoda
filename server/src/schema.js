import bcrypt from "bcryptjs";
import { query } from "./db.js";

const products = [
  ["AM-W-101", "Linen overshirt", "Zig'ir matoli ko'ylak", "women", 389000, 460000, "cream", "Yengil zig'ir aralashmasi, kundalik va ofis uslubi uchun.", "/assets/products/AM-W-101.png", 1],
  ["AM-M-204", "Sage utility shirt", "Yashil utility ko'ylak", "men", 429000, 0, "sage", "Mustahkam paxta, erkin bichim va aniq detallar.", "/assets/products/AM-M-204.png", 1],
  ["AM-W-118", "Tailored trousers", "Klassik keng shim", "women", 349000, 0, "sand", "Yuqori bel, yumshoq tuzilma va zamonaviy siluet.", "/assets/products/AM-W-118.png", 1],
  ["AM-K-304", "Cotton polo set", "Bolalar polo to'plami", "kids", 279000, 320000, "navy", "Nafas oluvchi paxta va faol kunlar uchun qulay bichim.", "/assets/products/AM-K-304.png", 1],
  ["AM-A-410", "Structured tote", "Klassik qora sumka", "accessories", 519000, 0, "black", "Kundalik hujjatlar va qurilmalar uchun sig'imli sumka.", "/assets/products/AM-A-410.png", 1],
  ["AM-W-129", "Soft knit cardigan", "Yumshoq trikotaj kardigan", "women", 329000, 0, "oat", "Mavsumlar oralig'i uchun mayin va ixcham qatlam.", "/assets/products/AM-W-129.png", 1],
  ["AM-M-216", "Relaxed chino", "Erkin bichimli chino", "men", 369000, 410000, "stone", "Harakat uchun qulay, ozoda kundalik shim.", "/assets/products/AM-M-216.png", 1],
  ["AM-A-431", "Minimal leather belt", "Minimal charm kamar", "accessories", 189000, 0, "brown", "Sodda metall qisqichli tabiiy charm kamar.", "/assets/products/AM-A-431.png", 1]
];

export async function initializeDatabase() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin','sales','warehouse','finance')),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      sku TEXT UNIQUE NOT NULL,
      name_en TEXT NOT NULL,
      name_uz TEXT NOT NULL,
      category TEXT NOT NULL,
      price INTEGER NOT NULL,
      compare_price INTEGER DEFAULT 0,
      color TEXT NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT,
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS warehouses (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL
    );
    CREATE TABLE IF NOT EXISTS inventory (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL DEFAULT 0,
      reorder_level INTEGER NOT NULL DEFAULT 10,
      UNIQUE(product_id, warehouse_id)
    );
    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      segment TEXT DEFAULT 'new',
      city TEXT,
      total_spent BIGINT DEFAULT 0,
      password_hash TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      customer_id INTEGER REFERENCES customers(id),
      status TEXT NOT NULL DEFAULT 'new',
      payment_status TEXT NOT NULL DEFAULT 'pending',
      total BIGINT NOT NULL,
      delivery_address TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id),
      quantity INTEGER NOT NULL,
      unit_price INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS suppliers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      contact TEXT NOT NULL,
      lead_days INTEGER DEFAULT 7,
      rating NUMERIC(2,1) DEFAULT 4.5
    );
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id SERIAL PRIMARY KEY,
      po_number TEXT UNIQUE NOT NULL,
      supplier_id INTEGER REFERENCES suppliers(id),
      status TEXT NOT NULL,
      total BIGINT NOT NULL,
      expected_date DATE
    );
    CREATE TABLE IF NOT EXISTS stock_movements (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id),
      warehouse_id INTEGER REFERENCES warehouses(id),
      movement_type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      reference TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS support_tickets (
      id SERIAL PRIMARY KEY,
      ticket_number TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await query("ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT");
  await query("ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash TEXT");
  // Mavjud buyurtma raqamlarini eski "AM-" prefiksidan "ASR-" ga ko'chirish
  await query("UPDATE orders SET order_number = 'ASR-' || substring(order_number from 4) WHERE order_number LIKE 'AM-%'");
  for (const product of products) {
    await query("UPDATE products SET image_url=$1 WHERE sku=$2 AND (image_url IS NULL OR image_url='')", [product[8], product[0]]);
  }

  const demoUsers = [
    ["Shohnazar Abdusalomov", "admin@asrmoda.uz", "admin"],
    ["Madina Karimova", "sales@asrmoda.uz", "sales"],
    ["Javohir Ergashev", "warehouse@asrmoda.uz", "warehouse"],
    ["Nilufar Rahimova", "finance@asrmoda.uz", "finance"]
  ];
  const hash = await bcrypt.hash("AsrModa2026!", 12);
  for (const [name, email, role] of demoUsers) {
    await query(
      `INSERT INTO users (name,email,password_hash,role) VALUES ($1,$2,$3,$4)
       ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, role=EXCLUDED.role`,
      [name, email, hash, role]
    );
  }

  const productCount = await query("SELECT COUNT(*)::int AS count FROM products");
  if (!productCount.rows[0].count) {
    for (const product of products) {
      await query(
        `INSERT INTO products
        (sku,name_en,name_uz,category,price,compare_price,color,description,image_url,active)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        product
      );
    }
    await query(`
      INSERT INTO warehouses (name,city,code) VALUES
        ('Markaziy ombor','Toshkent','TAS-01'),
        ('Samarqand ombori','Samarqand','SAM-01'),
        ('Farg''ona ombori','Farg''ona','FER-01'),
        ('Buxoro ombori','Buxoro','BUX-01');
      INSERT INTO inventory (product_id,warehouse_id,quantity,reorder_level)
      SELECT p.id, w.id, 18 + ((p.id * w.id * 7) % 83), 15
      FROM products p CROSS JOIN warehouses w;
      INSERT INTO customers (name,phone,email,segment,city,total_spent) VALUES
        ('Dilnoza Karimova','+998 90 123 45 67','dilnoza@example.uz','vip','Toshkent',8420000),
        ('Azizbek Rasulov','+998 93 765 43 21','aziz@example.uz','regular','Samarqand',3180000),
        ('Malika Shop','+998 95 555 22 11','buyurtma@malika.uz','wholesale','Buxoro',24600000),
        ('Navbahor Textile','+998 99 220 18 80','sales@navbahor.uz','wholesale','Farg''ona',19750000);
      INSERT INTO suppliers (name,contact,lead_days,rating) VALUES
        ('Tashkent Textile Group','Akmal +998 90 777 10 10',5,4.8),
        ('Fergana Cotton Works','Shahnoza +998 93 414 20 20',8,4.6),
        ('Anatolia Accessories','Emre +90 532 555 11 22',14,4.4);
      INSERT INTO purchase_orders (po_number,supplier_id,status,total,expected_date) VALUES
        ('PO-26018',1,'in_transit',18400000,CURRENT_DATE + 3),
        ('PO-26019',2,'approved',12750000,CURRENT_DATE + 8),
        ('PO-26020',3,'draft',8900000,CURRENT_DATE + 16);
      INSERT INTO orders (order_number,customer_id,status,payment_status,total,delivery_address,created_at) VALUES
        ('ASR-2026-001001',1,'delivered','paid',2450000,'Toshkent, Yunusabad tumani',NOW()-INTERVAL '8 days'),
        ('ASR-2026-001002',1,'shipped','paid',3890000,'Toshkent, Yunusabad tumani',NOW()-INTERVAL '3 days'),
        ('ASR-2026-001003',2,'confirmed','pending',1230000,'Samarqand, Samarqand tumani',NOW()-INTERVAL '2 days'),
        ('ASR-2026-001004',3,'delivered','paid',12300000,'Buxoro, Buxoro tumani',NOW()-INTERVAL '15 days'),
        ('ASR-2026-001005',3,'delivered','paid',8900000,'Buxoro, Buxoro tumani',NOW()-INTERVAL '10 days'),
        ('ASR-2026-001006',4,'delivered','paid',9850000,'Farg''ona, Farg''ona tumani',NOW()-INTERVAL '12 days');
      INSERT INTO order_items (order_id,product_id,quantity,unit_price) VALUES
        (1,1,2,389000),(1,3,1,349000),
        (2,2,1,429000),(2,5,1,519000),
        (3,4,2,279000),
        (4,1,5,389000),(4,2,3,429000),
        (5,3,4,349000),(5,4,2,279000),
        (6,1,3,389000),(6,5,2,519000);
    `);
  }

  await query(`
    INSERT INTO support_tickets (ticket_number,name,phone,email,subject,message,status,created_at) VALUES
      ('YRD-0000001','Dilnoza Karimova','+998 90 123 45 67','dilnoza@example.uz','Buyurtma bo''yicha','ASR-2026-123456 raqamli buyurtmam 3 kundan beri yo''lda ko''rsatilmoqda. Yetkazish muddati qachon?','open',NOW()-INTERVAL '2 days'),
      ('YRD-0000002','Azizbek Rasulov','+998 93 765 43 21',NULL,'Qaytarish','Kechagina olgan ko''ylakni qaytarmoqchiman. Razmer mos kelmadi, S emas M kerak edi.','in_progress',NOW()-INTERVAL '1 day'),
      ('YRD-0000003','Malika Yusupova','+998 97 300 11 22','malika.buyurtma@gmail.com','Ulgurji hamkorlik','Biznes partnyorlik bo''yicha qiziqaman. Oyiga 200+ dona buyurtma berishimiz mumkin, narxlar bo''yicha muzokaralamoqchiman.','resolved',NOW()-INTERVAL '4 days'),
      ('YRD-0000004','Jamshid Toshmatov','+998 99 555 88 77',NULL,'Texnik yordam','Sayt orqali buyurtma qilishga harakat qildim lekin to''lov sahifasiga o''ta olmayapman. Xato xabar chiqmoqda.','open',NOW()-INTERVAL '3 hours'),
      ('YRD-0000005','Shahlo Mirzayeva','+998 91 200 34 56','shahlo@inbox.uz','Buyurtma bo''yicha','Buyurtmamga noto''g''ri rang yuborilgan. Krем rang buyurtma qilgandim, oq keldi. Almashtirish imkoni bormi?','in_progress',NOW()-INTERVAL '6 hours')
    ON CONFLICT (ticket_number) DO NOTHING
  `);
}
