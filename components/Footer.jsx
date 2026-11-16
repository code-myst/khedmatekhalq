import Link from 'next/link';
import { MapPin, Phone, Mail } from 'lucide-react';
import { LOGO, WP_URL, CONTACT, bn } from '@/lib/config';

export default function Footer() {
  return (
    <footer className="foot" id="contact">
      <div className="foot-band"><span className="ar">القرآن نور الحياة</span></div>
      <div className="foot-in">
        <div>
          <div className="brand light">
            <img src={LOGO} alt="" width="44" height="44" />
            <span>খেদমতে খালক<small>মিডিয়া</small></span>
          </div>
          <p className="foot-text">
            খিদমতে খাল্‌ক — মানবতার সেবায় এবং সঠিক ইসলামী জ্ঞান প্রসারে একটি বিশ্বস্ত প্রতিষ্ঠান। সহজলভ্য ও মানসম্মত ইসলামী বইয়ের মাধ্যমে জ্ঞানদীপ্ত সমাজ গড়াই আমাদের লক্ষ্য।
          </p>
        </div>
        <div>
          <h4>দোকান</h4>
          <Link href="/#categories">ক্যাটাগরি</Link>
          <Link href="/#featured">নির্বাচিত বই</Link>
          <Link href="/#shop">সব বই</Link>
          <Link href="/cart">কার্ট</Link>
        </div>
        <div>
          <h4>তথ্য ও অ্যাকাউন্ট</h4>
          <Link href="/about">আমাদের সম্পর্কে</Link>
          <Link href="/contact">যোগাযোগ</Link>
          <Link href="/delivery-return">ডেলিভারি ও রিটার্ন</Link>
          <a href={`${WP_URL}/privacy-policy/`}>প্রাইভেসি পলিসি</a>
          <a href={`${WP_URL}/my-account/`}>আমার অ্যাকাউন্ট</a>
        </div>
        <div>
          <h4>যোগাযোগ</h4>
          <p className="ct"><MapPin size={16} /> {CONTACT.address}</p>
          <a className="ct" href={`tel:${CONTACT.phone1.replace(/\s/g, '')}`}><Phone size={16} /> {CONTACT.phone1}</a>
          <a className="ct" href={`tel:${CONTACT.phone2.replace(/\s/g, '')}`}><Phone size={16} /> {CONTACT.phone2}</a>
          <a className="ct" href={`mailto:${CONTACT.email}`}><Mail size={16} /> {CONTACT.email}</a>
        </div>
      </div>
      <p className="copy">© {bn(new Date().getFullYear()).replace(/,/g, '')} খেদমতে খালক মিডিয়া। সর্বস্বত্ব সংরক্ষিত।</p>
    </footer>
  );
}
