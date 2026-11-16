import { Hind_Siliguri, Noto_Serif_Bengali, Amiri } from 'next/font/google';
import CartProvider from '@/components/CartProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import Motion from '@/components/Motion';
import GTM from '@/components/GTM';
import './globals.css';

const body = Hind_Siliguri({ weight: ['400', '500', '600', '700'], subsets: ['bengali', 'latin'], variable: '--body' });
const head = Noto_Serif_Bengali({ weight: ['600', '700'], subsets: ['bengali', 'latin'], variable: '--head' });
const arabic = Amiri({ weight: ['400', '700'], subsets: ['arabic'], variable: '--arabic' });

export const metadata = {
  title: 'খেদমতে খালক মিডিয়া - ইসলামিক বইয়ের অনলাইন দোকান',
  description: 'তাফসীর, হাদীস ও জীবনধারার নির্বাচিত ইসলামিক বই এক জায়গায়।',
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn" className={`${body.variable} ${head.variable} ${arabic.variable}`}>
      <body>
        <GTM />
        <CartProvider>
          <Motion />
          <Header />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
