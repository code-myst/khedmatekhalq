// শুধু সার্ভারে (MCP route) ব্যবহার হয়। ক্লায়েন্ট কম্পোনেন্টে কখনো ইম্পোর্ট করবেন না।
// Admin SDK Firestore rules এড়িয়ে চলে, তাই সার্ভিস অ্যাকাউন্টের JSON গোপন রাখুন।
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

function init() {
  if (getApps().length) return getApps()[0];
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable সেট করা নেই');
  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    // base64 করা JSON-ও চলবে
    json = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  }
  if (json.private_key) json.private_key = json.private_key.replace(/\\n/g, '\n');
  return initializeApp({ credential: cert(json) });
}

export function adminDb() {
  init();
  return getFirestore();
}

export { FieldValue };
