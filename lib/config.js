export const WP_URL = process.env.NEXT_PUBLIC_WP_URL || 'https://khedmatekhalq.com';
export const LOGO = `https://res.cloudinary.com/dbdkxzx7z/image/upload/v1792403416/lqs5q7pckwgb51suwwrz.jpg`;
export const bn = (n) => Number(n).toLocaleString('bn-BD');
export const money = (minor) => '৳' + (Number(minor) / 100).toLocaleString('bn-BD');

export const CONTACT = {
  phone1: '+88 01405 667505',
  phone2: '+88 01893 12396',
  whatsapp: 'https://wa.me/8801405667505',
  email: 'kingmd892@gmail.com',
  address: '৩৫০ দনিয়া বিশ্বরোড, (D.S.C.C 46) যাত্রাবাড়ি, ঢাকা-১২৩৬',
};
