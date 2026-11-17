'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, authError } from '@/components/AuthProvider';

const safeNext = () => {
  const n = new URLSearchParams(window.location.search).get('next') || '/account';
  return n.startsWith('/') && !n.startsWith('//') ? n : '/account';
};

export default function Login() {
  const { user, loading, signIn, signUp, resetPassword } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState('login'); // login | signup | reset
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  useEffect(() => {
    if (!loading && user) router.replace(safeNext());
  }, [loading, user, router]);

  const go = (m) => { setMode(m); setErr(''); setOk(''); };

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setOk(''); setBusy(true);
    try {
      if (mode === 'login') await signIn(f.email.trim(), f.password);
      else if (mode === 'signup') await signUp(f.name.trim(), f.email.trim(), f.password);
      else {
        await resetPassword(f.email.trim());
        setOk('পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে।');
      }
    } catch (x) {
      setErr(authError(x));
    }
    setBusy(false);
  };

  return (
    <div className="wrap">
      <div className="auth-box">
        <h1>{mode === 'login' ? 'লগইন' : mode === 'signup' ? 'নতুন অ্যাকাউন্ট' : 'পাসওয়ার্ড রিসেট'}</h1>
        <form className="contact-form" onSubmit={submit}>
          {mode === 'signup' && (
            <label>আপনার নাম<input required value={f.name} onChange={set('name')} autoComplete="name" /></label>
          )}
          <label>ইমেইল<input required type="email" value={f.email} onChange={set('email')} autoComplete="email" /></label>
          {mode !== 'reset' && (
            <label>
              পাসওয়ার্ড
              <input
                required
                type="password"
                minLength={6}
                value={f.password}
                onChange={set('password')}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </label>
          )}
          {err && <p className="form-err">{err}</p>}
          {ok && <p className="form-ok">{ok}</p>}
          <button className="btn" type="submit" disabled={busy}>
            {busy ? 'অপেক্ষা করুন...' : mode === 'login' ? 'লগইন করুন' : mode === 'signup' ? 'অ্যাকাউন্ট খুলুন' : 'রিসেট লিংক পাঠান'}
          </button>
        </form>
        <p className="auth-alt">
          {mode === 'login' && (
            <>
              <button className="link-btn" onClick={() => go('signup')}>নতুন অ্যাকাউন্ট খুলুন</button>
              {' · '}
              <button className="link-btn" onClick={() => go('reset')}>পাসওয়ার্ড ভুলে গেছেন?</button>
            </>
          )}
          {mode !== 'login' && <button className="link-btn" onClick={() => go('login')}>লগইনে ফিরে যান</button>}
        </p>
      </div>
    </div>
  );
}
