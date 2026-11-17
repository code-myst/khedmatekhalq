'use client';
import { useRef, useState } from 'react';
import { X, Upload } from 'lucide-react';
import { uploadImage, optimize } from '@/lib/cloudinary';

// Cloudinary-তে সরাসরি আপলোড। ছবিতে ক্লিক করলে সেটি কভার হয়ে যায়।
export default function AdminImageUploader({ value = [], onChange, multiple = true }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const pick = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    setBusy(true);
    setErr('');
    try {
      const urls = [];
      for (const f of files) urls.push(await uploadImage(f));
      onChange(multiple ? [...value, ...urls] : urls.slice(0, 1));
    } catch (x) {
      setErr(x.message || 'আপলোড হয়নি');
    }
    setBusy(false);
  };

  const remove = (i) => onChange(value.filter((_, n) => n !== i));
  const makeCover = (i) => i > 0 && onChange([value[i], ...value.filter((_, n) => n !== i)]);

  return (
    <div>
      <div className="up-grid">
        {value.map((u, i) => (
          <div className="up-item" key={u}>
            <img src={optimize(u, 160)} alt="" onClick={() => makeCover(i)} title={i > 0 ? 'কভার করুন' : ''} />
            {multiple && i === 0 && <span className="cover-tag">কভার</span>}
            <button type="button" onClick={() => remove(i)} aria-label="সরান"><X size={12} /></button>
          </div>
        ))}
      </div>
      <button type="button" className="btn ghost xs" disabled={busy} onClick={() => input.current?.click()}>
        <Upload size={14} /> {busy ? 'আপলোড হচ্ছে...' : 'ছবি যোগ করুন'}
      </button>
      <input ref={input} type="file" accept="image/*" multiple={multiple} hidden onChange={pick} />
      {err && <p className="form-err" style={{ marginTop: '.5rem' }}>{err}</p>}
    </div>
  );
}
