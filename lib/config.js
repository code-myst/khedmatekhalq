export const LOGO = `https://res.cloudinary.com/dbdkxzx7z/image/upload/v1792403416/lqs5q7pckwgb51suwwrz.jpg`;
export const bn = (n) => Number(n).toLocaleString('bn-BD');
// দাম সরাসরি টাকায় রাখা হয় (আগের WooCommerce-এর মতো ÷১০০ নয়)
export const money = (taka) => '৳' + Number(taka || 0).toLocaleString('bn-BD');

export const CONTACT = {
  phone1: '+88 01405 667505',
  phone2: '+88 01893 12396',
  whatsapp: 'https://wa.me/8801405667505',
  email: 'kingmd892@gmail.com',
  address: '৩৫০ দনিয়া বিশ্বরোড, (D.S.C.C 46) যাত্রাবাড়ি, ঢাকা-১২৩৬',
};

// ডেলিভারি চার্জ (টাকা) — এখান থেকে বদলান
export const SHIPPING = { dhaka: 60, outside: 120 };

// bKash / Nagad নম্বর দিলেই চেকআউটে সেই অপশন দেখাবে। ফাঁকা থাকলে শুধু ক্যাশ অন ডেলিভারি থাকবে।
export const PAYMENT = { bkash: '', nagad: '' };

export const ORDER_STATUS = {
  pending: 'অপেক্ষমাণ',
  confirmed: 'নিশ্চিত',
  shipped: 'পাঠানো হয়েছে',
  delivered: 'পৌঁছেছে',
  cancelled: 'বাতিল',
};
