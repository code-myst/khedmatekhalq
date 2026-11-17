'use client';
import Link from 'next/link';
import { Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '@/components/CartProvider';
import { money, bn } from '@/lib/config';

export default function Cart() {
  const { items, ready, setQty, remove, total } = useCart();

  if (!ready) return <div className="wrap"><p className="muted">লোড হচ্ছে...</p></div>;

  if (items.length === 0)
    return (
      <div className="wrap">
        <h1>আপনার কার্ট খালি</h1>
        <p className="muted">পছন্দের বই কার্টে যোগ করলে এখানে দেখা যাবে।</p>
        <Link href="/#shop" className="btn">বই দেখুন</Link>
      </div>
    );

  return (
    <div className="wrap narrow">
      <h1>কার্ট</h1>
      {items.map((i) => (
        <div key={i.id} className="row">
          {i.image && <img src={i.image} alt="" />}
          <div className="grow">
            <strong>{i.name}</strong>
            {i.label && <div className="muted">{i.label}</div>}
            <div className="price">{money(i.price)}</div>
          </div>
          <div className="qty">
            <button onClick={() => setQty(i.id, i.qty - 1)} aria-label="কমান"><Minus size={14} /></button>
            <span>{bn(i.qty)}</span>
            <button onClick={() => setQty(i.id, i.qty + 1)} aria-label="বাড়ান"><Plus size={14} /></button>
          </div>
          <button className="icon-btn dark" onClick={() => remove(i.id)} aria-label="মুছুন"><Trash2 size={18} /></button>
        </div>
      ))}
      <p className="total">মোট: {money(total)}</p>
      <p className="muted">ডেলিভারি চার্জ চেকআউটে যোগ হবে।</p>
      <p className="muted"><Link href="/delivery-return">ডেলিভারি ও রিটার্ন নীতিমালা</Link></p>
      <Link href="/checkout" className="btn">চেকআউটে যান <ArrowRight size={18} /></Link>
    </div>
  );
}
