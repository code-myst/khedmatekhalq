import { BookOpen, ShieldCheck, PackageCheck, Phone } from 'lucide-react';
import { getProducts, getCategories } from '@/lib/products';
import { CONTACT } from '@/lib/config';
import Hero from '@/components/Hero';
import Categories from '@/components/Categories';
import Featured from '@/components/Featured';
import Promos from '@/components/Promos';
import Shop from '@/components/Shop';
import Steps from '@/components/Steps';

export const revalidate = 30;

export default async function Home() {
  const products = await getProducts();
  const categories = await getCategories(products);
  const covers = products.map((p) => p.image).filter(Boolean);
  let featured = products.filter((p) => p.featured && p.inStock);
  if (!featured.length) featured = products.filter((p) => p.inStock).slice(0, 10);
  const saleCount = products.filter((p) => p.onSale).length;

  return (
    <>
      <Hero covers={covers} />
      <section className="trust">
        <div className="trust-in">
          <div className="rv"><BookOpen size={26} strokeWidth={1.6} /><div><strong>নির্বাচিত বই</strong><span>তাফসীর, হাদীস ও জীবনধারা</span></div></div>
          <div className="rv"><PackageCheck size={26} strokeWidth={1.6} /><div><strong>সহজ অর্ডার</strong><span>কার্টে যোগ করে সরাসরি চেকআউট</span></div></div>
          <div className="rv"><ShieldCheck size={26} strokeWidth={1.6} /><div><strong>ক্যাশ অন ডেলিভারি</strong><span>বই হাতে পেয়ে টাকা দিন</span></div></div>
          <div className="rv"><Phone size={26} strokeWidth={1.6} /><div><strong>সরাসরি যোগাযোগ</strong><span>{CONTACT.phone1}</span></div></div>
        </div>
      </section>
      <Categories categories={categories} />
      {featured.length > 0 && <Featured products={featured} />}
      <Promos saleCount={saleCount} />
      <Shop products={products} categories={categories} />
      <Steps />
    </>
  );
}
