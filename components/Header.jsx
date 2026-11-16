'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Menu, X, User, Phone, Sparkles } from 'lucide-react';
import { useCart } from './CartProvider';
import { LOGO, WP_URL, CONTACT, bn } from '@/lib/config';

export default function Header() {
  const { count, setOpen } = useCart();
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  const close = () => setMenu(false);

  return (
    <>
      <div className="topbar">
        <div className="topbar-in">
          <span><Sparkles size={15} /> নির্বাচিত ইসলামিক বই, সহজ অর্ডার</span>
          <a href={`tel:${CONTACT.phone1.replace(/\s/g, '')}`}><Phone size={15} /> {CONTACT.phone1}</a>
        </div>
      </div>
      <header className={`bar ${scrolled ? 'scrolled' : ''}`}>
        <div className="bar-in">
          <Link href="/" className="brand" onClick={close}>
            <img src={LOGO} alt="" width="44" height="44" />
            <span>খেদমতে খালক<small>মিডিয়া</small></span>
          </Link>
          <nav className={`nav ${menu ? 'open' : ''}`}>
            <Link href="/" onClick={close}>হোম</Link>
            <Link href="/#categories" onClick={close}>ক্যাটাগরি</Link>
            <Link href="/#featured" onClick={close}>নির্বাচিত বই</Link>
            <Link href="/#shop" onClick={close}>সব বই</Link>
            <Link href="/about" onClick={close}>আমাদের সম্পর্কে</Link>
            <Link href="/contact" onClick={close}>যোগাযোগ</Link>
          </nav>
          <div className="actions">
            <Link href="/#shop" className="icon-btn" aria-label="বই খুঁজুন"><Search size={20} /></Link>
            <a href={`${WP_URL}/my-account/`} className="icon-btn" aria-label="অ্যাকাউন্ট"><User size={20} /></a>
            <button className="icon-btn" onClick={() => setOpen(true)} aria-label="কার্ট খুলুন">
              <ShoppingBag size={20} />
              {count > 0 && <span className="badge">{bn(count)}</span>}
            </button>
            <button className="icon-btn burger" onClick={() => setMenu((m) => !m)} aria-label="মেনু">
              {menu ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
