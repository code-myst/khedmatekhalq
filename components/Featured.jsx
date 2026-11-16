'use client';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';

export default function Featured({ products }) {
  const track = useRef(null);
  const go = (dir) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };
  return (
    <section id="featured" className="wrap">
      <div className="sec-head rv">
        <div>
          <p className="eyebrow">বাছাই করা</p>
          <h2>নির্বাচিত বই</h2>
        </div>
        <a href="#shop" className="more">সব দেখুন <ArrowRight size={16} /></a>
      </div>
      <div className="carousel rv">
        <button className="nav-arrow left" onClick={() => go(-1)} aria-label="আগে"><ChevronLeft size={20} /></button>
        <div className="track" ref={track}>
          {products.map((p) => (
            <div className="slide" key={p.id}><ProductCard p={p} /></div>
          ))}
        </div>
        <button className="nav-arrow right" onClick={() => go(1)} aria-label="পরে"><ChevronRight size={20} /></button>
      </div>
    </section>
  );
}
