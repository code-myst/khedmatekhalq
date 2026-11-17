'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, Trash2 } from 'lucide-react';
import { collection, query, where, getDocs, setDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COL } from '@/lib/firebaseConfig';
import { useAuth } from './AuthProvider';
import { bn } from '@/lib/config';

function Stars({ value, size = 16 }) {
  return (
    <span className="stars" aria-label={`রেটিং ${value}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} fill={n <= Math.round(value) ? 'currentColor' : 'none'} />
      ))}
    </span>
  );
}

export default function ProductTabs({ productId, description }) {
  const { user, isAdmin } = useAuth();
  const [tab, setTab] = useState('desc');
  const [reviews, setReviews] = useState(null);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const load = async () => {
    try {
      const s = await getDocs(query(collection(db, COL.reviews), where('productId', '==', productId)));
      setReviews(s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    } catch {
      setReviews([]);
    }
  };
  useEffect(() => { load(); }, [productId]);

  const list = reviews || [];
  const avg = list.length ? list.reduce((n, r) => n + Number(r.rating || 0), 0) / list.length : 0;
  const mine = user ? list.find((r) => r.userId === user.uid) : null;

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!text.trim()) return setErr('রিভিউ লিখুন।');
    setBusy(true);
    try {
      await setDoc(doc(db, COL.reviews, `${productId}_${user.uid}`), {
        productId,
        userId: user.uid,
        name: user.displayName || 'গ্রাহক',
        rating,
        text: text.trim().slice(0, 1000),
        createdAt: Date.now(),
      });
      setText('');
      await load();
    } catch {
      setErr('রিভিউ সেভ হয়নি, আবার চেষ্টা করুন।');
    }
    setBusy(false);
  };

  const del = async (id) => {
    if (!confirm('রিভিউটি মুছে ফেলবেন?')) return;
    try { await deleteDoc(doc(db, COL.reviews, id)); await load(); } catch {}
  };

  return (
    <div className="tabs-wrap">
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'desc'} className={tab === 'desc' ? 'on' : ''} onClick={() => setTab('desc')}>
          বিবরণ
        </button>
        <button role="tab" aria-selected={tab === 'rev'} className={tab === 'rev' ? 'on' : ''} onClick={() => setTab('rev')}>
          রিভিউ ({bn(list.length)})
        </button>
      </div>

      {tab === 'desc' && (
        <div className="prose pre" role="tabpanel">{description || 'বিবরণ শীঘ্রই যোগ করা হবে।'}</div>
      )}

      {tab === 'rev' && (
        <div role="tabpanel" className="reviews">
          {list.length > 0 && (
            <div className="rev-sum">
              <strong>{bn(avg.toFixed(1))}</strong>
              <Stars value={avg} size={18} />
              <span className="muted">{bn(list.length)}টি রিভিউ</span>
            </div>
          )}

          {user ? (
            <form className="rev-form" onSubmit={submit}>
              <strong>{mine ? 'আপনার রিভিউ বদলান' : 'রিভিউ লিখুন'}</strong>
              <div className="star-pick" aria-label="রেটিং বাছুন">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} স্টার`}>
                    <Star size={22} fill={n <= rating ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
              <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="বইটি সম্পর্কে আপনার মতামত" />
              {err && <p className="form-err">{err}</p>}
              <button className="btn xs" disabled={busy} type="submit">{busy ? 'সেভ হচ্ছে...' : 'রিভিউ দিন'}</button>
            </form>
          ) : (
            <p className="muted"><Link href={`/login?next=/product/${productId}`} className="link-btn">লগইন করে</Link> রিভিউ দিন।</p>
          )}

          {reviews && list.length === 0 ? (
            <p className="muted">এখনো কোনো রিভিউ নেই।</p>
          ) : (
            list.map((r) => (
              <article key={r.id} className="rev">
                <div className="rev-top">
                  <strong>{r.name}</strong>
                  <Stars value={r.rating} size={14} />
                  <span className="muted">{new Date(r.createdAt).toLocaleDateString('bn-BD')}</span>
                  {(isAdmin || (user && r.userId === user.uid)) && (
                    <button className="icon-btn dark" onClick={() => del(r.id)} aria-label="মুছুন"><Trash2 size={16} /></button>
                  )}
                </div>
                <p className="prose pre">{r.text}</p>
              </article>
            ))
          )}
        </div>
      )}
    </div>
  );
}
