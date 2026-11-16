'use client';
import { useState } from 'react';
import { Send } from 'lucide-react';
import { CONTACT } from '@/lib/config';

// No backend needed: the message opens in WhatsApp, pre-filled, to the shop's number.
export default function ContactForm() {
  const [f, setF] = useState({ name: '', phone: '', msg: '' });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const text = `আসসালামু আলাইকুম।\nনাম: ${f.name}\nফোন: ${f.phone}\n\n${f.msg}`;
    window.open(`${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <form className="contact-form" onSubmit={submit}>
      <label>আপনার নাম<input required value={f.name} onChange={set('name')} autoComplete="name" /></label>
      <label>ফোন নম্বর<input required type="tel" value={f.phone} onChange={set('phone')} autoComplete="tel" /></label>
      <label>বার্তা<textarea required rows={5} value={f.msg} onChange={set('msg')} /></label>
      <button className="btn" type="submit"><Send size={16} /> হোয়াটসঅ্যাপে পাঠান</button>
      <p className="muted small">বোতাম চাপলে বার্তাটি হোয়াটসঅ্যাপে সাজানো অবস্থায় খুলবে, সেখান থেকে পাঠাতে হবে।</p>
    </form>
  );
}
