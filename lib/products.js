// সার্ভার-সাইড ডেটা পড়া: Firestore REST API (ক্যাশসহ)। ক্লায়েন্ট SDK এখানে লাগে না।
import { firebaseConfig, COL } from './firebaseConfig';
import { optimize } from './cloudinary';

const BASE = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;
const KEY = firebaseConfig.apiKey;
const REVALIDATE = 30; // সেকেন্ড — অ্যাডমিনে বদলালে সর্বোচ্চ এত সময়ে সাইটে দেখা যাবে

function dec(v) {
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return Date.parse(v.timestampValue);
  if ('nullValue' in v) return null;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(dec);
  if ('mapValue' in v) return Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, dec(x)]));
  return null;
}

function toDoc(d) {
  const out = { id: d.name.split('/').pop() };
  for (const [k, v] of Object.entries(d.fields || {})) out[k] = dec(v);
  return out;
}

async function list(col) {
  let out = [];
  let token = '';
  do {
    const url = `${BASE}/${col}?pageSize=300&key=${KEY}${token ? `&pageToken=${encodeURIComponent(token)}` : ''}`;
    const res = await fetch(url, { next: { revalidate: REVALIDATE } });
    if (!res.ok) throw new Error(`Firestore ${col}: ${res.status}`);
    const data = await res.json();
    out = out.concat((data.documents || []).map(toDoc));
    token = data.nextPageToken || '';
  } while (token);
  return out;
}

// কার্ড/তালিকার জন্য হালকা রূপ
export function shape(p) {
  const price = Number(p.price) || 0;
  const regular = Number(p.regularPrice) || 0;
  return {
    id: p.id,
    name: p.name || '',
    author: p.author || '',
    image: optimize(p.images?.[0] || '', 500),
    price,
    regular,
    onSale: regular > price && price > 0,
    inStock: Number(p.stock) > 0,
    stock: Number(p.stock) || 0,
    cats: p.categoryIds || [],
    featured: !!p.featured,
    ts: Number(p.createdAt) || 0,
  };
}

export async function getProducts() {
  try {
    const all = await list(COL.products);
    return all.map(shape).sort((a, b) => b.ts - a.ts);
  } catch (e) {
    console.error('getProducts', e);
    return [];
  }
}

export async function getCategories(products = []) {
  try {
    const all = await list(COL.categories);
    return all
      .map((c) => ({
        id: c.id,
        name: c.name || '',
        image: optimize(c.image || '', 300),
        order: Number(c.order) || 0,
        count: products.filter((p) => p.cats.includes(c.id)).length,
      }))
      .filter((c) => c.count > 0)
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'bn'));
  } catch (e) {
    console.error('getCategories', e);
    return [];
  }
}

// একটি বইয়ের পূর্ণ তথ্য (না পেলে null)
export async function getProduct(id) {
  try {
    const res = await fetch(`${BASE}/${COL.products}/${encodeURIComponent(id)}?key=${KEY}`, { next: { revalidate: REVALIDATE } });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Firestore product: ${res.status}`);
    return toDoc(await res.json());
  } catch (e) {
    console.error('getProduct', e);
    return null;
  }
}
