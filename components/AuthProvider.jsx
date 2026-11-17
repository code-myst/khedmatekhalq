'use client';
import { createContext, useContext, useEffect, useReducer, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { COL } from '@/lib/firebaseConfig';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function authError(e) {
  const map = {
    'auth/invalid-credential': 'ইমেইল বা পাসওয়ার্ড ঠিক নয়।',
    'auth/wrong-password': 'ইমেইল বা পাসওয়ার্ড ঠিক নয়।',
    'auth/user-not-found': 'ইমেইল বা পাসওয়ার্ড ঠিক নয়।',
    'auth/invalid-email': 'ইমেইল ঠিকমতো লিখুন।',
    'auth/email-already-in-use': 'এই ইমেইলে আগেই অ্যাকাউন্ট আছে। লগইন করুন।',
    'auth/weak-password': 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের দিন।',
    'auth/too-many-requests': 'অনেকবার চেষ্টা হয়েছে, একটু পরে আবার চেষ্টা করুন।',
    'auth/network-request-failed': 'ইন্টারনেট সংযোগ দেখুন।',
    'auth/operation-not-allowed': 'Firebase Console-এ Email/Password সাইন-ইন চালু করুন।',
  };
  return map[e?.code] || 'কিছু একটা ভুল হয়েছে, আবার চেষ্টা করুন।';
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [, refresh] = useReducer((x) => x + 1, 0);

  useEffect(
    () =>
      onAuthStateChanged(auth, async (u) => {
        setUser(u);
        if (u) {
          try {
            const s = await getDoc(doc(db, COL.admins, u.uid));
            setIsAdmin(s.exists());
          } catch {
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      }),
    []
  );

  const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const signUp = async (name, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      await updateProfile(cred.user, { displayName: name });
      refresh();
    }
    return cred;
  };
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);
  const logout = () => signOut(auth);

  return (
    <Ctx.Provider value={{ user, isAdmin, loading, signIn, signUp, resetPassword, logout }}>{children}</Ctx.Provider>
  );
}
