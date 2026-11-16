import { getPage, PAGE_SLUGS } from '@/lib/wp';
import InfoPage from '@/components/InfoPage';

export const metadata = { title: 'আমাদের সম্পর্কে - খেদমতে খালক মিডিয়া' };

export default async function About() {
  const wp = await getPage(PAGE_SLUGS.about);
  return (
    <InfoPage
      title="আমাদের সম্পর্কে"
      wp={wp}
      fallback={
        <p>
          খিদমতে খাল্‌ক — মানবতার সেবায় এবং সঠিক ইসলামী জ্ঞান প্রসারে একটি বিশ্বস্ত প্রতিষ্ঠান। আমাদের লক্ষ্য হলো সহজলভ্য ও
          মানসম্মত ইসলামী বইয়ের মাধ্যমে একটি জ্ঞানদীপ্ত সমাজ গড়ে তোলা।
        </p>
      }
    />
  );
}
