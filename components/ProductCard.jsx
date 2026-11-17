'use client';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCart } from './CartProvider';
import { money, bn } from '@/lib/config';

export default function ProductCard({ p }) {
  const { add } = useCart();
  const href = `/product/${p.id}`;
  const off = p.onSale && p.regular > 0 ? Math.round(((p.regular - p.price) / p.regular) * 100) : 0;
  return (
    <article className="card">
      <Link href={href} className="thumb" aria-label={p.name}>
        {p.image ? <img src={p.image} alt="" loading="lazy" /> : <span className="ph" />}
        {off > 0 && <span className="tag">-{bn(off)}%</span>}
      </Link>
      <div className="meta">
        <h3><Link href={href}>{p.name}</Link></h3>
        {p.author && <p className="author">{p.author}</p>}
        <p className="price">
          {money(p.price)}
          {p.onSale && <s>{money(p.regular)}</s>}
        </p>
      </div>
      <button
        className="btn sm"
        disabled={!p.inStock}
        onClick={() => add({ id: p.id, name: p.name, label: '', price: p.price, image: p.image })}
      >
        <ShoppingBag size={16} /> {p.inStock ? 'কার্টে যোগ করুন' : 'স্টক নেই'}
      </button>
    </article>
  );
}
