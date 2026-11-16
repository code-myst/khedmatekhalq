'use client';
import { useState } from 'react';
import { Star, MessageSquarePlus } from 'lucide-react';
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

export default function ProductTabs({ description, reviews, rating, reviewCount, reviewUrl }) {
  const [tab, setTab] = useState('desc');
  return (
    <div className="tabs-wrap">
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'desc'} className={tab === 'desc' ? 'on' : ''} onClick={() => setTab('desc')}>
          বিবরণ
        </button>
        <button role="tab" aria-selected={tab === 'rev'} className={tab === 'rev' ? 'on' : ''} onClick={() => setTab('rev')}>
          রিভিউ ({bn(reviewCount)})
        </button>
      </div>

      {tab === 'desc' && (
        <div className="prose" role="tabpanel" dangerouslySetInnerHTML={{ __html: description || '<p>বিবরণ শীঘ্রই যোগ করা হবে।</p>' }} />
      )}

      {tab === 'rev' && (
        <div role="tabpanel" className="reviews">
          {reviewCount > 0 && (
            <div className="rev-sum">
              <strong>{bn(Number(rating).toFixed(1))}</strong>
              <Stars value={rating} size={18} />
              <span className="muted">{bn(reviewCount)}টি রিভিউ</span>
            </div>
          )}
          {reviews.length === 0 ? (
            <p className="muted">এখনো কোনো রিভিউ নেই। বইটি পড়ে থাকলে প্রথম রিভিউ আপনিই দিন।</p>
          ) : (
            reviews.map((r) => (
              <article key={r.id} className="rev">
                <div className="rev-top">
                  <strong>{r.reviewer}</strong>
                  <Stars value={r.rating} size={14} />
                  <span className="muted">{new Date(r.date_created).toLocaleDateString('bn-BD')}</span>
                </div>
                <div className="prose" dangerouslySetInnerHTML={{ __html: r.review }} />
              </article>
            ))
          )}
          {reviewUrl && (
            <a className="btn ghost" href={`${reviewUrl}#reviews`} target="_blank" rel="noopener noreferrer">
              <MessageSquarePlus size={16} /> রিভিউ লিখুন
            </a>
          )}
        </div>
      )}
    </div>
  );
}
