import InfoPage from '@/components/InfoPage';
import { SHIPPING, money } from '@/lib/config';

export const metadata = { title: 'ডেলিভারি ও রিটার্ন নীতিমালা - খেদমতে খালক মিডিয়া' };

export default function DeliveryReturn() {
  return (
    <InfoPage
      title="ডেলিভারি ও রিটার্ন নীতিমালা"
      fallback={
        <>
          <p>ডেলিভারি চার্জ: ঢাকার ভেতরে {money(SHIPPING.dhaka)}, ঢাকার বাইরে {money(SHIPPING.outside)}।</p>
          <p>ডেলিভারি ও রিটার্নের বিস্তারিত নিয়ম শীঘ্রই এখানে যোগ করা হবে। এর মধ্যে জানতে চাইলে আমাদের সরাসরি জিজ্ঞেস করুন।</p>
        </>
      }
    />
  );
}
