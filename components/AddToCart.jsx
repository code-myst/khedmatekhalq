'use client';
import { useState } from 'react';
import { Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from './CartProvider';
import { money, bn } from '@/lib/config';

export default function AddToCart({ product, options }) {
  const { add } = useCart();
  const [sel, setSel] = useState((options.find((o) => o.inStock) || options[0]).id);
  const [qty, setQty] = useState(1);
  const cur = options.find((o) => o.id === sel);

  return (
    <div className="buy">
      {options.length > 1 && (
        <label className="field">
          কোনটি নিতে চান
          <select value={sel} onChange={(e) => setSel(Number(e.target.value))}>
            {options.map((o) => (
              <option key={o.id} value={o.id} disabled={!o.inStock}>
                {o.label} - {money(o.price)}{o.inStock ? '' : ' (স্টক নেই)'}
              </option>
            ))}
          </select>
        </label>
      )}
      <p className="price big">{money(cur.price)}</p>
      <div className="buy-row">
        <div className="qty lg">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="কমান"><Minus size={16} /></button>
          <span>{bn(qty)}</span>
          <button onClick={() => setQty((q) => Math.min(99, q + 1))} aria-label="বাড়ান"><Plus size={16} /></button>
        </div>
        <button
          className="btn grow-btn"
          disabled={!cur.inStock}
          onClick={() =>
            add({ id: cur.id, name: product.name, label: cur.label, price: cur.price, image: product.image }, qty)
          }
        >
          <ShoppingBag size={18} /> {cur.inStock ? 'কার্টে যোগ করুন' : 'স্টক নেই'}
        </button>
      </div>
    </div>
  );
}
