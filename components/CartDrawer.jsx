'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from './CartProvider';
import { money, bn, WP_URL } from '@/lib/config';

export default function CartDrawer() {
  const { items, setQty, remove, total, open, setOpen } = useCart();
  const panel = useRef(null);
  const back = useRef(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    const p = panel.current, b = back.current;
    if (open) {
      wasOpen.current = true;
      document.body.style.overflow = 'hidden';
      gsap.set(p, { display: 'flex' });
      gsap.set(b, { display: 'block' });
      gsap.fromTo(b, { opacity: 0 }, { opacity: 1, duration: 0.25 });
      gsap.fromTo(p, { xPercent: 100 }, { xPercent: 0, duration: 0.45, ease: 'power3.out' });
      gsap.from(p.querySelectorAll('.d-row'), { x: 30, opacity: 0, stagger: 0.06, delay: 0.15, duration: 0.4 });
    } else if (wasOpen.current) {
      document.body.style.overflow = '';
      gsap.to(p, { xPercent: 100, duration: 0.3, ease: 'power2.in' });
      gsap.to(b, { opacity: 0, duration: 0.25, onComplete: () => gsap.set([p, b], { display: 'none' }) });
    }
  }, [open]);

  useEffect(() => {
    const k = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [setOpen]);

  const checkout = `${WP_URL}/?kk_cart=${items.map((i) => `${i.id}:${i.qty}`).join(',')}`;

  return (
    <>
      <div ref={back} className="backdrop" onClick={() => setOpen(false)} />
      <aside ref={panel} className="drawer" role="dialog" aria-label="কার্ট">
        <div className="d-head">
          <h2>আপনার কার্ট</h2>
          <button className="icon-btn dark" onClick={() => setOpen(false)} aria-label="বন্ধ করুন"><X size={20} /></button>
        </div>
        <div className="d-body">
          {items.length === 0 ? (
            <div className="empty">
              <ShoppingBag size={40} />
              <p>কার্টে এখনো কোনো বই নেই।</p>
              <Link href="/#shop" className="btn" onClick={() => setOpen(false)}>বই দেখুন</Link>
            </div>
          ) : (
            items.map((i) => (
              <div key={i.id} className="d-row">
                {i.image && <img src={i.image} alt="" />}
                <div className="grow">
                  <strong>{i.name}</strong>
                  {i.label && <div className="muted">{i.label}</div>}
                  <div className="price">{money(i.price)}</div>
                  <div className="qty">
                    <button onClick={() => setQty(i.id, i.qty - 1)} aria-label="কমান"><Minus size={14} /></button>
                    <span>{bn(i.qty)}</span>
                    <button onClick={() => setQty(i.id, i.qty + 1)} aria-label="বাড়ান"><Plus size={14} /></button>
                  </div>
                </div>
                <button className="icon-btn dark" onClick={() => remove(i.id)} aria-label="মুছুন"><Trash2 size={18} /></button>
              </div>
            ))
          )}
        </div>
        {items.length > 0 && (
          <div className="d-foot">
            <div className="d-total"><span>মোট</span><strong>{money(total)}</strong></div>
            <p className="muted">ডেলিভারি চার্জ চেকআউটে যোগ হবে। পেমেন্ট: ক্যাশ অন ডেলিভারি।</p>
            <a href={checkout} className="btn wide">চেকআউটে যান <ArrowRight size={18} /></a>
          </div>
        )}
      </aside>
    </>
  );
}
