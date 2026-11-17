// MCP টুলের সংজ্ঞা: দোকানের অবস্থা দেখা, বদলানো ও বিশ্লেষণ।
// ডেটা সরাসরি Firestore (Admin SDK) থেকে আসে; সব কালেকশন kb_ দিয়ে শুরু।
import { z } from 'zod';
import { adminDb, FieldValue } from './firebaseAdmin';
import { COL } from './firebaseConfig';

// ---------- সময় (বাংলাদেশ UTC+6) ----------
const TZ = 6 * 3600 * 1000;
const dayKey = (ms) => new Date(ms + TZ).toISOString().slice(0, 10);
const weekKey = (day) => {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)); // সোমবার থেকে সপ্তাহ
  return d.toISOString().slice(0, 10);
};
const periodKey = (ms, by) => {
  const d = dayKey(ms);
  return by === 'month' ? d.slice(0, 7) : by === 'week' ? weekKey(d) : d;
};
const startOf = (day) => Date.parse(`${day}T00:00:00+06:00`);
const endOf = (day) => Date.parse(`${day}T23:59:59.999+06:00`);
const when = (ms) => new Date(ms + TZ).toISOString().replace('T', ' ').slice(0, 16);

function range(from, to, days = 30) {
  const toDay = to || dayKey(Date.now());
  const fromDay = from || dayKey(Date.now() - (days - 1) * 864e5);
  return { fromDay, toDay, from: startOf(fromDay), to: endOf(toDay) };
}

// ---------- স্কিমা ----------
const DAY = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'তারিখ YYYY-MM-DD ফরম্যাটে দিন');
const STATUS = z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']);
const productFields = {
  name: z.string().min(1),
  author: z.string(),
  price: z.number().positive(),
  regularPrice: z.number().min(0),
  stock: z.number().int().min(0),
  shortDesc: z.string(),
  description: z.string(),
  categoryIds: z.array(z.string()),
  imageUrls: z.array(z.string().url()),
  featured: z.boolean(),
};

// ---------- সাহায্যকারী ----------
const ok = (data) => ({ content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] });
const fail = (msg) => ({ isError: true, content: [{ type: 'text', text: msg }] });
const sum = (arr, f) => arr.reduce((n, x) => n + (Number(f(x)) || 0), 0);
const pct = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : 0);
const db = () => adminDb();

const ORDER_LIMIT = 1000;
async function loadOrders() {
  const s = await db().collection(COL.orders).orderBy('createdAt', 'desc').limit(ORDER_LIMIT).get();
  return s.docs.map((d) => ({ id: d.id, ...d.data() }));
}
async function loadProducts() {
  const s = await db().collection(COL.products).get();
  return s.docs.map((d) => ({ id: d.id, ...d.data() }));
}
async function loadCategories() {
  const s = await db().collection(COL.categories).get();
  return s.docs.map((d) => ({ id: d.id, ...d.data() }));
}
const active = (o) => o.status !== 'cancelled';
const truncNote = (orders) =>
  orders.length >= ORDER_LIMIT ? `সর্বশেষ ${ORDER_LIMIT}টি অর্ডার নিয়ে হিসাব করা হয়েছে; এর আগের অর্ডার ধরা হয়নি।` : undefined;
const inRange = (orders, r) => orders.filter((o) => o.createdAt >= r.from && o.createdAt <= r.to);

const brief = (o) => ({
  id: o.id,
  orderNo: o.orderNo,
  date: when(o.createdAt),
  name: o.name,
  phone: o.phone,
  total: o.total,
  status: o.status,
  payment: o.payment,
  items: (o.items || []).length,
});

function def(server, name, description, shape, fn) {
  server.tool(name, description, shape, async (args) => {
    try {
      return ok(await fn(args || {}));
    } catch (e) {
      return fail('ত্রুটি: ' + (e?.message || e));
    }
  });
}

const needConfirm = (confirm) => {
  if (confirm !== true) throw new Error('মোছার আগে ব্যবহারকারীর কাছ থেকে নিশ্চিত হয়ে confirm: true দিন।');
};

export default function registerTools(server) {
  // =============== অবস্থা জানা ===============
  def(server, 'store_overview', 'দোকানের সামগ্রিক অবস্থা: আজকের অর্ডার ও বিক্রি, পেন্ডিং অর্ডার, ৭ দিনের হিসাব, স্টক সতর্কতা।', {}, async () => {
    const [orders, products, cats] = await Promise.all([loadOrders(), loadProducts(), loadCategories()]);
    const today = dayKey(Date.now());
    const todays = orders.filter((o) => dayKey(o.createdAt) === today);
    const week = orders.filter((o) => o.createdAt >= startOf(dayKey(Date.now() - 6 * 864e5)));
    const byStatus = {};
    orders.forEach((o) => { byStatus[o.status] = (byStatus[o.status] || 0) + 1; });
    return {
      today,
      ordersToday: todays.length,
      revenueToday: sum(todays.filter(active), (o) => o.total),
      last7Days: { orders: week.filter(active).length, revenue: sum(week.filter(active), (o) => o.total) },
      pendingOrders: byStatus.pending || 0,
      ordersByStatus: byStatus,
      products: products.length,
      categories: cats.length,
      outOfStock: products.filter((p) => !(Number(p.stock) > 0)).map((p) => ({ id: p.id, name: p.name })),
      lowStock: products
        .filter((p) => Number(p.stock) > 0 && Number(p.stock) <= 5)
        .map((p) => ({ id: p.id, name: p.name, stock: p.stock })),
      note: truncNote(orders),
    };
  });

  // =============== পড়া ===============
  def(
    server,
    'list_orders',
    'অর্ডারের তালিকা (নতুন আগে)। স্ট্যাটাস, তারিখ (YYYY-MM-DD) বা নাম/ফোন/অর্ডার নম্বর দিয়ে ছাঁকা যায়।',
    {
      status: STATUS.optional(),
      from: DAY.optional(),
      to: DAY.optional(),
      search: z.string().optional(),
      limit: z.number().int().min(1).max(100).optional(),
    },
    async ({ status, from, to, search, limit }) => {
      let list = await loadOrders();
      if (status) list = list.filter((o) => o.status === status);
      if (from || to) list = inRange(list, range(from, to, 3650));
      if (search) {
        const q = search.toLowerCase();
        list = list.filter((o) => [o.name, o.phone, o.orderNo].some((v) => String(v || '').toLowerCase().includes(q)));
      }
      return { count: list.length, orders: list.slice(0, limit || 20).map(brief), note: truncNote(list) };
    }
  );

  def(server, 'get_order', 'একটি অর্ডারের পূর্ণ তথ্য (id বা orderNo দিয়ে)।', { id: z.string().optional(), orderNo: z.string().optional() }, async ({ id, orderNo }) => {
    if (id) {
      const s = await db().collection(COL.orders).doc(id).get();
      if (!s.exists) throw new Error('অর্ডার পাওয়া যায়নি');
      return { id: s.id, ...s.data() };
    }
    if (orderNo) {
      const s = await db().collection(COL.orders).where('orderNo', '==', orderNo.toUpperCase()).limit(1).get();
      if (s.empty) throw new Error('অর্ডার পাওয়া যায়নি');
      return { id: s.docs[0].id, ...s.docs[0].data() };
    }
    throw new Error('id বা orderNo দিন');
  });

  def(
    server,
    'list_products',
    'বইয়ের তালিকা। নাম/লেখক দিয়ে সার্চ, ক্যাটাগরি বা কম-স্টক দিয়ে ছাঁকা যায়।',
    { search: z.string().optional(), categoryId: z.string().optional(), lowStockOnly: z.boolean().optional(), limit: z.number().int().min(1).max(200).optional() },
    async ({ search, categoryId, lowStockOnly, limit }) => {
      const [products, cats] = await Promise.all([loadProducts(), loadCategories()]);
      const names = Object.fromEntries(cats.map((c) => [c.id, c.name]));
      let list = products;
      if (search) {
        const q = search.toLowerCase();
        list = list.filter((p) => `${p.name} ${p.author}`.toLowerCase().includes(q));
      }
      if (categoryId) list = list.filter((p) => (p.categoryIds || []).includes(categoryId));
      if (lowStockOnly) list = list.filter((p) => Number(p.stock) <= 5);
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      return {
        count: list.length,
        products: list.slice(0, limit || 50).map((p) => ({
          id: p.id,
          name: p.name,
          author: p.author,
          price: p.price,
          regularPrice: p.regularPrice || 0,
          stock: p.stock,
          featured: !!p.featured,
          categories: (p.categoryIds || []).map((c) => names[c] || c),
        })),
      };
    }
  );

  def(server, 'get_product', 'একটি বইয়ের পূর্ণ তথ্য।', { id: z.string() }, async ({ id }) => {
    const s = await db().collection(COL.products).doc(id).get();
    if (!s.exists) throw new Error('বই পাওয়া যায়নি');
    return { id: s.id, ...s.data() };
  });

  def(server, 'list_categories', 'সব ক্যাটাগরি ও প্রতিটিতে কয়টি বই আছে।', {}, async () => {
    const [cats, products] = await Promise.all([loadCategories(), loadProducts()]);
    return cats
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((c) => ({ id: c.id, name: c.name, order: c.order || 0, books: products.filter((p) => (p.categoryIds || []).includes(c.id)).length }));
  });

  def(server, 'list_reviews', 'রিভিউয়ের তালিকা (চাইলে একটি বইয়ের)।', { productId: z.string().optional(), limit: z.number().int().min(1).max(100).optional() }, async ({ productId, limit }) => {
    const col = db().collection(COL.reviews);
    const s = productId ? await col.where('productId', '==', productId).get() : await col.orderBy('createdAt', 'desc').limit(200).get();
    const list = s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    const avg = list.length ? Math.round((sum(list, (r) => r.rating) / list.length) * 10) / 10 : 0;
    return { count: list.length, averageRating: avg, reviews: list.slice(0, limit || 20).map((r) => ({ id: r.id, productId: r.productId, name: r.name, rating: r.rating, text: r.text, date: when(r.createdAt) })) };
  });

  // =============== বদলানো ===============
  def(server, 'update_order_status', 'অর্ডারের স্ট্যাটাস বদলায়। অর্ডার "নিশ্চিত" বা তার পরের ধাপে গেলে স্টক কমে, বাতিল/অপেক্ষমাণ করলে ফিরে আসে।', { id: z.string(), status: STATUS }, async ({ id, status }) => {
    const ref = db().collection(COL.orders).doc(id);
    const snap = await ref.get();
    if (!snap.exists) throw new Error('অর্ডার পাওয়া যায়নি');
    const o = snap.data();
    let deducted = !!o.stockDeducted;
    const should = status !== 'pending' && status !== 'cancelled';
    const stockNotes = [];
    const adjust = async (sign) => {
      for (const it of o.items || []) {
        try {
          await db().collection(COL.products).doc(it.id).update({ stock: FieldValue.increment(sign * Number(it.qty)) });
        } catch {
          stockNotes.push(`${it.name}: স্টক আপডেট হয়নি (বইটি আর নেই?)`);
        }
      }
    };
    if (should && !deducted) { await adjust(-1); deducted = true; }
    else if (!should && deducted) { await adjust(1); deducted = false; }
    await ref.update({ status, stockDeducted: deducted });
    return { orderNo: o.orderNo, from: o.status, to: status, stockDeducted: deducted, stockNotes };
  });

  def(
    server,
    'add_product',
    'নতুন বই যোগ করে। ছবির জন্য Cloudinary-র URL দিতে হবে (প্রথমটি কভার)।',
    {
      name: productFields.name,
      price: productFields.price,
      stock: productFields.stock,
      author: productFields.author.optional(),
      regularPrice: productFields.regularPrice.optional(),
      shortDesc: productFields.shortDesc.optional(),
      description: productFields.description.optional(),
      categoryIds: productFields.categoryIds.optional(),
      imageUrls: productFields.imageUrls.optional(),
      featured: productFields.featured.optional(),
    },
    async (a) => {
      const data = {
        name: a.name.trim(),
        author: (a.author || '').trim(),
        price: a.price,
        regularPrice: a.regularPrice || 0,
        stock: a.stock,
        shortDesc: (a.shortDesc || '').trim(),
        description: (a.description || '').trim(),
        images: a.imageUrls || [],
        categoryIds: a.categoryIds || [],
        featured: !!a.featured,
        createdAt: Date.now(),
      };
      const ref = await db().collection(COL.products).add(data);
      return { id: ref.id, created: data.name };
    }
  );

  def(
    server,
    'update_product',
    'বইয়ের তথ্য বদলায় (যেগুলো দেবেন শুধু সেগুলো)। দাম, স্টক, বিবরণ, ক্যাটাগরি, ছবি, নির্বাচিত — সবই।',
    {
      id: z.string(),
      name: productFields.name.optional(),
      author: productFields.author.optional(),
      price: productFields.price.optional(),
      regularPrice: productFields.regularPrice.optional(),
      stock: productFields.stock.optional(),
      shortDesc: productFields.shortDesc.optional(),
      description: productFields.description.optional(),
      categoryIds: productFields.categoryIds.optional(),
      imageUrls: productFields.imageUrls.optional(),
      featured: productFields.featured.optional(),
    },
    async ({ id, imageUrls, ...rest }) => {
      const data = Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined));
      if (imageUrls !== undefined) data.images = imageUrls;
      if (!Object.keys(data).length) throw new Error('বদলানোর মতো কোনো ফিল্ড দেওয়া হয়নি');
      const ref = db().collection(COL.products).doc(id);
      if (!(await ref.get()).exists) throw new Error('বই পাওয়া যায়নি');
      await ref.update(data);
      return { id, updated: Object.keys(data) };
    }
  );

  def(server, 'delete_product', 'একটি বই মুছে ফেলে। আগে ব্যবহারকারীর অনুমতি নিন, তারপর confirm: true দিন।', { id: z.string(), confirm: z.boolean() }, async ({ id, confirm }) => {
    needConfirm(confirm);
    const ref = db().collection(COL.products).doc(id);
    const s = await ref.get();
    if (!s.exists) throw new Error('বই পাওয়া যায়নি');
    await ref.delete();
    return { deleted: s.data().name };
  });

  def(server, 'add_category', 'নতুন ক্যাটাগরি যোগ করে।', { name: z.string().min(1), order: z.number().int().optional(), imageUrl: z.string().url().optional() }, async ({ name, order, imageUrl }) => {
    const ref = await db().collection(COL.categories).add({ name: name.trim(), order: order || 0, image: imageUrl || '', createdAt: Date.now() });
    return { id: ref.id, created: name };
  });

  def(server, 'update_category', 'ক্যাটাগরির নাম, ক্রম বা ছবি বদলায়।', { id: z.string(), name: z.string().optional(), order: z.number().int().optional(), imageUrl: z.string().url().optional() }, async ({ id, name, order, imageUrl }) => {
    const data = {};
    if (name !== undefined) data.name = name.trim();
    if (order !== undefined) data.order = order;
    if (imageUrl !== undefined) data.image = imageUrl;
    if (!Object.keys(data).length) throw new Error('বদলানোর মতো কিছু দেওয়া হয়নি');
    const ref = db().collection(COL.categories).doc(id);
    if (!(await ref.get()).exists) throw new Error('ক্যাটাগরি পাওয়া যায়নি');
    await ref.update(data);
    return { id, updated: Object.keys(data) };
  });

  def(server, 'delete_category', 'ক্যাটাগরি মোছে (বইগুলো মোছে না)। confirm: true লাগবে।', { id: z.string(), confirm: z.boolean() }, async ({ id, confirm }) => {
    needConfirm(confirm);
    const ref = db().collection(COL.categories).doc(id);
    const s = await ref.get();
    if (!s.exists) throw new Error('ক্যাটাগরি পাওয়া যায়নি');
    await ref.delete();
    return { deleted: s.data().name };
  });

  def(server, 'delete_review', 'একটি রিভিউ মোছে। confirm: true লাগবে।', { id: z.string(), confirm: z.boolean() }, async ({ id, confirm }) => {
    needConfirm(confirm);
    const ref = db().collection(COL.reviews).doc(id);
    if (!(await ref.get()).exists) throw new Error('রিভিউ পাওয়া যায়নি');
    await ref.delete();
    return { deleted: id };
  });

  // =============== বিশ্লেষণ ===============
  def(
    server,
    'sales_report',
    'বিক্রির রিপোর্ট: দিন/সপ্তাহ/মাস ধরে অর্ডার ও আয়, গড় অর্ডার মূল্য, বাতিলের হার, পেমেন্ট ও এলাকা অনুযায়ী ভাগ। ডিফল্ট শেষ ৩০ দিন। বাতিল অর্ডার আয়ে ধরা হয় না।',
    { from: DAY.optional(), to: DAY.optional(), groupBy: z.enum(['day', 'week', 'month']).optional() },
    async ({ from, to, groupBy }) => {
      const r = range(from, to, 30);
      const by = groupBy || 'day';
      const all = inRange(await loadOrders(), r);
      const good = all.filter(active);
      const periods = {};
      for (const o of good) {
        const k = periodKey(o.createdAt, by);
        const p = (periods[k] ||= { period: k, orders: 0, revenue: 0, books: 0 });
        p.orders += 1;
        p.revenue += Number(o.total) || 0;
        p.books += sum(o.items || [], (i) => i.qty);
      }
      const split = (key) => {
        const m = {};
        for (const o of good) {
          const k = o[key] || 'অজানা';
          const x = (m[k] ||= { orders: 0, revenue: 0 });
          x.orders += 1;
          x.revenue += Number(o.total) || 0;
        }
        return m;
      };
      const revenue = sum(good, (o) => o.total);
      return {
        range: { from: r.fromDay, to: r.toDay },
        groupBy: by,
        totals: {
          orders: good.length,
          revenue,
          bookSales: sum(good, (o) => o.subtotal),
          shippingCollected: sum(good, (o) => o.shipping),
          books: sum(good, (o) => sum(o.items || [], (i) => i.qty)),
          avgOrderValue: good.length ? Math.round(revenue / good.length) : 0,
          cancelledOrders: all.length - good.length,
          cancelRatePercent: pct(all.length - good.length, all.length),
        },
        periods: Object.values(periods).sort((a, b) => a.period.localeCompare(b.period)),
        byPayment: split('payment'),
        byArea: split('area'),
        note: truncNote(all),
      };
    }
  );

  def(
    server,
    'top_products',
    'সবচেয়ে বেশি বিক্রি হওয়া বই (পরিমাণ বা আয় ধরে)। ডিফল্ট শেষ ৩০ দিন।',
    { from: DAY.optional(), to: DAY.optional(), by: z.enum(['quantity', 'revenue']).optional(), limit: z.number().int().min(1).max(50).optional() },
    async ({ from, to, by, limit }) => {
      const r = range(from, to, 30);
      const orders = inRange(await loadOrders(), r).filter(active);
      const m = {};
      for (const o of orders) {
        for (const it of o.items || []) {
          const x = (m[it.id] ||= { id: it.id, name: it.name, quantity: 0, revenue: 0 });
          x.quantity += Number(it.qty) || 0;
          x.revenue += (Number(it.price) || 0) * (Number(it.qty) || 0);
        }
      }
      const key = by || 'quantity';
      return { range: { from: r.fromDay, to: r.toDay }, rankedBy: key, products: Object.values(m).sort((a, b) => b[key] - a[key]).slice(0, limit || 10) };
    }
  );

  def(
    server,
    'category_performance',
    'ক্যাটাগরি অনুযায়ী বিক্রি ও আয়। ডিফল্ট শেষ ৩০ দিন। (বইয়ের বর্তমান ক্যাটাগরি ধরে হিসাব)',
    { from: DAY.optional(), to: DAY.optional() },
    async ({ from, to }) => {
      const r = range(from, to, 30);
      const [orders, products, cats] = await Promise.all([loadOrders(), loadProducts(), loadCategories()]);
      const catOf = Object.fromEntries(products.map((p) => [p.id, p.categoryIds || []]));
      const names = Object.fromEntries(cats.map((c) => [c.id, c.name]));
      const m = {};
      for (const o of inRange(orders, r).filter(active)) {
        for (const it of o.items || []) {
          const ids = (catOf[it.id] || []).length ? catOf[it.id] : ['__none'];
          for (const c of ids) {
            const x = (m[c] ||= { category: c === '__none' ? 'ক্যাটাগরি নেই/বই মোছা' : names[c] || c, quantity: 0, revenue: 0 });
            x.quantity += Number(it.qty) || 0;
            x.revenue += (Number(it.price) || 0) * (Number(it.qty) || 0);
          }
        }
      }
      return { range: { from: r.fromDay, to: r.toDay }, categories: Object.values(m).sort((a, b) => b.revenue - a.revenue) };
    }
  );

  def(
    server,
    'customer_insights',
    'ক্রেতার বিশ্লেষণ (ফোন নম্বর ধরে): মোট ক্রেতা, রিপিট ক্রেতার হার, সেরা ক্রেতা। তারিখ না দিলে লোড হওয়া সব অর্ডার ধরা হয়।',
    { from: DAY.optional(), to: DAY.optional(), limit: z.number().int().min(1).max(50).optional() },
    async ({ from, to, limit }) => {
      let orders = await loadOrders();
      const n = truncNote(orders);
      if (from || to) orders = inRange(orders, range(from, to, 3650));
      const m = {};
      for (const o of orders.filter(active)) {
        const x = (m[o.phone] ||= { name: o.name, phone: o.phone, orders: 0, spent: 0, lastOrder: 0, hasAccount: false });
        x.orders += 1;
        x.spent += Number(o.total) || 0;
        if (o.createdAt > x.lastOrder) { x.lastOrder = o.createdAt; x.name = o.name; }
        if (o.userId) x.hasAccount = true;
      }
      const list = Object.values(m);
      const repeat = list.filter((c) => c.orders >= 2);
      return {
        customers: list.length,
        repeatCustomers: repeat.length,
        repeatRatePercent: pct(repeat.length, list.length),
        withAccount: list.filter((c) => c.hasAccount).length,
        topCustomers: list.sort((a, b) => b.spent - a.spent).slice(0, limit || 10).map((c) => ({ ...c, lastOrder: when(c.lastOrder) })),
        note: n,
      };
    }
  );

  def(
    server,
    'inventory_report',
    'স্টক রিপোর্ট: স্টক শেষ, কম স্টক, নির্দিষ্ট দিনে একটাও বিক্রি হয়নি এমন বই (slow movers) ও মোট স্টকের মূল্য।',
    { lowStockThreshold: z.number().int().min(0).max(100).optional(), slowDays: z.number().int().min(1).max(365).optional() },
    async ({ lowStockThreshold, slowDays }) => {
      const low = lowStockThreshold ?? 5;
      const days = slowDays || 30;
      const r = range(undefined, undefined, days);
      const [orders, products] = await Promise.all([loadOrders(), loadProducts()]);
      const sold = {};
      for (const o of inRange(orders, r).filter(active)) for (const it of o.items || []) sold[it.id] = (sold[it.id] || 0) + (Number(it.qty) || 0);
      const row = (p) => ({ id: p.id, name: p.name, stock: Number(p.stock) || 0, price: p.price, stockValue: (Number(p.stock) || 0) * (Number(p.price) || 0) });
      const inStock = products.filter((p) => Number(p.stock) > 0);
      return {
        totalBooks: products.length,
        totalStockUnits: sum(products, (p) => p.stock),
        totalStockValue: sum(products, (p) => (Number(p.stock) || 0) * (Number(p.price) || 0)),
        outOfStock: products.filter((p) => !(Number(p.stock) > 0)).map(row),
        lowStock: inStock.filter((p) => Number(p.stock) <= low).map((p) => ({ ...row(p), soldInWindow: sold[p.id] || 0 })),
        slowMovers: { windowDays: days, books: inStock.filter((p) => !sold[p.id]).map(row).sort((a, b) => b.stockValue - a.stockValue).slice(0, 30) },
        note: truncNote(orders),
      };
    }
  );
}
