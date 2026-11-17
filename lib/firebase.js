import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';

// শুধু ক্লায়েন্ট কম্পোনেন্ট থেকে ইম্পোর্ট করুন। সার্ভারের পড়া হয় lib/products.js থেকে (REST)।
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
