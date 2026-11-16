import { getPage, PAGE_SLUGS } from '@/lib/wp';
import InfoPage from '@/components/InfoPage';

export const metadata = { title: 'ডেলিভারি ও রিটার্ন নীতিমালা - খেদমতে খালক মিডিয়া' };

export default async function DeliveryReturn() {
  const wp = await getPage(PAGE_SLUGS.delivery);
  return (
    <InfoPage
      title="ডেলিভারি ও রিটার্ন নীতিমালা"
      wp={wp}
      fallback={<p>ডেলিভারি ও রিটার্নের বিস্তারিত নিয়ম শীঘ্রই এখানে যোগ করা হবে। এর মধ্যে জানতে চাইলে আমাদের সরাসরি জিজ্ঞেস করুন।</p>}
    />
  );
}
