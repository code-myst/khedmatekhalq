'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const Ctx = createContext(null);
export const useCart = () => useContext(Ctx);

// পুরোনো WooCommerce সংস্করণের কার্ট (দাম ÷১০০ ধরনের) যাতে মিশে না যায়, তাই নতুন কী
const KEY = 'kb-cart';

export default function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  }, [items, ready]);

  const add = (item, n = 1) => {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'add_to_cart',
        ecommerce: { currency: 'BDT', value: Number(item.price) * n, items: [{ item_id: item.id, item_name: item.name, price: Number(item.price), quantity: n }] },
      });
    } catch {}
    setItems((cur) => {
      const hit = cur.find((i) => i.id === item.id);
      return hit
        ? cur.map((i) => (i.id === item.id ? { ...i, qty: Math.min(99, i.qty + n) } : i))
        : [...cur, { ...item, qty: n }];
    });
    setOpen(true);
  };
  const setQty = (id, qty) =>
    setItems((cur) => cur.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(99, qty)) } : i)));
  const remove = (id) => setItems((cur) => cur.filter((i) => i.id !== id));
  const clear = () => setItems([]);

  const count = items.reduce((n, i) => n + i.qty, 0);
  const total = items.reduce((n, i) => n + i.qty * Number(i.price), 0);

  return (
    <Ctx.Provider value={{ items, ready, add, setQty, remove, clear, count, total, open, setOpen }}>
      {children}
    </Ctx.Provider>
  );
}
