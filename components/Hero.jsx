'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { CONTACT } from '@/lib/config';

export default function Hero({ covers }) {
  const root = useRef(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set('.cover', { rotate: (i) => [-8, 2, 9][i] || 0 });
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.h-kicker', { y: 16, opacity: 0, duration: 0.5 })
        .from('.h-line', { yPercent: 115, duration: 0.9, stagger: 0.14 }, '-=0.2')
        .from('.h-sub, .h-cta', { y: 20, opacity: 0, duration: 0.6, stagger: 0.12 }, '-=0.45')
        .from('.cover', { y: 70, opacity: 0, duration: 0.9, stagger: 0.15 }, '-=0.9');
      gsap.to('.cover', { y: '-=12', duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.35 });
    }, root);
    return () => mm.revert();
  }, []);

  return (
    <section className="hero" ref={root}>
      <div className="hero-in">
        <div className="hero-copy">
          <p className="h-kicker"><span className="ar">العلم نور</span> · সঠিক জ্ঞানের আলো</p>
          <h1>
            <span className="mask"><span className="h-line">কুরআনের আলোয়</span></span>
            <span className="mask"><span className="h-line">জীবন গড়ার বই</span></span>
          </h1>
          <p className="h-sub">তাফসীর, হাদীস ও পরিবার-জীবনের নির্বাচিত ইসলামিক বই এক জায়গায়। পছন্দ করুন, কার্টে যোগ করুন, ঘরে বসে পেয়ে যান।</p>
          <div className="h-cta">
            <a className="btn" href="#shop">বই দেখুন <ArrowRight size={18} /></a>
            <a className="btn outline-light" href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={18} /> হোয়াটসঅ্যাপে জানুন
            </a>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="arch" />
          <div className="covers">
            {covers.slice(0, 3).map((src, i) => (
              <div key={i} className="cover"><img src={src} alt="" /></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
