'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { Search } from 'lucide-react';
import ProductCard from './ProductCard';
import { bn } from '@/lib/config';

export default function Shop({ products, categories }) {
  const [cat, setCat] = useState('all');
  const [sort, setSort] = useState('new');
  const [q, setQ] = useState('');
  const grid = useRef(null);
  const first = useRef(true);

  const list = useMemo(() => {
    let l = products.filter(
      (p) =>
        (cat === 'all' || (cat === 'sale' ? p.onSale : p.cats.includes(cat))) &&
        p.name.toLowerCase().includes(q.trim().toLowerCase())
    );
    const by = {
      new: (a, b) => b.id - a.id,
      low: (a, b) => Number(a.min) - Number(b.min),
      high: (a, b) => Number(b.min) - Number(a.min),
      name: (a, b) => a.name.localeCompare(b.name, 'bn'),
    }[sort];
    return [...l].sort(by);
  }, [products, cat, sort, q]);

  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get('cat');
    if (c) setCat(c === 'sale' ? 'sale' : Number(c));
  }, []);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (!grid.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(
      grid.current.children,
      { y: 22, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.04, ease: 'power2.out', clearProps: 'transform,opacity' }
    );
  }, [list]);

  return (
    <section id="shop" className="wrap">
      <div className="sec-head rv">
        <div>
          <p className="eyebrow">পুরো সংগ্রহ</p>
          <h2>সব বই</h2>
        </div>
        <span className="muted">{bn(list.length)}টি বই</span>
      </div>
      <div className="toolbar rv">
        <label className="searchbox">
          <Search size={18} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="বইয়ের নাম লিখে খুঁজুন" aria-label="বই খুঁজুন" />
        </label>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="সাজান">
          <option value="new">নতুন আগে</option>
          <option value="low">দাম: কম থেকে বেশি</option>
          <option value="high">দাম: বেশি থেকে কম</option>
          <option value="name">নাম অনুযায়ী</option>
        </select>
      </div>
      {categories.length > 0 && (
        <div className="chips rv">
          <button className={cat === 'all' ? 'on' : ''} onClick={() => setCat('all')}>সব</button>
          <button className={cat === 'sale' ? 'on' : ''} onClick={() => setCat('sale')}>অফার</button>
          {categories.map((c) => (
            <button key={c.id} className={cat === c.id ? 'on' : ''} onClick={() => setCat(c.id)}>
              {c.name}
            </button>
          ))}
        </div>
      )}
      {list.length === 0 ? (
        <p className="muted pad">কোনো বই পাওয়া যায়নি। অন্য নাম বা ক্যাটাগরি দিয়ে দেখুন।</p>
      ) : (
        <div className="grid" ref={grid}>
          {list.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </section>
  );
}
