import { ArrowRight, BadgePercent, Sparkles } from 'lucide-react';

export default function Promos({ saleCount }) {
  return (
    <section className="wrap promos">
      <a href="/?cat=sale#shop" className="promo dark rv">
        <div>
          <p className="eyebrow light"><BadgePercent size={15} /> সীমিত সময়ের অফার</p>
          <h3>নির্বাচিত বইয়ে বিশেষ ছাড়</h3>
          <p>{saleCount > 0 ? `এখন ${saleCount}টি বই অফার মূল্যে পাওয়া যাচ্ছে।` : 'অফারের বইগুলো দেখুন।'}</p>
          <span className="btn light">অফার দেখুন <ArrowRight size={16} /></span>
        </div>
        <span className="deco" aria-hidden="true" />
      </a>
      <a href="#shop" className="promo cream rv">
        <div>
          <p className="eyebrow"><Sparkles size={15} /> নতুন সংযোজন</p>
          <h3>সদ্য আসা বই</h3>
          <p>তাফসীর, হাদীস ও জীবনধারার নতুন বইগুলো আগে দেখুন।</p>
          <span className="btn">এখনই দেখুন <ArrowRight size={16} /></span>
        </div>
        <span className="deco" aria-hidden="true" />
      </a>
    </section>
  );
}
