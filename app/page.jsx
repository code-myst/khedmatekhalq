import { BookOpen, ShieldCheck, PackageCheck, Phone } from 'lucide-react';
import { wc } from '@/lib/wc';
import { shape } from '@/lib/shape';
import { getAuthors } from '@/lib/wp';
import { CONTACT } from '@/lib/config';
import Hero from '@/components/Hero';
import Categories from '@/components/Categories';
import Featured from '@/components/Featured';
import Promos from '@/components/Promos';
import Shop from '@/components/Shop';
import Steps from '@/components/Steps';

export default async function Home() {
  const [raw, cats, authors] = await Promise.all([wc('/products', { per_page: 100 }), wc('/products/categories'), getAuthors()]);
  const products = raw.map((p) => ({ ...shape(p), author: authors[p.id] || '' }));
  const categories = cats
    .filter((c) => c.count > 0 && c.count !== products.length)
    .map((c) => ({ id: c.id, name: c.name, count: c.count, image: c.image?.src || '' }));
  const covers = products.map((p) => p.image).filter(Boolean);
  const featured = [...products]
    .filter((p) => p.inStock)
    .sort((a, b) => b.rating - a.rating || Number(b.onSale) - Number(a.onSale) || b.id - a.id)
    .slice(0, 10);
  const saleCount = products.filter((p) => p.onSale).length;

  return (
    <>
      <Hero covers={covers} />
      <section className="trust">
        <div className="trust-in">
          <div className="rv"><BookOpen size={26} strokeWidth={1.6} /><div><strong>নির্বাচিত বই</strong><span>তাফসীর, হাদীস ও জীবনধারা</span></div></div>
          <div className="rv"><PackageCheck size={26} strokeWidth={1.6} /><div><strong>সহজ অর্ডার</strong><span>কার্টে যোগ করে সরাসরি চেকআউট</span></div></div>
          <div className="rv"><ShieldCheck size={26} strokeWidth={1.6} /><div><strong>নিরাপদ চেকআউট</strong><span>অর্ডার ও পেমেন্ট মূল সাইটে</span></div></div>
          <div className="rv"><Phone size={26} strokeWidth={1.6} /><div><strong>সরাসরি যোগাযোগ</strong><span>{CONTACT.phone1}</span></div></div>
        </div>
      </section>
      <Categories categories={categories} />
      <Featured products={featured} />
      <Promos saleCount={saleCount} />
      <Shop products={products} categories={categories} />
      <Steps />
    </>
  );
}
