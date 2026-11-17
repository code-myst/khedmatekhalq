# খেদমতে খালক মিডিয়া — বইয়ের অনলাইন দোকান

Next.js + Firebase (Firestore + Auth) + Cloudinary। WordPress/WooCommerce আর লাগে না।

## চালানো
```
npm install
npm run dev
```

## Firebase Console-এ এক-বারের সেটআপ (প্রজেক্ট: ridwan-ragib)
1. **Authentication → Sign-in method → Email/Password** চালু করুন।
2. **Firestore → Rules**: `firestore-rules-snippet.txt`-এর অংশটুকু বর্তমান rules-এর `match /databases/{database}/documents { ... }`-এর **ভেতরে যোগ** করে Publish করুন। পুরোনো নিয়ম মুছবেন না — এই প্রজেক্টে আরেকটা সাইটও আছে।
3. সব কালেকশন `kb_` দিয়ে শুরু (`kb_products`, `kb_categories`, `kb_orders`, `kb_reviews`, `kb_admins`), তাই অন্য সাইটের ডেটা মিশবে না।

## প্রথম অ্যাডমিন বানানো
1. সাইটে `/login` থেকে নতুন অ্যাকাউন্ট খুলুন।
2. `/admin` খুললে আপনার UID দেখাবে। (অথবা Firebase Console → Authentication থেকে কপি করুন।)
3. Firestore-এ `kb_admins` কালেকশনে **ডকুমেন্ট আইডি = ওই UID** দিয়ে একটি ডকুমেন্ট বানান (যেকোনো একটি ফিল্ড, যেমন `role: "admin"`)।
4. `/admin` রিফ্রেশ করুন — এখন অ্যাডমিন প্যানেল খুলবে।

## অ্যাডমিন থেকে যা করা যায়
- **ক্যাটাগরি** বানানো (আগে এটা করুন), **বই** যোগ/এডিট/মোছা (ছবি সরাসরি Cloudinary-তে আপলোড), **অর্ডার** দেখা ও স্ট্যাটাস বদলানো।
- অর্ডার "নিশ্চিত" (বা পরের ধাপে) করলে বইয়ের স্টক নিজে থেকে কমে; "বাতিল/অপেক্ষমাণ" করলে ফিরে আসে।

## কনফিগ (`lib/config.js`)
- `SHIPPING` — ডেলিভারি চার্জ
- `PAYMENT` — bKash/Nagad নম্বর দিলে চেকআউটে সেই অপশন আসবে (ফাঁকা থাকলে শুধু ক্যাশ অন ডেলিভারি)
- `CONTACT` — ফোন, ঠিকানা, ইমেইল

## Vercel-এ ডিপ্লয়
GitHub-এ পুশ করে Vercel-এ ইমপোর্ট করুন। কোনো Environment Variable বাধ্যতামূলক নয় (শুধু চাইলে `NEXT_PUBLIC_GTM_ID`)।

## অব্যবহৃত ফাইল (ডিলিট করতে পারেন)
`lib/wc.js`, `lib/wp.js`, `lib/shape.js` — এখন ফাঁকা স্টাব।

## নিরাপত্তা নোট
অর্ডারের দাম ব্রাউজার থেকে সেভ হয় (চেকআউটের সময় Firestore থেকে সর্বশেষ দাম ও স্টক মিলিয়ে নেওয়া হয়)। তাই অর্ডার নিশ্চিত করার আগে অ্যাডমিন প্যানেলে মোট টাকা একবার দেখে নিন।
