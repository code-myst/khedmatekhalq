'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { LogOut, ShieldCheck } from 'lucide-react';
import { db } from '@/lib/firebase';
import { COL } from '@/lib/firebaseConfig';
import { useAuth } from '@/components/AuthProvider';
import { money, bn, ORDER_STATUS } from '@/lib/config';

export default function Account() {
  const { user, isAdmin, loading, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!loading && !user) router.replace('/login?next=/account');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    getDocs(query(collection(db, COL.orders), where('userId', '==', user.uid)))
      .then((s) => setOrders(s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))))
      .catch(() => { setErr('অর্ডার লোড করা যায়নি।'); setOrders([]); });
  }, [user]);

  if (loading || !user) return <div className="wrap"><p className="muted">লোড হচ্ছে...</p></div>;

  return (
    <div className="wrap narrow">
      <div className="acct-head">
        <div>
          <h1 style={{ marginBottom: 0 }}>{user.displayName || 'আমার অ্যাকাউন্ট'}</h1>
          <span className="muted">{user.email}</span>
        </div>
        <div className="acct-actions">
          {isAdmin && <Link href="/admin" className="btn xs"><ShieldCheck size={15} /> অ্যাডমিন প্যানেল</Link>}
          <button className="btn ghost xs" onClick={async () => { await logout(); router.replace('/'); }}><LogOut size={15} /> লগআউট</button>
        </div>
      </div>

      <h2>আমার অর্ডার</h2>
      {err && <p className="form-err">{err}</p>}
      {orders === null && <p className="muted">লোড হচ্ছে...</p>}
      {orders && orders.length === 0 && !err && (
        <p className="muted">এখনো কোনো অর্ডার নেই। <Link href="/#shop" className="link-btn">বই দেখুন</Link></p>
      )}
      {(orders || []).map((o) => (
        <div className="order" key={o.id}>
          <div className="order-top">
            <strong>#{o.orderNo}</strong>
            <span className={`pill ${o.status}`}>{ORDER_STATUS[o.status] || o.status}</span>
          </div>
          <span className="muted small">{new Date(o.createdAt).toLocaleString('bn-BD')}</span>
          <ul>
            {(o.items || []).map((it, n) => (
              <li key={n}>{it.name} × {bn(it.qty)} — {money(it.price * it.qty)}</li>
            ))}
          </ul>
          <div className="sum-line"><span>ডেলিভারি চার্জ</span><span>{money(o.shipping)}</span></div>
          <div className="sum-line t"><span>মোট</span><span>{money(o.total)}</span></div>
        </div>
      ))}
    </div>
  );
}
