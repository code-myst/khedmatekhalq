'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import AdminOrders from '@/components/AdminOrders';
import AdminProducts from '@/components/AdminProducts';
import AdminCategories from '@/components/AdminCategories';

export default function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const [tab, setTab] = useState('orders');

  if (loading) return <div className="wrap"><p className="muted">লোড হচ্ছে...</p></div>;

  if (!user)
    return (
      <div className="wrap narrow">
        <h1>অ্যাডমিন প্যানেল</h1>
        <p className="muted">চালিয়ে যেতে লগইন করুন।</p>
        <Link className="btn" href="/login?next=/admin">লগইন</Link>
      </div>
    );

  if (!isAdmin)
    return (
      <div className="wrap narrow">
        <h1>অনুমতি নেই</h1>
        <p>এই অ্যাকাউন্টে অ্যাডমিন অনুমতি দেওয়া নেই।</p>
        <p className="muted small">
          আপনি সাইটের মালিক হলে: Firebase Console → Firestore-এ <code>kb_admins</code> কালেকশনে এই UID নামে একটি ডকুমেন্ট বানান (যেকোনো একটি ফিল্ড দিন), তারপর পেজ রিফ্রেশ করুন।
        </p>
        <p><code style={{ background: '#fff', padding: '.3rem .6rem', borderRadius: 6, border: '1px solid var(--line)', wordBreak: 'break-all' }}>{user.uid}</code></p>
      </div>
    );

  return (
    <div className="wrap" style={{ maxWidth: 1000 }}>
      <h1>অ্যাডমিন প্যানেল</h1>
      <div className="tabs admin-tabs" role="tablist">
        <button role="tab" className={tab === 'orders' ? 'on' : ''} onClick={() => setTab('orders')}>অর্ডার</button>
        <button role="tab" className={tab === 'products' ? 'on' : ''} onClick={() => setTab('products')}>বই</button>
        <button role="tab" className={tab === 'categories' ? 'on' : ''} onClick={() => setTab('categories')}>ক্যাটাগরি</button>
      </div>
      {tab === 'orders' && <AdminOrders />}
      {tab === 'products' && <AdminProducts />}
      {tab === 'categories' && <AdminCategories />}
    </div>
  );
}
