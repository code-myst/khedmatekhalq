'use client';
import Link from 'next/link';
import { ShoppingBag, Star } from 'lucide-react';
import { useCart } from './CartProvider';
import { money, bn } from '@/lib/config';

export default function ProductCard({ p }) {
  const { add } = useCart();
  const href = `/product/${p.id}`;
  const off = p.onSale && !p.varied && Number(p.regular) > 0
    ? Math.round(((Number(p.regular) - Number(p.price)) / Number(p.regular)) * 100)
    : 0;
  return (
    <article className="card">
      <Link href={href} className="thumb" aria-label={p.name}>
        {p.image ? <img src={p.image} alt="" loading="lazy" /> : <span className="ph" />}
        {off > 0 && <span className="tag">-{bn(off)}%</span>}
        {p.onSale && p.varied && <span className="tag">অফার</span>}
      </Link>
      <div className="meta">
        <h3><Link href={href}>{p.name}</Link></h3>
        {p.author && <p className="author">{p.author}</p>}
        {p.rating > 0 && (
          <p className="stars" aria-label={`রেটিং ${p.rating}`}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} size={14} fill={n <= Math.round(p.rating) ? 'currentColor' : 'none'} />
            ))}
            {p.reviews > 0 && <span>({bn(p.reviews)})</span>}
          </p>
        )}
        <p className="price">
          {p.varied ? `${money(p.min)} থেকে` : money(p.price)}
          {p.onSale && !p.varied && <s>{money(p.regular)}</s>}
        </p>
      </div>
      {p.type === 'simple' ? (
        <button
          className="btn sm"
          disabled={!p.inStock}
          onClick={() => add({ id: p.id, name: p.name, label: '', price: p.price, image: p.image })}
        >
          <ShoppingBag size={16} /> {p.inStock ? 'কার্টে যোগ করুন' : 'স্টক নেই'}
        </button>
      ) : (
        <Link className="btn sm ghost" href={href}>বিকল্প দেখুন</Link>
      )}
    </article>
  );
}
