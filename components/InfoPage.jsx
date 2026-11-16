import Link from 'next/link';
import { ChevronRight, MessageCircle } from 'lucide-react';
import { CONTACT } from '@/lib/config';

// Shared layout for About / Contact / Delivery & Return pages.
// `wp` is the WordPress page ({title, html}) or null; `fallback` is shown when it isn't published yet.
export default function InfoPage({ title, wp, fallback, children }) {
  return (
    <div className="wrap narrow">
      <nav className="crumbs" aria-label="পথ">
        <Link href="/">হোম</Link><ChevronRight size={14} /><span>{title}</span>
      </nav>
      <h1 className="page-title">{title}</h1>
      {wp?.html ? (
        <div className="prose wp-content" dangerouslySetInnerHTML={{ __html: wp.html }} />
      ) : (
        <div className="prose">{fallback}</div>
      )}
      {children}
      {!wp?.html && (
        <p className="info-cta">
          <a className="btn" href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={18} /> হোয়াটসঅ্যাপে জিজ্ঞেস করুন
          </a>
        </p>
      )}
    </div>
  );
}
