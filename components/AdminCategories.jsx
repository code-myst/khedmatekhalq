'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, setDoc, deleteDoc, doc } from 'firebase/firestore';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { COL } from '@/lib/firebaseConfig';
import { optimize } from '@/lib/cloudinary';
import { bn } from '@/lib/config';
import AdminImageUploader from './AdminImageUploader';

const EMPTY = { name: '', order: '', images: [] };

export default function AdminCategories() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const s = await getDocs(collection(db, COL.categories));
      setItems(s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (e) {
      setMsg('লোড করা যায়নি: ' + (e.code || e.message));
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    setMsg('');
    if (!form.name.trim()) return setMsg('ক্যাটাগরির নাম দিন।');
    const data = { name: form.name.trim(), order: Number(form.order) || 0, image: form.images[0] || '' };
    setBusy(true);
    try {
      if (form.id) await setDoc(doc(db, COL.categories, form.id), data, { merge: true });
      else await addDoc(collection(db, COL.categories), { ...data, createdAt: Date.now() });
      setForm(null);
      await load();
    } catch (x) {
      setMsg('সেভ হয়নি: ' + (x.code || x.message));
    }
    setBusy(false);
  };

  const del = async (c) => {
    if (!confirm(`"${c.name}" ক্যাটাগরি মুছবেন? (বইগুলো মুছবে না)`)) return;
    try { await deleteDoc(doc(db, COL.categories, c.id)); await load(); } catch (x) { setMsg('মোছা যায়নি: ' + (x.code || x.message)); }
  };

  if (form)
    return (
      <div className="a-card">
        <div className="a-head">
          <h2>{form.id ? 'ক্যাটাগরি এডিট' : 'নতুন ক্যাটাগরি'}</h2>
          <button className="btn ghost xs" onClick={() => { setForm(null); setMsg(''); }}>বাতিল</button>
        </div>
        <form className="contact-form" onSubmit={save} style={{ border: 0, padding: 0 }}>
          <label>নাম<input required value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} /></label>
          <label>ক্রম (ছোট সংখ্যা আগে দেখাবে)<input type="number" value={form.order} onChange={(e) => setForm((s) => ({ ...s, order: e.target.value }))} /></label>
          <div className="fld">
            <span>ছবি (ঐচ্ছিক)</span>
            <AdminImageUploader multiple={false} value={form.images} onChange={(images) => setForm((s) => ({ ...s, images }))} />
          </div>
          {msg && <p className="form-err">{msg}</p>}
          <button className="btn" type="submit" disabled={busy}>{busy ? 'সেভ হচ্ছে...' : 'সেভ করুন'}</button>
        </form>
      </div>
    );

  return (
    <div className="a-card">
      <div className="a-head">
        <h2>ক্যাটাগরি ({bn(items.length)})</h2>
        <button className="btn xs" onClick={() => { setForm({ ...EMPTY }); setMsg(''); }}><Plus size={15} /> নতুন ক্যাটাগরি</button>
      </div>
      {msg && <p className="form-err">{msg}</p>}
      {loading && <p className="muted">লোড হচ্ছে...</p>}
      {!loading && items.length === 0 && <p className="muted">এখনো কোনো ক্যাটাগরি নেই।</p>}
      {items.map((c) => (
        <div className="a-row" key={c.id}>
          {c.image ? <img src={optimize(c.image, 120)} alt="" /> : <span className="ph" style={{ width: 48, height: 64 }} />}
          <div className="grow"><strong>{c.name}</strong><div className="muted small">ক্রম: {bn(c.order || 0)}</div></div>
          <div className="a-actions">
            <button className="btn ghost xs" onClick={() => setForm({ ...EMPTY, ...c, order: String(c.order ?? ''), images: c.image ? [c.image] : [] })}><Pencil size={14} /> এডিট</button>
            <button className="btn danger xs" onClick={() => del(c)}><Trash2 size={14} /></button>
          </div>
        </div>
      ))}
    </div>
  );
}
