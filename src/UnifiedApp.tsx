import React, { useState } from 'react';
import { AdminPortal } from './admin/AdminApp';
import { AdminAuthProvider, useAdminAuth } from './admin/context/AdminAuthContext';
import { StaffPortal } from './staff/StaffApp';
import { StaffAuthProvider, useStaffAuth } from './staff/context/StaffAuthContext';

// ─── Role type ────────────────────────────────────────────────────────────────
type Role = 'admin' | 'staff';

// ─── Unified Login Screen ─────────────────────────────────────────────────────
function UnifiedLogin({ onSuccess }: { onSuccess: (role: Role) => void }) {
  const adminAuth = useAdminAuth();
  const staffAuth = useStaffAuth();

  const [role,     setRole]     = useState<Role>('admin');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const DEMO = role === 'admin'
    ? { email: 'admin@picklepro.com', password: 'admin123' }
    : { email: 'staff@picklepro.com', password: 'staff123' };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim())    { setError('Email is required.');    return; }
    if (!password.trim()) { setError('Password is required.'); return; }

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

  const switchRole = (r: Role) => {
    setRole(r);
    setEmail('');
    setPassword('');
    setError('');
  };

  const accent = role === 'admin' ? '#7c3aed' : '#16a34a';

  return (
    <div style={s.page}>
      <div style={s.card}>

        {/* Brand */}
        <div style={s.brand}>
          <span style={s.brandIcon}>🏓</span>
          <div style={s.brandName}>PicklePro</div>
          <div style={s.brandTagline}>Pickleball Court Management</div>
        </div>

        {/* Role Toggle */}
        <div style={s.toggleWrap}>
          <button
            style={{ ...s.toggleBtn, ...(role === 'admin' ? { ...s.toggleBtnActive, background: '#7c3aed' } : {}) }}
            onClick={() => switchRole('admin')}
            type="button"
          >
            🔐 Admin
          </button>
          <button
            style={{ ...s.toggleBtn, ...(role === 'staff' ? { ...s.toggleBtnActive, background: '#16a34a' } : {}) }}
            onClick={() => switchRole('staff')}
            type="button"
          >
            👷 Staff
          </button>
        </div>

        {/* Role label */}
        <div style={{ ...s.roleLabel, color: accent }}>
          {role === 'admin' ? 'Admin Portal — Full system access' : 'Staff Portal — Operations access'}
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
              style={s.input}
              placeholder={DEMO.email}
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
            {loading ? 'Signing in…' : `Sign in as ${role === 'admin' ? 'Admin' : 'Staff'} →`}
          </button>
        </form>

        {/* Demo credentials */}
        <div style={s.demoBox}>
          <span style={s.demoLabel}>Demo credentials</span>
          <div style={s.demoCreds}>
            <code style={s.code}>{DEMO.email}</code>
            <span style={s.demoSlash}>/</span>
            <code style={s.code}>{DEMO.password}</code>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Root app ─────────────────────────────────────────────────────────────────
function AppRouter() {
  const adminAuth = useAdminAuth();
  const staffAuth = useStaffAuth();
  const [activeRole, setActiveRole] = useState<Role | null>(null);

  // If a portal is authenticated, show it
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
  brandIcon:   { fontSize: 48 },
  brandName:   { fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: -0.5 },
  brandTagline:{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: 1.5, textTransform: 'uppercase' },

  toggleWrap:      { display: 'flex', background: '#0f172a', borderRadius: 10, padding: 4, gap: 4 },
  toggleBtn:       { flex: 1, padding: '10px', border: 'none', borderRadius: 8, background: 'transparent', color: '#64748b', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 150ms' },
  toggleBtnActive: { color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' },

  roleLabel: { fontSize: 12, fontWeight: 600, textAlign: 'center', marginTop: -6 },

  form:      { display: 'flex', flexDirection: 'column', gap: 16 },
  errorBox:  { background: '#450a0a', border: '1px solid #7f1d1d', color: '#fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontWeight: 500 },
  field:     { display: 'flex', flexDirection: 'column', gap: 6 },
  label:     { fontSize: 12, fontWeight: 700, color: '#94a3b8' },
  input:     { padding: '11px 14px', background: '#0f172a', border: '1.5px solid #334155', borderRadius: 8, color: '#fff', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' },
  pwWrap:    { position: 'relative' },
  eyeBtn:    { position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4, color: '#64748b' },
  submitBtn: { padding: '13px', border: 'none', borderRadius: 10, color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', marginTop: 4, transition: 'opacity 150ms' },

  demoBox:   { background: '#0f172a', borderRadius: 10, padding: '12px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  demoLabel: { fontSize: 10, color: '#475569', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' },
  demoCreds: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
  demoSlash: { color: '#334155', fontSize: 12 },
  code:      { background: '#1e293b', color: '#94a3b8', padding: '3px 8px', borderRadius: 5, fontFamily: 'monospace', fontSize: 12, border: '1px solid #334155' },
};
