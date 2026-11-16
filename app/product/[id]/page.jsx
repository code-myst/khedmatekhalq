import Link from 'next/link';
import { ChevronRight, Banknote, Truck } from 'lucide-react';
import { wc } from '@/lib/wc';
import { shape } from '@/lib/shape';
import { getAuthors, getSeo } from '@/lib/wp';
import AddToCart from '@/components/AddToCart';
import Gallery from '@/components/Gallery';
import ProductCard from '@/components/ProductCard';
import ProductTabs from '@/components/ProductTabs';

const strip = (h = '') => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

export async function generateMetadata({ params }) {
  const { id } = await params;
  const [p, seo] = await Promise.all([wc(`/products/${id}`), getSeo(id)]);
  const title = seo?.title || `${p.name} - খেদমতে খালক মিডিয়া`;
  const description = seo?.description || strip(p.short_description).slice(0, 160);
  const images = seo?.images?.length ? seo.images : p.images?.[0] ? [p.images[0].src] : [];
  return { title, description, openGraph: { title, description, images, type: 'website' } };
}

export default async function Product({ params }) {
  const { id } = await params;
  const p = await wc(`/products/${id}`);

  let options;
  if (p.type === 'variable') {
    const terms = Object.fromEntries((p.attributes[0]?.terms || []).map((t) => [t.slug, t.name]));
    options = await Promise.all(
      p.variations.map(async (v) => {
        const d = await wc(`/products/${v.id}`);
        const slug = v.attributes[0]?.value || '';
        return { id: v.id, label: terms[slug] || decodeURIComponent(slug), price: d.prices.price, inStock: d.is_in_stock };
      })
    );
  } else {
    options = [{ id: p.id, label: '', price: p.prices.price, inStock: p.is_in_stock }];
  }

  const images = (p.images || []).map((i) => i.src);
  const cat = p.categories?.at(-1);
  const [relatedRaw, reviews, authors] = await Promise.all([
    cat ? wc('/products', { category: cat.id, per_page: 5 }).catch(() => []) : [],
    wc('/products/reviews', { product_id: p.id, per_page: 20 }).catch(() => []),
    getAuthors(),
  ]);
  const related = relatedRaw.filter((x) => x.id !== p.id).slice(0, 4).map((x) => ({ ...shape(x), author: authors[x.id] || '' }));
  const author = authors[p.id];
  const rating = Number(p.average_rating) || 0;
  const reviewCount = Number(p.review_count) || reviews.length;

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    image: images,
    description: strip(p.short_description),
    ...(author ? { author: { '@type': 'Person', name: author } } : {}),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BDT',
      price: Number(p.prices.price) / 100,
      availability: p.is_in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    ...(reviewCount > 0 && rating > 0
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: rating, reviewCount } }
      : {}),
  };

  return (
    <div className="wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <nav className="crumbs" aria-label="পথ">
        <Link href="/">হোম</Link><ChevronRight size={14} /><Link href="/#shop">সব বই</Link><ChevronRight size={14} /><span>{p.name}</span>
      </nav>
      <div className="detail">
        <Gallery images={images} alt={p.name} />
        <div>
          <h1>{p.name}</h1>
          {author && <p className="author-line">লেখক: <strong>{author}</strong></p>}
          <div className="prose" dangerouslySetInnerHTML={{ __html: p.short_description }} />
          <AddToCart product={{ name: p.name, image: images[0] || '' }} options={options} />
          <ul className="notes">
            <li><Banknote size={18} /> পেমেন্ট: ক্যাশ অন ডেলিভারি</li>
            <li><Truck size={18} /> <Link href="/delivery-return">ডেলিভারি ও রিটার্ন নীতিমালা</Link></li>
          </ul>
        </div>
      </div>
      <ProductTabs
        description={p.description}
        reviews={reviews}
        rating={rating}
        reviewCount={reviewCount}
        reviewUrl={p.permalink}
      />
      {related.length > 0 && (
        <section className="related rv">
          <h2>আরও বই</h2>
          <div className="grid">{related.map((r) => <ProductCard key={r.id} p={r} />)}</div>
        </section>
      )}
    </div>
  );
}
