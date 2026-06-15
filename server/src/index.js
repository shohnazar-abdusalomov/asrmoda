import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { pool, query, transaction } from "./db.js";
import { initializeDatabase } from "./schema.js";
import { requireAuth, requireRole, signUser } from "./auth.js";

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(",") || true }));
app.use(express.json({ limit: "8mb" }));
app.use(morgan("combined"));

app.get("/api/health", async (_req, res) => {
  const result = await query("SELECT NOW() AS time");
  res.json({ status: "ok", database: "connected", time: result.rows[0].time });
});

app.get("/api/products", async (req, res) => {
  const { category = "all", q = "" } = req.query;
  const result = await query(
    `SELECT p.*, COALESCE(SUM(i.quantity),0)::int AS stock
     FROM products p LEFT JOIN inventory i ON i.product_id=p.id
     WHERE p.active=true
       AND ($1='all' OR p.category=$1)
       AND (p.name_uz ILIKE $2 OR p.name_en ILIKE $2 OR p.sku ILIKE $2)
     GROUP BY p.id ORDER BY p.id`,
    [category, `%${q}%`]
  );
  res.json(result.rows);
});

app.get("/api/products/:id", async (req, res) => {
  const result = await query(
    `SELECT p.*, COALESCE(SUM(i.quantity),0)::int AS stock
     FROM products p LEFT JOIN inventory i ON i.product_id=p.id
     WHERE p.id=$1 GROUP BY p.id`,
    [req.params.id]
  );
  if (!result.rowCount) return res.status(404).json({ message: "Mahsulot topilmadi" });
  res.json(result.rows[0]);
});

app.post("/api/auth/login", async (req, res) => {
  const parsed = z.object({ email: z.email(), password: z.string().min(8) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Email yoki parol noto'g'ri" });
  const result = await query("SELECT * FROM users WHERE email=$1", [parsed.data.email.toLowerCase()]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(parsed.data.password, user.password_hash))) {
    return res.status(401).json({ message: "Email yoki parol noto'g'ri" });
  }
  res.json({
    token: signUser(user),
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

app.post("/api/register", async (req, res) => {
  const parsed = z.object({
    name: z.string().min(2),
    phone: z.string().min(7),
    email: z.union([z.email(), z.literal("")]).optional(),
    password: z.string().min(8)
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Ma'lumotlarni to'g'ri kiriting" });
  const { name, phone, email, password } = parsed.data;
  if (email) {
    const existing = await query("SELECT id FROM customers WHERE email=$1", [email.toLowerCase()]);
    if (existing.rowCount) return res.status(409).json({ message: "Bu email allaqachon ro'yxatdan o'tgan" });
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const result = await query(
    `INSERT INTO customers (name, phone, email, segment, city, total_spent, password_hash)
     VALUES ($1, $2, $3, 'new', '', 0, $4) RETURNING id, name, phone, email, segment`,
    [name, phone, email?.toLowerCase() || null, passwordHash]
  );
  res.status(201).json(result.rows[0]);
});

app.patch("/api/auth/profile", requireAuth, async (req, res) => {
  const parsed = z.object({
    name: z.string().min(2),
    email: z.email(),
    password: z.string().min(8).optional()
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Profil ma'lumotlarini tekshiring" });
  const { name, email, password } = parsed.data;
  const lowerEmail = email.toLowerCase();
  const clash = await query("SELECT id FROM users WHERE email=$1 AND id<>$2", [lowerEmail, req.user.sub]);
  if (clash.rowCount) return res.status(409).json({ message: "Bu email allaqachon ishlatilgan" });
  const result = password
    ? await query(
        "UPDATE users SET name=$1,email=$2,password_hash=$3 WHERE id=$4 RETURNING id,name,email,role",
        [name, lowerEmail, await bcrypt.hash(password, 12), req.user.sub])
    : await query(
        "UPDATE users SET name=$1,email=$2 WHERE id=$3 RETURNING id,name,email,role",
        [name, lowerEmail, req.user.sub]);
  if (!result.rowCount) return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
  res.json(result.rows[0]);
});

app.post("/api/checkout", async (req, res, next) => {
  const schema = z.object({
    customer: z.object({
      name: z.string().min(2),
      phone: z.string().min(7),
      email: z.union([z.email(), z.literal("")]).optional(),
      city: z.string().min(2),
      address: z.string().min(5),
    }),
    items: z.array(z.object({ productId: z.number().int(), quantity: z.number().int().min(1).max(20) })).min(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Buyurtma ma'lumotlarini tekshiring" });
  try {
    const order = await transaction(async (client) => {
      const ids = parsed.data.items.map((item) => item.productId);
      const productsResult = await client.query("SELECT id,price FROM products WHERE id=ANY($1::int[]) FOR UPDATE", [ids]);
      if (productsResult.rowCount !== new Set(ids).size) throw new Error("Mahsulot topilmadi");
      const prices = new Map(productsResult.rows.map((p) => [p.id, p.price]));
      const total = parsed.data.items.reduce((sum, item) => sum + prices.get(item.productId) * item.quantity, 0);
      const c = parsed.data.customer;
      let customer = await client.query("SELECT id FROM customers WHERE phone=$1 LIMIT 1", [c.phone]);
      if (!customer.rowCount) {
        customer = await client.query(
          `INSERT INTO customers (name,phone,email,segment,city,total_spent)
           VALUES ($1,$2,$3,'new',$4,$5) RETURNING id`,
          [c.name, c.phone, c.email || null, c.city, total]
        );
      } else {
        await client.query("UPDATE customers SET total_spent=total_spent+$1 WHERE id=$2", [total, customer.rows[0].id]);
      }
      const number = `ASR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      const orderResult = await client.query(
        `INSERT INTO orders (order_number,customer_id,status,payment_status,total,delivery_address)
         VALUES ($1,$2,'new','cash_on_delivery',$3,$4) RETURNING *`,
        [number, customer.rows[0].id, total, `${c.city}, ${c.address}`]
      );
      for (const item of parsed.data.items) {
        await client.query(
          "INSERT INTO order_items (order_id,product_id,quantity,unit_price) VALUES ($1,$2,$3,$4)",
          [orderResult.rows[0].id, item.productId, item.quantity, prices.get(item.productId)]
        );
        const stock = await client.query(
          `SELECT id,warehouse_id,quantity FROM inventory
           WHERE product_id=$1 AND quantity >= $2 ORDER BY quantity DESC LIMIT 1 FOR UPDATE`,
          [item.productId, item.quantity]
        );
        if (!stock.rowCount) throw new Error("Omborda yetarli mahsulot yo'q");
        await client.query("UPDATE inventory SET quantity=quantity-$1 WHERE id=$2", [item.quantity, stock.rows[0].id]);
        await client.query(
          `INSERT INTO stock_movements (product_id,warehouse_id,movement_type,quantity,reference)
           VALUES ($1,$2,'sale',$3,$4)`,
          [item.productId, stock.rows[0].warehouse_id, -item.quantity, number]
        );
      }
      return orderResult.rows[0];
    });
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

app.post("/api/orders/lookup", async (req, res) => {
  const parsed = z.object({ orderNumber: z.string().min(4), phone: z.string().min(7) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Buyurtma raqami va telefonni kiriting" });
  const result = await query(
    `SELECT o.order_number,o.status,o.payment_status,o.total,o.delivery_address,o.created_at,
      c.name AS customer, COALESCE(json_agg(json_build_object(
        'name',p.name_uz,'quantity',oi.quantity,'price',oi.unit_price
      )) FILTER (WHERE oi.id IS NOT NULL),'[]') AS items
     FROM orders o JOIN customers c ON c.id=o.customer_id
     LEFT JOIN order_items oi ON oi.order_id=o.id LEFT JOIN products p ON p.id=oi.product_id
     WHERE UPPER(o.order_number)=UPPER($1) AND regexp_replace(c.phone,'\\D','','g')=regexp_replace($2,'\\D','','g')
     GROUP BY o.id,c.id`,
    [parsed.data.orderNumber.trim(), parsed.data.phone]
  );
  if (!result.rowCount) return res.status(404).json({ message: "Buyurtma topilmadi. Ma'lumotlarni tekshiring." });
  res.json(result.rows[0]);
});

app.post("/api/support", async (req, res) => {
  const parsed = z.object({
    name: z.string().min(2), phone: z.string().min(7),
    email: z.union([z.email(), z.literal("")]).optional(),
    subject: z.string().min(3), message: z.string().min(10)
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Barcha majburiy maydonlarni to'ldiring" });
  const ticketNumber = `YRD-${String(Date.now()).slice(-7)}`;
  const result = await query(
    `INSERT INTO support_tickets (ticket_number,name,phone,email,subject,message)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING ticket_number,status,created_at`,
    [ticketNumber, parsed.data.name, parsed.data.phone, parsed.data.email || null, parsed.data.subject, parsed.data.message]
  );
  res.status(201).json(result.rows[0]);
});

app.get("/api/dashboard", requireAuth, async (_req, res) => {
  const [metrics, recent, lowStock] = await Promise.all([
    query(`SELECT
      COALESCE((SELECT SUM(total) FROM orders WHERE created_at > NOW()-INTERVAL '30 days'),0)::bigint AS revenue,
      (SELECT COUNT(*) FROM orders WHERE created_at > NOW()-INTERVAL '30 days')::int AS orders,
      (SELECT COUNT(*) FROM customers)::int AS customers,
      COALESCE((SELECT SUM(quantity) FROM inventory),0)::int AS units`),
    query(`SELECT o.*, c.name AS customer FROM orders o JOIN customers c ON c.id=o.customer_id
      ORDER BY o.created_at DESC LIMIT 6`),
    query(`SELECT p.name_uz,p.sku,SUM(i.quantity)::int AS quantity,SUM(i.reorder_level)::int AS threshold
      FROM inventory i JOIN products p ON p.id=i.product_id GROUP BY p.id
      HAVING SUM(i.quantity) < SUM(i.reorder_level)*1.5 ORDER BY quantity LIMIT 5`)
  ]);
  res.json({ metrics: metrics.rows[0], recentOrders: recent.rows, lowStock: lowStock.rows });
});

app.get("/api/orders", requireAuth, async (_req, res) => {
  const result = await query(`SELECT o.*,c.name AS customer,c.phone,
    COALESCE(SUM(oi.quantity),0)::int AS item_count
    FROM orders o JOIN customers c ON c.id=o.customer_id
    LEFT JOIN order_items oi ON oi.order_id=o.id GROUP BY o.id,c.id ORDER BY o.created_at DESC`);
  res.json(result.rows);
});

app.patch("/api/orders/:id/status", requireAuth, async (req, res) => {
  const parsed = z.object({ status: z.enum(["new","confirmed","packing","shipped","delivered","cancelled"]) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Noto'g'ri holat" });
  const result = await query("UPDATE orders SET status=$1 WHERE id=$2 RETURNING *", [parsed.data.status, req.params.id]);
  res.json(result.rows[0]);
});

app.get("/api/customers", requireAuth, async (_req, res) => {
  const result = await query("SELECT * FROM customers ORDER BY total_spent DESC");
  res.json(result.rows);
});

app.get("/api/customers/:id", requireAuth, async (req, res) => {
  const [customer, orders] = await Promise.all([
    query("SELECT * FROM customers WHERE id=$1", [req.params.id]),
    query("SELECT * FROM orders WHERE customer_id=$1 ORDER BY created_at DESC", [req.params.id])
  ]);
  if (!customer.rowCount) return res.status(404).json({ message: "Mijoz topilmadi" });
  res.json({ customer: customer.rows[0], orders: orders.rows });
});

app.get("/api/admin/products", requireAuth, async (_req, res) => {
  const result = await query(
    `SELECT p.*,COALESCE(SUM(i.quantity),0)::int AS stock
     FROM products p LEFT JOIN inventory i ON i.product_id=p.id
     GROUP BY p.id ORDER BY p.created_at DESC`
  );
  res.json(result.rows);
});

app.post("/api/admin/products", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = z.object({
    sku: z.string().min(3), name_uz: z.string().min(2), name_en: z.string().min(2),
    category: z.enum(["women","men","kids","accessories"]), price: z.number().int().positive(),
    compare_price: z.number().int().nonnegative().default(0), color: z.string().min(2),
    description: z.string().min(5), image_url: z.string().default(""),
    initial_stock: z.number().int().nonnegative().default(0)
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Mahsulot ma'lumotlarini tekshiring" });
  const product = await transaction(async (client) => {
    const p = parsed.data;
    const inserted = await client.query(
      `INSERT INTO products (sku,name_en,name_uz,category,price,compare_price,color,description,image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [p.sku,p.name_en,p.name_uz,p.category,p.price,p.compare_price,p.color,p.description,p.image_url || null]
    );
    await client.query(
      `INSERT INTO inventory (product_id,warehouse_id,quantity,reorder_level)
       SELECT $1,id,$2,15 FROM warehouses`,
      [inserted.rows[0].id, p.initial_stock]
    );
    return inserted.rows[0];
  });
  res.status(201).json(product);
});

app.patch("/api/admin/products/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = z.object({
    name_uz: z.string().min(2), name_en: z.string().min(2),
    category: z.enum(["women","men","kids","accessories"]), price: z.number().int().positive(),
    compare_price: z.number().int().nonnegative(), color: z.string().min(2),
    description: z.string().min(5), image_url: z.string().default(""), active: z.boolean()
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Mahsulot ma'lumotlarini tekshiring" });
  const p = parsed.data;
  const result = await query(
    `UPDATE products SET name_uz=$1,name_en=$2,category=$3,price=$4,compare_price=$5,
     color=$6,description=$7,image_url=$8,active=$9 WHERE id=$10 RETURNING *`,
    [p.name_uz,p.name_en,p.category,p.price,p.compare_price,p.color,p.description,p.image_url || null,p.active,req.params.id]
  );
  if (!result.rowCount) return res.status(404).json({ message: "Mahsulot topilmadi" });
  res.json(result.rows[0]);
});

app.get("/api/users", requireAuth, requireRole("admin"), async (_req, res) => {
  const result = await query("SELECT id,name,email,role,created_at FROM users ORDER BY id");
  res.json(result.rows);
});

app.post("/api/users", requireAuth, requireRole("admin"), async (req, res) => {
  const parsed = z.object({
    name: z.string().min(2), email: z.email(), password: z.string().min(8),
    role: z.enum(["admin","sales","warehouse","finance"])
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Foydalanuvchi ma'lumotlarini tekshiring" });
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const result = await query(
    `INSERT INTO users (name,email,password_hash,role) VALUES ($1,$2,$3,$4)
     RETURNING id,name,email,role,created_at`,
    [parsed.data.name, parsed.data.email.toLowerCase(), passwordHash, parsed.data.role]
  );
  res.status(201).json(result.rows[0]);
});

app.get("/api/inventory", requireAuth, async (_req, res) => {
  const result = await query(`SELECT i.id,p.id AS product_id,w.id AS warehouse_id,p.sku,p.name_uz,p.category,w.name AS warehouse,w.city,
    i.quantity,i.reorder_level FROM inventory i
    JOIN products p ON p.id=i.product_id JOIN warehouses w ON w.id=i.warehouse_id
    ORDER BY i.quantity ASC,p.name_uz`);
  res.json(result.rows);
});

app.post("/api/inventory/adjust", requireAuth, async (req, res) => {
  const parsed = z.object({ inventoryId: z.number().int(), change: z.number().int().min(-1000).max(1000), reason: z.string().min(2) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Ma'lumot noto'g'ri" });
  const result = await transaction(async (client) => {
    const row = await client.query("UPDATE inventory SET quantity=GREATEST(0,quantity+$1) WHERE id=$2 RETURNING *", [parsed.data.change, parsed.data.inventoryId]);
    if (!row.rowCount) throw new Error("Qoldiq topilmadi");
    await client.query(
      `INSERT INTO stock_movements (product_id,warehouse_id,movement_type,quantity,reference)
       VALUES ($1,$2,'adjustment',$3,$4)`,
      [row.rows[0].product_id, row.rows[0].warehouse_id, parsed.data.change, parsed.data.reason]
    );
    return row.rows[0];
  });
  res.json(result);
});

app.post("/api/inventory/transfer", requireAuth, requireRole("admin","warehouse"), async (req, res) => {
  const parsed = z.object({
    productId: z.number().int(), fromWarehouseId: z.number().int(),
    toWarehouseId: z.number().int(), quantity: z.number().int().positive()
  }).refine((v) => v.fromWarehouseId !== v.toWarehouseId).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Ko'chirish ma'lumotlarini tekshiring" });
  try {
    const result = await transaction(async (client) => {
      const p = parsed.data;
      const source = await client.query(
        "SELECT * FROM inventory WHERE product_id=$1 AND warehouse_id=$2 FOR UPDATE",
        [p.productId,p.fromWarehouseId]
      );
      if (!source.rowCount || source.rows[0].quantity < p.quantity) throw new Error("Manba omborda qoldiq yetarli emas");
      await client.query("UPDATE inventory SET quantity=quantity-$1 WHERE id=$2", [p.quantity,source.rows[0].id]);
      const target = await client.query(
        "UPDATE inventory SET quantity=quantity+$1 WHERE product_id=$2 AND warehouse_id=$3 RETURNING *",
        [p.quantity,p.productId,p.toWarehouseId]
      );
      const ref = `TR-${String(Date.now()).slice(-7)}`;
      await client.query(
        `INSERT INTO stock_movements (product_id,warehouse_id,movement_type,quantity,reference)
         VALUES ($1,$2,'transfer_out',$3,$4),($1,$5,'transfer_in',$6,$4)`,
        [p.productId,p.fromWarehouseId,-p.quantity,ref,p.toWarehouseId,p.quantity]
      );
      return { reference: ref, target: target.rows[0] };
    });
    res.json(result);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
});

app.get("/api/erp", requireAuth, async (_req, res) => {
  const [suppliers, purchasing, monthly] = await Promise.all([
    query("SELECT * FROM suppliers ORDER BY rating DESC"),
    query(`SELECT po.*,s.name AS supplier FROM purchase_orders po JOIN suppliers s ON s.id=po.supplier_id ORDER BY expected_date`),
    query(`SELECT TO_CHAR(date_trunc('month',d),'Mon') AS month,
      COALESCE(SUM(o.total),0)::bigint AS revenue
      FROM generate_series(NOW()-INTERVAL '5 months',NOW(),INTERVAL '1 month') d
      LEFT JOIN orders o ON date_trunc('month',o.created_at)=date_trunc('month',d)
      GROUP BY date_trunc('month',d) ORDER BY date_trunc('month',d)`)
  ]);
  res.json({ suppliers: suppliers.rows, purchaseOrders: purchasing.rows, monthly: monthly.rows });
});

app.patch("/api/purchase-orders/:id", requireAuth, requireRole("admin","finance"), async (req, res) => {
  const parsed = z.object({ status: z.enum(["draft","approved","in_transit","received","cancelled"]) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Noto'g'ri holat" });
  const result = await query("UPDATE purchase_orders SET status=$1 WHERE id=$2 RETURNING *", [parsed.data.status,req.params.id]);
  res.json(result.rows[0]);
});

app.get("/api/support", requireAuth, async (_req, res) => {
  const result = await query("SELECT * FROM support_tickets ORDER BY created_at DESC");
  res.json(result.rows);
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.message?.includes("yetarli") ? 409 : 500).json({ message: error.message || "Server xatosi" });
});

async function start() {
  let attempts = 0;
  while (attempts < 20) {
    try {
      await initializeDatabase();
      break;
    } catch (error) {
      attempts += 1;
      if (attempts === 20) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
  app.listen(port, "0.0.0.0", () => console.log(`AsrModa API listening on ${port}`));
}

start();

process.on("SIGTERM", async () => {
  await pool.end();
  process.exit(0);
});
