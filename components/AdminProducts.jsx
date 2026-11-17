'use client';
import { useEffect, useMemo, useState } from 'react';
import { collection, getDocs, addDoc, setDoc, deleteDoc, doc } from 'firebase/firestore';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { db } from '@/lib/firebase';
import { COL } from '@/lib/firebaseConfig';
import { optimize } from '@/lib/cloudinary';
import { money, bn } from '@/lib/config';
import AdminImageUploader from './AdminImageUploader';

const EMPTY = { name: '', author: '', price: '', regularPrice: '', stock: '', shortDesc: '', description: '', images: [], categoryIds: [], featured: false };

export default function AdminProducts() {
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState(null); // null = তালিকা, নইলে ফর্ম
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([getDocs(collection(db, COL.products)), getDocs(collection(db, COL.categories))]);
      setItems(p.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
      setCats(c.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (e) {
      setMsg('লোড করা যায়নি: ' + (e.code || e.message));
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const shown = useMemo(
    () => items.filter((p) => (p.name || '').toLowerCase().includes(q.trim().toLowerCase())),
    [items, q]
  );

  const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));
  const toggleCat = (id) =>
    setForm((s) => ({ ...s, categoryIds: s.categoryIds.includes(id) ? s.categoryIds.filter((c) => c !== id) : [...s.categoryIds, id] }));

  const edit = (p) =>
    setForm({
      ...EMPTY,
      ...p,
      price: String(p.price ?? ''),
      regularPrice: p.regularPrice ? String(p.regularPrice) : '',
      stock: String(p.stock ?? ''),
      images: p.images || [],
      categoryIds: p.categoryIds || [],
    });

  const save = async (e) => {
    e.preventDefault();
    setMsg('');
    const price = Number(form.price);
    if (!form.name.trim()) return setMsg('বইয়ের নাম দিন।');
    if (!(price > 0)) return setMsg('সঠিক দাম দিন।');
    const data = {
      name: form.name.trim(),
      author: form.author.trim(),
      price,
      regularPrice: Number(form.regularPrice) || 0,
      stock: Math.max(0, Math.floor(Number(form.stock) || 0)),
      shortDesc: form.shortDesc.trim(),
      description: form.description.trim(),
      images: form.images,
      categoryIds: form.categoryIds,
      featured: !!form.featured,
    };
    setBusy(true);
    try {
      if (form.id) await setDoc(doc(db, COL.products, form.id), data, { merge: true });
      else await addDoc(collection(db, COL.products), { ...data, createdAt: Date.now() });
      setForm(null);
      await load();
    } catch (x) {
      setMsg('সেভ হয়নি: ' + (x.code || x.message));
    }
    setBusy(false);
  };

  const del = async (p) => {
    if (!confirm(`"${p.name}" মুছে ফেলবেন?`)) return;
    try { await deleteDoc(doc(db, COL.products, p.id)); await load(); } catch (x) { setMsg('মোছা যায়নি: ' + (x.code || x.message)); }
  };

  if (form)
    return (
      <div className="a-card">
        <div className="a-head">
          <h2>{form.id ? 'বই এডিট' : 'নতুন বই'}</h2>
          <button className="btn ghost xs" onClick={() => { setForm(null); setMsg(''); }}>বাতিল</button>
        </div>
        <form className="contact-form" onSubmit={save} style={{ border: 0, padding: 0 }}>
          <div className="two">
            <label>বইয়ের নাম<input required value={form.name} onChange={set('name')} /></label>
            <label>লেখক<input value={form.author} onChange={set('author')} /></label>
          </div>
          <div className="two">
            <label>দাম (টাকা)<input required type="number" min="1" value={form.price} onChange={set('price')} /></label>
            <label>আগের দাম (অফার হলে, ঐচ্ছিক)<input type="number" min="0" value={form.regularPrice} onChange={set('regularPrice')} /></label>
          </div>
          <label>স্টক (কতটি আছে)<input required type="number" min="0" value={form.stock} onChange={set('stock')} /></label>
          <div className="fld">
            <span>ক্যাটাগরি</span>
            {cats.length === 0 ? (
              <span className="muted small">আগে "ক্যাটাগরি" ট্যাব থেকে ক্যাটাগরি বানান।</span>
            ) : (
              <div className="chk">
                {cats.map((c) => (
                  <label key={c.id}>
                    <input type="checkbox" checked={form.categoryIds.includes(c.id)} onChange={() => toggleCat(c.id)} /> {c.name}
                  </label>
                ))}
              </div>
            )}
          </div>
          <label className="radio-row" style={{ alignItems: 'center' }}>
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm((s) => ({ ...s, featured: e.target.checked }))} /> হোমপেজে "নির্বাচিত বই"-এ দেখান
          </label>
          <label>সংক্ষিপ্ত বিবরণ<textarea rows={2} value={form.shortDesc} onChange={set('shortDesc')} /></label>
          <label>পূর্ণ বিবরণ<textarea rows={6} value={form.description} onChange={set('description')} /></label>
          <div className="fld">
            <span>ছবি (প্রথমটি কভার)</span>
            <AdminImageUploader value={form.images} onChange={(images) => setForm((s) => ({ ...s, images }))} />
          </div>
          {msg && <p className="form-err">{msg}</p>}
          <button className="btn" type="submit" disabled={busy}>{busy ? 'সেভ হচ্ছে...' : 'সেভ করুন'}</button>
        </form>
      </div>
    );

  return (
    <div className="a-card">
      <div className="a-head">
        <h2>বই ({bn(items.length)})</h2>
        <button className="btn xs" onClick={() => { setForm({ ...EMPTY }); setMsg(''); }}><Plus size={15} /> নতুন বই</button>
      </div>
      <label className="searchbox" style={{ marginBottom: '.8rem' }}>
        <Search size={18} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="বইয়ের নাম খুঁজুন" />
      </label>
      {msg && <p className="form-err">{msg}</p>}
      {loading && <p className="muted">লোড হচ্ছে...</p>}
      {!loading && shown.length === 0 && <p className="muted">কোনো বই নেই। "নতুন বই" দিয়ে শুরু করুন।</p>}
      {shown.map((p) => (
        <div className="a-row" key={p.id}>
          {p.images?.[0] ? <img src={optimize(p.images[0], 120)} alt="" /> : <span className="ph" style={{ width: 48, height: 64 }} />}
          <div className="grow">
            <strong>{p.name}</strong>
            <div className="muted small">
              {p.author || '—'} · {money(p.price)} · স্টক {bn(p.stock || 0)}
              {p.featured ? ' · নির্বাচিত' : ''}
            </div>
          </div>
          <div className="a-actions">
            <button className="btn ghost xs" onClick={() => edit(p)}><Pencil size={14} /> এডিট</button>
            <button className="btn danger xs" onClick={() => del(p)}><Trash2 size={14} /></button>
          </div>
        </div>
      ))}
    </div>
  );
}
