'use client';
import { useState } from 'react';
import { Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from './CartProvider';
import { money, bn } from '@/lib/config';

export default function AddToCart({ product }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const max = Math.max(1, Math.min(99, product.stock || 1));

  return (
    <div className="buy">
      <p className="price big">
        {money(product.price)}
        {product.onSale && <s>{money(product.regular)}</s>}
      </p>
      {product.inStock && product.stock <= 5 && <p className="muted">মাত্র {bn(product.stock)}টি স্টকে আছে</p>}
      <div className="buy-row">
        <div className="qty lg">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="কমান"><Minus size={16} /></button>
          <span>{bn(qty)}</span>
          <button onClick={() => setQty((q) => Math.min(max, q + 1))} aria-label="বাড়ান"><Plus size={16} /></button>
        </div>
        <button
          className="btn grow-btn"
          disabled={!product.inStock}
          onClick={() => add({ id: product.id, name: product.name, label: '', price: product.price, image: product.image }, qty)}
        >
          <ShoppingBag size={18} /> {product.inStock ? 'কার্টে যোগ করুন' : 'স্টক নেই'}
        </button>
      </div>
    </div>
  );
}
