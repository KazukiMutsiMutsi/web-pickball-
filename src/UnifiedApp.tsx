import React, { useState } from 'react';
import { AdminPortal } from './admin/AdminApp';
import { AdminAuthProvider, useAdminAuth } from './admin/context/AdminAuthContext';
import { StaffPortal } from './staff/StaffApp';
import { StaffAuthProvider, useStaffAuth } from './staff/context/StaffAuthContext';

type Role = 'admin' | 'staff';

function detectRole(email: string): Role | null {
  const e = email.trim().toLowerCase();
  // Staff emails are known fixed accounts
  if (e === 'staff@picklepro.com') return 'staff';
  // Any other email → try admin login (Supabase will reject if not admin)
  if (e.length > 0) return 'admin';
  return null;
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function LogoIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );
}
function ShieldIcon({ color }: { color: string }) {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function UserCheckIcon({ color }: { color: string }) {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  );
}
function AlertCircleIcon() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
    </svg>
  );
}
function Spin() {
  return (
    <>
      <style>{`@keyframes _uspin{to{transform:rotate(360deg)}}`}</style>
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"
        style={{ animation: '_uspin .8s linear infinite', marginRight: 8, flexShrink: 0 }}>
        <path d="M21 12a9 9 0 11-6.22-8.56" />
      </svg>
    </>
  );
}

// ── Login Screen ──────────────────────────────────────────────────────────────
function UnifiedLogin({ onSuccess }: { onSuccess: (role: Role) => void }) {
  const adminAuth = useAdminAuth();
  const staffAuth = useStaffAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const detectedRole = detectRole(email);

  const accent = detectedRole === 'admin' ? '#6366f1'
               : detectedRole === 'staff' ? '#10b981'
               : '#3b82f6';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim())    { setError('Email is required.');    return; }
    if (!password.trim()) { setError('Password is required.'); return; }

    const role = detectRole(email);
    if (!role) { setError('No account found for this email address.'); return; }

    setLoading(true);
    try {
      if (role === 'admin') {
        const err = await adminAuth.login(email.trim(), password);
        if (err) { setError(err); return; }
      } else {
        await staffAuth.login(email.trim(), password);
      }
      onSuccess(role);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={{ ...s.blob, top: -120, left: -80, background: `radial-gradient(circle,${accent}28 0%,transparent 70%)`, transition: 'background 400ms' }} aria-hidden="true" />
      <div style={{ ...s.blob, bottom: -100, right: -60, background: `radial-gradient(circle,${accent}18 0%,transparent 70%)`, transition: 'background 400ms' }} aria-hidden="true" />

      <div style={s.wrap}>
        {/* Brand */}
        <div style={s.brand}>
          <div style={{ ...s.mark, background: accent, transition: 'background 400ms' }}>
            <LogoIcon />
          </div>
          <span style={s.brandName}>PicklePro</span>
        </div>

        {/* Card */}
        <div style={s.card}>
          {/* Header */}
          <div style={s.cardHead}>
            <h1 style={s.title}>Welcome back</h1>
            <p style={s.sub}>Sign in to continue to your portal</p>
          </div>

          {/* Role chip — animates in when role is detected */}
          <div style={{
            ...s.roleChip,
            opacity: detectedRole ? 1 : 0,
            pointerEvents: detectedRole ? 'auto' : 'none',
            background: accent + '18',
            border: `1px solid ${accent}40`,
            transition: 'opacity 250ms, background 400ms, border-color 400ms',
          }}>
            {detectedRole === 'admin' && (
              <><ShieldIcon color={accent} /><span style={{ color: accent, fontSize: 12, fontWeight: 600 }}>Admin Portal — Full system access</span></>
            )}
            {detectedRole === 'staff' && (
              <><UserCheckIcon color={accent} /><span style={{ color: accent, fontSize: 12, fontWeight: 600 }}>Staff Portal — Operations access</span></>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={s.errBox} role="alert">
              <AlertCircleIcon />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate style={s.form}>
            <div style={s.field}>
              <label style={s.label} htmlFor="uni-email">Email address</label>
              <input
                id="uni-email" type="email" autoComplete="email" value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                style={{ ...s.input, borderColor: detectedRole ? accent + '80' : 'rgba(255,255,255,.1)', transition: 'border-color 300ms' }}
                placeholder="Enter your email" disabled={loading}
              />
            </div>

            <div style={s.field}>
              <label style={s.label} htmlFor="uni-pw">Password</label>
              <div style={s.pwRow}>
                <input
                  id="uni-pw" type={showPw ? 'text' : 'password'} autoComplete="current-password" value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  style={{ ...s.input, paddingRight: 44 }}
                  placeholder="Enter your password" disabled={loading}
                />
                <button type="button" onClick={() => setShowPw(v => !v)} style={s.eyeBtn} aria-label={showPw ? 'Hide password' : 'Show password'}>
                  {showPw ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              style={{ ...s.btn, background: accent, boxShadow: `0 4px 20px ${accent}40`, opacity: loading ? .75 : 1, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 400ms, box-shadow 400ms' }}
            >
              {loading ? <><Spin />Signing in…</> : 'Sign in'}
            </button>
          </form>

          {/* Hint */}
          <p style={s.hint}>Contact your administrator if you need access.</p>
        </div>

        <p style={s.footer}>PicklePro &copy; {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}

// ── Root router ───────────────────────────────────────────────────────────────
function AppRouter() {
  const adminAuth = useAdminAuth();
  const staffAuth = useStaffAuth();
  const [activeRole, setActiveRole] = useState<Role | null>(null);

  if (activeRole === 'admin' && adminAuth.isAuthenticated) return <AdminPortal />;
  if (activeRole === 'staff' && staffAuth.isAuthenticated) return <StaffPortal />;

  return <UnifiedLogin onSuccess={setActiveRole} />;
}

export default function UnifiedApp() {
  return (
    <AdminAuthProvider>
      <StaffAuthProvider>
        <AppRouter />
      </StaffAuthProvider>
    </AdminAuthProvider>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  page:     { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #060a14 0%, #0a1020 50%, #070c1a 100%)', fontFamily: 'system-ui,sans-serif', padding: '24px 16px', position: 'relative', overflow: 'hidden' },
  blob:     { position: 'absolute', width: 520, height: 520, borderRadius: '50%', pointerEvents: 'none' },
  wrap:     { position: 'relative', zIndex: 1, width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 },
  brand:    { display: 'flex', alignItems: 'center', gap: 10 },
  mark:     { width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  brandName:{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-.3px' },
  card:     { width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 20, padding: '36px 36px 28px', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', gap: 18, boxShadow: '0 24px 64px rgba(0,0,0,.5)' },
  cardHead: { display: 'flex', flexDirection: 'column', gap: 4 },
  title:    { fontSize: 22, fontWeight: 800, color: '#f8fafc', margin: 0, lineHeight: 1.2 },
  sub:      { fontSize: 13, color: '#64748b', margin: 0 },
  roleChip: { display: 'flex', alignItems: 'center', gap: 7, borderRadius: 9, padding: '9px 12px', minHeight: 36 },
  errBox:   { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(220,38,38,.1)', border: '1px solid rgba(220,38,38,.3)', color: '#fca5a5', borderRadius: 10, padding: '10px 14px', fontSize: 13 },
  form:     { display: 'flex', flexDirection: 'column', gap: 14 },
  field:    { display: 'flex', flexDirection: 'column', gap: 6 },
  label:    { fontSize: 12, fontWeight: 600, color: '#94a3b8' },
  pwRow:    { position: 'relative' },
  input:    { width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,.05)', border: '1px solid', borderRadius: 10, color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box' },
  eyeBtn:   { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4 },
  btn:      { width: '100%', padding: '13px', border: 'none', borderRadius: 10, color: '#fff', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  hint:     { fontSize: 12, color: '#334155', textAlign: 'center', margin: 0 },
  footer:   { fontSize: 12, color: '#1e293b', textAlign: 'center' },
};
