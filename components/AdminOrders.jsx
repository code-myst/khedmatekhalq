'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit, doc, updateDoc, increment } from 'firebase/firestore';
import { MessageCircle, Phone } from 'lucide-react';
import { db } from '@/lib/firebase';
import { COL } from '@/lib/firebaseConfig';
import { money, bn, ORDER_STATUS } from '@/lib/config';

const PAY = { cod: 'ক্যাশ অন ডেলিভারি', bkash: 'বিকাশ', nagad: 'নগদ' };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState('');
  const [busyId, setBusyId] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const s = await getDocs(query(collection(db, COL.orders), orderBy('createdAt', 'desc'), limit(200)));
      setOrders(s.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      setMsg('লোড করা যায়নি: ' + (e.code || e.message));
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  // স্টক: অর্ডার "অপেক্ষমাণ"/"বাতিল" ছাড়া অন্য অবস্থায় গেলে একবার কমে; আবার বাতিল/অপেক্ষমাণ হলে ফিরে আসে
  const adjust = async (o, sign) => {
    for (const it of o.items || []) {
      try { await updateDoc(doc(db, COL.products, it.id), { stock: increment(sign * Number(it.qty)) }); } catch {}
    }
  };

  const setStatus = async (o, status) => {
    setBusyId(o.id);
    setMsg('');
    try {
      let deducted = !!o.stockDeducted;
      const shouldDeduct = status !== 'pending' && status !== 'cancelled';
      if (shouldDeduct && !deducted) { await adjust(o, -1); deducted = true; }
      else if (!shouldDeduct && deducted) { await adjust(o, 1); deducted = false; }
      await updateDoc(doc(db, COL.orders, o.id), { status, stockDeducted: deducted });
      setOrders((list) => list.map((x) => (x.id === o.id ? { ...x, status, stockDeducted: deducted } : x)));
    } catch (e) {
      setMsg('আপডেট হয়নি: ' + (e.code || e.message));
    }
    setBusyId('');
  };

  const shown = orders.filter((o) => filter === 'all' || o.status === filter);
  const count = (s) => orders.filter((o) => o.status === s).length;

  return (
    <div className="a-card">
      <div className="a-head">
        <h2>অর্ডার ({bn(orders.length)})</h2>
        <button className="btn ghost xs" onClick={load}>রিফ্রেশ</button>
      </div>
      <div className="chips">
        <button className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>সব</button>
        {Object.entries(ORDER_STATUS).map(([k, v]) => (
          <button key={k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>{v} ({bn(count(k))})</button>
        ))}
      </div>
      {msg && <p className="form-err">{msg}</p>}
      {loading && <p className="muted">লোড হচ্ছে...</p>}
      {!loading && shown.length === 0 && <p className="muted">কোনো অর্ডার নেই।</p>}
      {shown.map((o) => (
        <div className="order" key={o.id}>
          <div className="order-top">
            <strong>#{o.orderNo} · {o.name}</strong>
            <span className={`pill ${o.status}`}>{ORDER_STATUS[o.status] || o.status}</span>
          </div>
          <div className="muted small">
            {new Date(o.createdAt).toLocaleString('bn-BD')} · {money(o.total)} · {PAY[o.payment] || o.payment}
          </div>
          <div className="a-actions" style={{ marginTop: '.5rem' }}>
            <button className="btn ghost xs" onClick={() => setOpen(open === o.id ? '' : o.id)}>{open === o.id ? 'বন্ধ করুন' : 'বিস্তারিত'}</button>
            <select
              value={o.status}
              disabled={busyId === o.id}
              onChange={(e) => setStatus(o, e.target.value)}
              aria-label="স্ট্যাটাস"
              style={{ padding: '.35rem .6rem', borderRadius: 8, border: '1px solid var(--line)', font: 'inherit' }}
            >
              {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          {open === o.id && (
            <div className="o-detail">
              <p><Phone size={14} style={{ verticalAlign: '-2px' }} /> <a href={`tel:${o.phone}`}>{o.phone}</a> · <a href={`https://wa.me/88${o.phone}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={14} style={{ verticalAlign: '-2px' }} /> হোয়াটসঅ্যাপ</a></p>
              {o.email && <p>ইমেইল: {o.email}</p>}
              <p>ঠিকানা: {o.address} ({o.area === 'dhaka' ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে'})</p>
              {o.note && <p>নোট: {o.note}</p>}
              {o.trxId && <p>TrxID: <strong>{o.trxId}</strong></p>}
              <ul>
                {(o.items || []).map((it, n) => <li key={n}>{it.name} × {bn(it.qty)} — {money(it.price * it.qty)}</li>)}
              </ul>
              <div className="sum-line"><span>সাবটোটাল</span><span>{money(o.subtotal)}</span></div>
              <div className="sum-line"><span>ডেলিভারি</span><span>{money(o.shipping)}</span></div>
              <div className="sum-line t"><span>মোট</span><span>{money(o.total)}</span></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
