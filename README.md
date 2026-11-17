# খেদমতে খালক মিডিয়া — বইয়ের অনলাইন দোকান

Next.js + Firebase (Firestore + Auth) + Cloudinary। WordPress/WooCommerce আর লাগে না।

## চালানো
```
npm install
npm run dev
```

## Firebase Console-এ এক-বারের সেটআপ
1. **Authentication → Sign-in method → Email/Password** চালু করুন।
2. **Firestore → Rules**: `firestore-rules-snippet.txt`-এর অংশটুকু rules-এর `match /databases/{database}/documents { ... }`-এর **ভেতরে যোগ** করে Publish করুন। (প্রজেক্ট শেয়ার করা হলে পুরোনো নিয়ম মুছবেন না।)
3. সব কালেকশন `kb_` দিয়ে শুরু (`kb_products`, `kb_categories`, `kb_orders`, `kb_reviews`, `kb_admins`)।

## প্রথম অ্যাডমিন বানানো
1. `/login` থেকে নতুন অ্যাকাউন্ট খুলুন।
2. `/admin` খুললে আপনার UID দেখাবে।
3. Firestore-এ `kb_admins` কালেকশনে **ডকুমেন্ট আইডি = ওই UID** দিয়ে একটি ডকুমেন্ট বানান (যেকোনো একটি ফিল্ড)।
4. `/admin` রিফ্রেশ করুন।

## অ্যাডমিন থেকে যা করা যায়
ক্যাটাগরি, বই (ছবি Cloudinary-তে), অর্ডার ও স্ট্যাটাস। অর্ডার "নিশ্চিত" করলে স্টক কমে; "বাতিল/অপেক্ষমাণ" করলে ফিরে আসে।

## কনফিগ (`lib/config.js`)
- `SHIPPING` — ডেলিভারি চার্জ
- `PAYMENT` — bKash/Nagad নম্বর (ফাঁকা থাকলে শুধু ক্যাশ অন ডেলিভারি)
- `CONTACT` — ফোন, ঠিকানা, ইমেইল

---

## MCP — AI চ্যাট থেকে দোকান চালানো (Claude)
সাইটের সাথেই `/api/mcp` নামে একটা MCP সার্ভার আছে। এর মাধ্যমে Claude-কে দিয়ে অবস্থা জানা, অর্ডার/বই বদলানো ও বিশ্লেষণ করা যায়।

### টুলসমূহ
- **অবস্থা:** `store_overview`
- **দেখা:** `list_orders`, `get_order`, `list_products`, `get_product`, `list_categories`, `list_reviews`
- **বদলানো:** `update_order_status`, `add_product`, `update_product`, `delete_product`, `add_category`, `update_category`, `delete_category`, `delete_review` (মোছার টুলে `confirm: true` লাগে)
- **বিশ্লেষণ:** `sales_report`, `top_products`, `category_performance`, `customer_insights`, `inventory_report`

### সেটআপ
1. Firebase Console → Project settings → **Service accounts** → **Generate new private key**। JSON ফাইলটা গোপন রাখুন (গিটহাবে তুলবেন না)।
2. হোস্টিংয়ের Environment Variables-এ দুটো দিন:
   - `FIREBASE_SERVICE_ACCOUNT` = JSON-এর পুরো লেখা (এক লাইনে) বা base64
   - `MCP_SECRET` = কমপক্ষে ২৪ অক্ষরের লম্বা এলোমেলো কী
3. ডিপ্লয় করুন। কানেক্টর URL হবে:
   `https://আপনার-সাইট/api/mcp?key=আপনার_MCP_SECRET`
4. Claude → **Settings → Connectors → Add custom connector** → নাম ও এই URL দিন।
5. নতুন চ্যাটে কানেক্টর চালু করে বলুন: "আজকের দোকানের অবস্থা কী?"

### লোকালি পরীক্ষা
`.env.local`-এ `FIREBASE_SERVICE_ACCOUNT` ও `MCP_SECRET` দিয়ে `npm run dev` চালান, তারপর:
```
npx @modelcontextprotocol/inspector
```
Transport: Streamable HTTP, URL: `http://localhost:3000/api/mcp?key=আপনার_MCP_SECRET`

### নিরাপত্তা
- URL-এর `key` পাসওয়ার্ডের মতো। কাউকে দেবেন না। ফাঁস হলে `MCP_SECRET` বদলে নতুন করে ডিপ্লয় করুন।
- Admin SDK Firestore rules এড়িয়ে চলে, তাই সার্ভিস অ্যাকাউন্ট কী খুব গোপন রাখুন।
- রিপোর্টের টুলগুলো সর্বশেষ ১০০০টি অর্ডার পর্যন্ত পড়ে (Firestore-এর ফ্রি পড়ার সীমা বাঁচাতে)।

## অব্যবহৃত ফাইল (ডিলিট করতে পারেন)
`lib/wc.js`, `lib/wp.js`, `lib/shape.js` — এখন ফাঁকা স্টাব।
