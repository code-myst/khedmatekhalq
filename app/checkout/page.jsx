'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { addDoc, collection, doc, getDoc } from 'firebase/firestore';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { COL } from '@/lib/firebaseConfig';
import { useCart } from '@/components/CartProvider';
import { useAuth } from '@/components/AuthProvider';
import { money, bn, SHIPPING, PAYMENT, CONTACT } from '@/lib/config';

// কার্টের প্রতিটি বইয়ের সর্বশেষ দাম ও স্টক Firestore থেকে আনে
async function loadFresh(items) {
  const snaps = await Promise.all(items.map((i) => getDoc(doc(db, COL.products, i.id)).catch(() => null)));
  return items.map((i, n) => {
    const s = snaps[n];
    if (!s || !s.exists()) return { ...i, missing: true, stock: 0 };
    const d = s.data();
    return { ...i, name: d.name || i.name, price: Number(d.price) || 0, stock: Number(d.stock) || 0 };
  });
}

export default function Checkout() {
  const { items, ready, total: cartTotal, clear } = useCart();
  const { user } = useAuth();
  const [lines, setLines] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', area: 'dhaka', note: '', pay: 'cod', trx: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, name: f.name || user.displayName || '', email: f.email || user.email || '' }));
  }, [user]);

  const key = items.map((i) => `${i.id}:${i.qty}`).join(',');
  useEffect(() => {
    if (!ready || !items.length) return;
    let live = true;
    loadFresh(items).then((l) => live && setLines(l)).catch(() => {});
    return () => { live = false; };
  }, [ready, key]);

  const methods = [{ id: 'cod', label: 'ক্যাশ অন ডেলিভারি', help: 'বই হাতে পেয়ে টাকা দিন' }];
  if (PAYMENT.bkash) methods.push({ id: 'bkash', label: 'বিকাশ', help: `${PAYMENT.bkash} নম্বরে Send Money করে TrxID দিন` });
  if (PAYMENT.nagad) methods.push({ id: 'nagad', label: 'নগদ', help: `${PAYMENT.nagad} নম্বরে Send Money করে TrxID দিন` });

  const view = lines || items;
  const subtotal = lines ? lines.reduce((n, l) => n + l.price * l.qty, 0) : cartTotal;
  const shipping = SHIPPING[form.area] ?? SHIPPING.dhaka;
  const total = subtotal + shipping;

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    const phone = form.phone.replace(/[\s-]/g, '').replace(/^\+?88/, '');
    if (!/^01[3-9]\d{8}$/.test(phone)) return setErr('সঠিক মোবাইল নম্বর দিন (যেমন: 01XXXXXXXXX)।');
    if (form.pay !== 'cod' && !form.trx.trim()) return setErr('ট্রানজেকশন আইডি (TrxID) দিন।');
    setBusy(true);
    try {
      const fresh = await loadFresh(items);
      const bad = fresh.find((l) => l.missing || l.price <= 0 || l.stock < l.qty);
      if (bad) {
        setLines(fresh);
        setErr(
          bad.missing || bad.price <= 0
            ? `"${bad.name}" এখন পাওয়া যাচ্ছে না, কার্ট থেকে সরিয়ে দিন।`
            : `"${bad.name}" স্টকে আছে মাত্র ${bn(bad.stock)}টি, কার্টে সংখ্যা কমিয়ে নিন।`
        );
        setBusy(false);
        return;
      }
      const sub = fresh.reduce((n, l) => n + l.price * l.qty, 0);
      const ship = SHIPPING[form.area] ?? SHIPPING.dhaka;
      const order = {
        orderNo: `KB-${Date.now().toString(36).slice(-5)}${Math.floor(10 + Math.random() * 90)}`.toUpperCase(),
        userId: user?.uid || null,
        name: form.name.trim(),
        phone,
        email: form.email.trim(),
        address: form.address.trim(),
        area: form.area,
        note: form.note.trim(),
        items: fresh.map((l) => ({ id: l.id, name: l.name, price: l.price, qty: l.qty, image: l.image || '' })),
        subtotal: sub,
        shipping: ship,
        total: sub + ship,
        payment: form.pay,
        trxId: form.pay === 'cod' ? '' : form.trx.trim(),
        status: 'pending',
        stockDeducted: false,
        createdAt: Date.now(),
      };
      await addDoc(collection(db, COL.orders), order);
      try {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'purchase',
          ecommerce: {
            transaction_id: order.orderNo,
            currency: 'BDT',
            value: order.total,
            shipping: order.shipping,
            items: order.items.map((i) => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.qty })),
          },
        });
      } catch {}
      clear();
      setDone(order);
    } catch (x) {
      setErr(`অর্ডার দেওয়া যায়নি, আবার চেষ্টা করুন। (${x.code || x.message})`);
    }
    setBusy(false);
  };

  if (done)
    return (
      <div className="wrap narrow">
        <div className="success">
          <CheckCircle2 size={64} />
          <h1>অর্ডার সম্পন্ন হয়েছে</h1>
          <p>আপনার অর্ডার নম্বর <strong>{done.orderNo}</strong>। মোট {money(done.total)}।</p>
          <p className="muted">শীঘ্রই আমরা {done.phone} নম্বরে যোগাযোগ করব। নম্বরটি সংরক্ষণ করে রাখুন।</p>
          <Link href="/#shop" className="btn">আরও বই দেখুন</Link>
          <a className="btn ghost" href={`${CONTACT.whatsapp}?text=${encodeURIComponent(`আসসালামু আলাইকুম। আমার অর্ডার নম্বর ${done.orderNo}।`)}`} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={16} /> হোয়াটসঅ্যাপে জানান
          </a>
          {done.userId && <p><Link href="/account" className="link-btn">আমার অর্ডারগুলো দেখুন</Link></p>}
        </div>
      </div>
    );

  if (!ready) return <div className="wrap"><p className="muted">লোড হচ্ছে...</p></div>;

  if (!items.length)
    return (
      <div className="wrap">
        <h1>আপনার কার্ট খালি</h1>
        <p className="muted">অর্ডার করতে আগে কার্টে বই যোগ করুন।</p>
        <Link href="/#shop" className="btn">বই দেখুন</Link>
      </div>
    );

  return (
    <div className="wrap">
      <h1>চেকআউট</h1>
      <div className="co-grid">
        <form className="contact-form" onSubmit={submit}>
          {!user && (
            <p className="muted small" style={{ margin: 0 }}>
              অ্যাকাউন্ট থাকলে <Link href="/login?next=/checkout" className="link-btn">লগইন করুন</Link>, অর্ডারের ইতিহাস দেখতে পারবেন। চাইলে লগইন ছাড়াও অর্ডার করা যাবে।
            </p>
          )}
          <div className="two">
            <label>আপনার নাম<input required value={form.name} onChange={set('name')} autoComplete="name" /></label>
            <label>মোবাইল নম্বর<input required type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" placeholder="01XXXXXXXXX" /></label>
          </div>
          <label>ইমেইল (ঐচ্ছিক)<input type="email" value={form.email} onChange={set('email')} autoComplete="email" /></label>
          <label>পূর্ণ ঠিকানা<textarea required rows={3} value={form.address} onChange={set('address')} autoComplete="street-address" /></label>
          <label>
            ডেলিভারি এলাকা
            <select value={form.area} onChange={set('area')}>
              <option value="dhaka">ঢাকার ভেতরে ({money(SHIPPING.dhaka)})</option>
              <option value="outside">ঢাকার বাইরে ({money(SHIPPING.outside)})</option>
            </select>
          </label>
          <label>অর্ডার নোট (ঐচ্ছিক)<textarea rows={2} value={form.note} onChange={set('note')} /></label>

          <div className="fld">
            <span>পেমেন্ট পদ্ধতি</span>
            {methods.map((m) => (
              <label key={m.id} className={`radio-row ${form.pay === m.id ? 'on' : ''}`}>
                <input type="radio" name="pay" checked={form.pay === m.id} onChange={() => setForm((s) => ({ ...s, pay: m.id }))} />
                <span>{m.label}<small>{m.help}</small></span>
              </label>
            ))}
          </div>
          {form.pay !== 'cod' && (
            <label>ট্রানজেকশন আইডি (TrxID)<input required value={form.trx} onChange={set('trx')} /></label>
          )}

          {err && <p className="form-err">{err}</p>}
          <button className="btn" type="submit" disabled={busy}>{busy ? 'অর্ডার হচ্ছে...' : `অর্ডার নিশ্চিত করুন · ${money(total)}`}</button>
        </form>

        <aside className="sum">
          <h2>অর্ডারের সারাংশ</h2>
          {view.map((l) => (
            <div className="sum-item" key={l.id}>
              {l.image && <img src={l.image} alt="" />}
              <div className="grow">
                <strong>{l.name}</strong>
                <div className="muted small">{bn(l.qty)} × {money(l.price)}</div>
                {l.missing && <div className="small" style={{ color: '#9b2c2c' }}>এই বই আর পাওয়া যাচ্ছে না</div>}
                {!l.missing && l.stock !== undefined && l.stock < l.qty && <div className="small" style={{ color: '#9b2c2c' }}>স্টকে আছে {bn(l.stock)}টি</div>}
              </div>
              <strong>{money(l.price * l.qty)}</strong>
            </div>
          ))}
          <div className="sum-line"><span>সাবটোটাল</span><span>{money(subtotal)}</span></div>
          <div className="sum-line"><span>ডেলিভারি চার্জ</span><span>{money(shipping)}</span></div>
          <div className="sum-line t"><span>সর্বমোট</span><span>{money(total)}</span></div>
          <p className="muted small"><Link href="/cart" className="link-btn">কার্ট এডিট করুন</Link></p>
        </aside>
      </div>
    </div>
  );
}
