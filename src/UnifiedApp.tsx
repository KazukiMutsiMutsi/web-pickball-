import React, { useState } from 'react';
import { AdminPortal } from './admin/AdminApp';
import { AdminAuthProvider, useAdminAuth } from './admin/context/AdminAuthContext';
import { StaffPortal } from './staff/StaffApp';
import { StaffAuthProvider, useStaffAuth } from './staff/context/StaffAuthContext';
import PickleballIcon from './components/PickleballIcon';

type Role = 'admin' | 'staff';

// ─── Auto-detect role from email ──────────────────────────────────────────────
function detectRole(email: string): Role | null {
  const e = email.trim().toLowerCase();
  if (e === 'admin@picklepro.com') return 'admin';
  if (e === 'staff@picklepro.com') return 'staff';
  return null;
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
function UnifiedLogin({ onSuccess }: { onSuccess: (role: Role) => void }) {
  const adminAuth = useAdminAuth();
  const staffAuth = useStaffAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  // Live-detect role as the user types their email
  const detectedRole = detectRole(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim())    { setError('Email is required.');    return; }
    if (!password.trim()) { setError('Password is required.'); return; }

    const role = detectRole(email);
    if (!role) {
      setError('No account found for this email address.');
      return;
    }

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

  // Accent color reacts live to what the user types
  const accent = detectedRole === 'admin' ? '#7c3aed'
               : detectedRole === 'staff' ? '#16a34a'
               : '#3b82f6';

  return (
    <div style={s.page}>
      <div style={s.card}>

        {/* Brand */}
        <div style={s.brand}>
          <div style={s.brandIconWrap}>
            <PickleballIcon size={44} color="#fff" />
          </div>
          <div style={s.brandName}>PicklePro</div>
          <div style={s.brandTagline}>Pickleball Court Management</div>
        </div>

        {/* Role indicator — appears once email is recognized */}
        <div style={{ ...s.roleChip, opacity: detectedRole ? 1 : 0, background: accent + '22', border: `1px solid ${accent}55` }}>
          {detectedRole === 'admin' && <><span>🔐</span><span style={{ color: accent }}>Admin Portal — Full system access</span></>}
          {detectedRole === 'staff' && <><span>👷</span><span style={{ color: accent }}>Staff Portal — Operations access</span></>}
          {!detectedRole            && <span>‎</span>/* invisible placeholder to hold height */}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate style={s.form}>
          {error && (
            <div style={s.errorBox} role="alert">⚠️ {error}</div>
          )}

          <div style={s.field}>
            <label style={s.label} htmlFor="uni-email">Email address</label>
            <input
              id="uni-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              style={{ ...s.input, borderColor: detectedRole ? accent : '#334155' }}
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <div style={s.field}>
            <label style={s.label} htmlFor="uni-password">Password</label>
            <div style={s.pwWrap}>
              <input
                id="uni-password"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                style={{ ...s.input, paddingRight: 44 }}
                placeholder="Enter your password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                style={s.eyeBtn}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...s.submitBtn, background: accent, opacity: loading ? 0.65 : 1 }}
          >
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>

        {/* Hint */}
        <div style={s.hint}>
          Contact your administrator if you need access.
        </div>
      </div>
    </div>
  );
}

// ─── Root router ──────────────────────────────────────────────────────────────
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

// ─── Styles ───────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  page:        { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', fontFamily: "system-ui, -apple-system, sans-serif", padding: 24 },
  card:        { background: '#1e293b', border: '1px solid #334155', borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 20 },

  brand:       { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  brandIconWrap:{ width: 64, height: 64, borderRadius: 16, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  brandName:   { fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: -0.5 },
  brandTagline:{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: 1.5, textTransform: 'uppercase' },

  roleChip:    { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 8, padding: '9px 14px', fontSize: 12, fontWeight: 600, transition: 'opacity 200ms', minHeight: 38 },

  form:        { display: 'flex', flexDirection: 'column', gap: 16 },
  errorBox:    { background: '#450a0a', border: '1px solid #7f1d1d', color: '#fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontWeight: 500 },
  field:       { display: 'flex', flexDirection: 'column', gap: 6 },
  label:       { fontSize: 12, fontWeight: 700, color: '#94a3b8' },
  input:       { padding: '11px 14px', background: '#0f172a', border: '1.5px solid #334155', borderRadius: 8, color: '#fff', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box', transition: 'border-color 200ms' },
  pwWrap:      { position: 'relative' },
  eyeBtn:      { position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4, color: '#64748b' },
  submitBtn:   { padding: '13px', border: 'none', borderRadius: 10, color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', marginTop: 4, transition: 'background 200ms, opacity 150ms' },

  hint:        { fontSize: 12, color: '#475569', textAlign: 'center' },
};
