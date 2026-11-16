import { BookOpen, ScrollText, HeartHandshake, Leaf, Package, Library, Star } from 'lucide-react';

const ICONS = [BookOpen, ScrollText, Library, HeartHandshake, Leaf, Package, Star];
const TINTS = ['#e3efe9', '#f5ebd6', '#f3e3ec', '#e4eaf3', '#eaf1dc', '#f6e4d9', '#e3efe9'];

export default function Categories({ categories }) {
  if (!categories.length) return null;
  return (
    <section id="categories" className="wrap cats">
      <div className="sec-head center rv">
        <div>
          <p className="eyebrow">ক্যাটাগরি অনুযায়ী</p>
          <h2>আপনার পছন্দের বিভাগ</h2>
        </div>
      </div>
      <div className="cat-row">
        {categories.map((c, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <a key={c.id} href={`/?cat=${c.id}#shop`} className="cat rv">
              <span className="cat-circle" style={{ background: TINTS[i % TINTS.length] }}>
                {c.image ? <img src={c.image} alt="" loading="lazy" /> : <Icon size={34} strokeWidth={1.6} />}
              </span>
              <strong>{c.name}</strong>
              <small>{c.count}টি বই</small>
            </a>
          );
        })}
      </div>
    </section>
  );
}
