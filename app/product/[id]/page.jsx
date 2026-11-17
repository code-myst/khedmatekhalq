import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, Banknote, Truck } from 'lucide-react';
import { getProduct, getProducts, shape } from '@/lib/products';
import { optimize } from '@/lib/cloudinary';
import AddToCart from '@/components/AddToCart';
import Gallery from '@/components/Gallery';
import ProductCard from '@/components/ProductCard';
import ProductTabs from '@/components/ProductTabs';

export const revalidate = 30;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const p = await getProduct(id);
  if (!p) return { title: 'বই পাওয়া যায়নি - খেদমতে খালক মিডিয়া' };
  const title = `${p.name} - খেদমতে খালক মিডিয়া`;
  const description = (p.shortDesc || p.description || '').replace(/\s+/g, ' ').trim().slice(0, 160);
  const images = p.images?.[0] ? [optimize(p.images[0], 900)] : [];
  return { title, description, openGraph: { title, description, images, type: 'website' } };
}

export default async function Product({ params }) {
  const { id } = await params;
  const p = await getProduct(id);
  if (!p) notFound();

  const item = shape(p);
  const images = (p.images || []).map((u) => optimize(u, 900));
  const all = await getProducts();
  const related = all
    .filter((x) => x.id !== p.id && x.cats.some((c) => item.cats.includes(c)))
    .slice(0, 4);

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    image: images,
    description: p.shortDesc || '',
    ...(p.author ? { author: { '@type': 'Person', name: p.author } } : {}),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BDT',
      price: item.price,
      availability: item.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
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
          {p.author && <p className="author-line">লেখক: <strong>{p.author}</strong></p>}
          {p.shortDesc && <p className="prose pre">{p.shortDesc}</p>}
          <AddToCart product={item} />
          <ul className="notes">
            <li><Banknote size={18} /> ক্যাশ অন ডেলিভারি সুবিধা আছে</li>
            <li><Truck size={18} /> <Link href="/delivery-return">ডেলিভারি ও রিটার্ন নীতিমালা</Link></li>
          </ul>
        </div>
      </div>
      <ProductTabs productId={p.id} description={p.description} />
      {related.length > 0 && (
        <section className="related rv">
          <h2>আরও বই</h2>
          <div className="grid">{related.map((r) => <ProductCard key={r.id} p={r} />)}</div>
        </section>
      )}
    </div>
  );
}
