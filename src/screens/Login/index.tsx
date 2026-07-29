import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim())    { setError('Email is required.');    return; }
    if (!password.trim()) { setError('Password is required.'); return; }
    setLoading(true);
    try {
      await login({ email: email.trim(), password });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.title}>Welcome back</h1>
        <p style={s.sub}>Sign in to your account</p>

        {error && (
          <div style={s.error} role="alert">{error}</div>
        )}

        <form onSubmit={handleLogin} noValidate style={s.form}>
          <div style={s.field}>
            <label style={s.label} htmlFor="login-email">Email</label>
            <input
              id="login-email" type="email" value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              style={s.input} placeholder="you@email.com"
              autoComplete="email" disabled={loading}
            />
          </div>

          <div style={s.field}>
            <label style={s.label} htmlFor="login-pw">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-pw" type={showPw ? 'text' : 'password'} value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                style={{ ...s.input, paddingRight: 44 }} placeholder="••••••••"
                autoComplete="current-password" disabled={loading}
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                style={s.eyeBtn} aria-label={showPw ? 'Hide password' : 'Show password'}>
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in…' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page:   { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'system-ui, sans-serif', padding: 24 },
  card:   { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '40px 36px', width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 16 },
  title:  { fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 },
  sub:    { fontSize: 14, color: '#64748b', margin: 0 },
  error:  { background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 8, padding: '10px 14px', fontSize: 13 },
  form:   { display: 'flex', flexDirection: 'column', gap: 14 },
  field:  { display: 'flex', flexDirection: 'column', gap: 6 },
  label:  { fontSize: 13, fontWeight: 600, color: '#374151' },
  input:  { padding: '11px 14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' },
  eyeBtn: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 },
  btn:    { padding: '13px', background: '#3b82f6', border: 'none', borderRadius: 8, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 4 },
};
