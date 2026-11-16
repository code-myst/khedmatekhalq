import { MousePointerClick, ShoppingBag, PackageCheck, MessageCircle } from 'lucide-react';
import { CONTACT } from '@/lib/config';

const STEPS = [
  { Icon: MousePointerClick, t: 'বই বেছে নিন', d: 'ক্যাটাগরি বা সার্চ থেকে পছন্দের বই খুঁজুন।' },
  { Icon: ShoppingBag, t: 'কার্টে যোগ করুন', d: 'সংখ্যা ঠিক করে কার্টে রাখুন।' },
  { Icon: PackageCheck, t: 'চেকআউট করুন', d: 'নিরাপদ চেকআউটে ঠিকানা দিয়ে অর্ডার নিশ্চিত করুন।' },
];

export default function Steps() {
  return (
    <section className="wrap steps-sec">
      <div className="sec-head center rv">
        <div>
          <p className="eyebrow">সহজ ৩ ধাপ</p>
          <h2>কীভাবে অর্ডার করবেন</h2>
        </div>
      </div>
      <div className="steps">
        {STEPS.map(({ Icon, t, d }, i) => (
          <div className="step rv" key={t}>
            <span className="num">{['১', '২', '৩'][i]}</span>
            <Icon size={28} strokeWidth={1.6} />
            <strong>{t}</strong>
            <p>{d}</p>
          </div>
        ))}
        <div className="help rv">
          <MessageCircle size={30} />
          <strong>কিছু জানার আছে?</strong>
          <p>হোয়াটসঅ্যাপে সরাসরি মেসেজ দিন।</p>
          <a className="btn light" href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">মেসেজ করুন</a>
        </div>
      </div>
    </section>
  );
}
