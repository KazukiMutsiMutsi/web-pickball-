import React, { useState, useEffect } from 'react';
import { useStaffAuth } from '../context/StaffAuthContext';
import type { StaffPage } from '../types';
import PickleballIcon from '../../components/PickleballIcon';

const NAV_ITEMS: { id: StaffPage; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard',   icon: '⊞'  },
  { id: 'schedule',  label: 'Schedule',    icon: '📅' },
  { id: 'courts',    label: 'Courts',      icon: '🏓' },
  { id: 'checkin',   label: 'Response',    icon: '✅' },
  { id: 'players',   label: 'Players',     icon: '👥' },
];

interface Props {
  page: StaffPage;
  onNavigate: (p: StaffPage) => void;
  children: React.ReactNode;
}

function useWindowWidth() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    const handler = () => setW(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return w;
}

export default function StaffLayout({ page, onNavigate, children }: Props) {
  const { user, logout } = useStaffAuth();
  const [collapsed,    setCollapsed]    = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [now,          setNow]          = useState(new Date());
  const width = useWindowWidth();

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1100;

  // Auto-collapse on tablet, auto-open on desktop
  useEffect(() => {
    if (isTablet) setCollapsed(true);
    if (!isMobile && !isTablet) setCollapsed(false);
  }, [isMobile, isTablet]);

  // Close mobile menu when navigating
  const handleNavigate = (p: StaffPage) => {
    onNavigate(p);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const initials = (user?.name ?? 'ST').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const currentNav = NAV_ITEMS.find((n) => n.id === page);
  const formattedDate = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // ── Mobile layout ─────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc', fontFamily: "system-ui, sans-serif", fontSize: 14, color: '#0f172a' }}>
        {/* Mobile topbar */}
        <header style={mob.topbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <PickleballIcon size={26} color="#0f172a" />
            <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>PicklePro</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={mob.timeBadge}>{now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            <button onClick={() => setMobileMenuOpen(v => !v)} style={mob.hamburger} aria-label="Menu">
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </header>

        {/* Mobile drawer overlay */}
        {mobileMenuOpen && (
          <div style={mob.overlay} onClick={() => setMobileMenuOpen(false)}>
            <div style={mob.drawer} onClick={e => e.stopPropagation()}>
              <div style={mob.drawerHead}>
                <div style={mob.drawerAvatar}>{initials}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{user?.name}</div>
                  <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 }}>Staff</div>
                </div>
              </div>
              <div style={{ height: 1, background: '#1e293b', margin: '0 12px 8px' }} />
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  style={{ ...mob.drawerBtn, ...(page === item.id ? mob.drawerBtnActive : {}) }}
                  aria-current={page === item.id ? 'page' : undefined}
                >
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
              <div style={{ height: 1, background: '#1e293b', margin: '8px 12px' }} />
              <button onClick={logout} style={mob.drawerLogout}>
                <span>⏻</span><span>Sign out</span>
              </button>
            </div>
          </div>
        )}

        {/* Page title bar */}
        <div style={mob.pageTitleBar}>
          <span style={{ fontSize: 16 }}>{currentNav?.icon}</span>
          <span style={{ fontSize: 15, fontWeight: 700 }}>{currentNav?.label}</span>
          <span style={{ fontSize: 11, color: '#64748b', marginLeft: 'auto' }}>{formattedDate}</span>
        </div>

        {/* Content */}
        <main style={{ flex: 1, padding: '16px', paddingBottom: 80, overflowY: 'auto' }} role="main">
          {children}
        </main>

        {/* Bottom nav */}
        <nav style={mob.bottomNav} aria-label="Staff navigation">
          {NAV_ITEMS.map((item) => {
            const active = page === item.id;
            return (
              <button key={item.id} onClick={() => handleNavigate(item.id)}
                style={{ ...mob.bottomBtn, ...(active ? mob.bottomBtnActive : {}) }}
                aria-current={active ? 'page' : undefined}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ fontSize: 9, fontWeight: active ? 700 : 500 }}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  // ── Tablet / Desktop layout ────────────────────────────────────────────────
  return (
    <div style={sh.root}>
      {/* Sidebar */}
      <aside style={{ ...sh.sidebar, width: collapsed ? 60 : 220 }}>
        <div style={sh.brand}>
          <PickleballIcon size={30} color="#fff" />
          {!collapsed && (
            <div>
              <div style={sh.brandName}>PicklePro</div>
              <div style={sh.brandRole}>Staff Portal</div>
            </div>
          )}
        </div>
        <div style={sh.divider} />
        <nav style={sh.nav} aria-label="Staff navigation">
          {NAV_ITEMS.map((item) => {
            const active = page === item.id;
            return (
              <button key={item.id} onClick={() => onNavigate(item.id)}
                style={{ ...sh.navBtn, ...(active ? sh.navBtnActive : {}), justifyContent: collapsed ? 'center' : 'flex-start' }}
                title={collapsed ? item.label : undefined}
                aria-current={active ? 'page' : undefined}
              >
                <span style={sh.navIcon}>{item.icon}</span>
                {!collapsed && <span style={sh.navLabel}>{item.label}</span>}
              </button>
            );
          })}
        </nav>
        <div style={sh.sidebarFooter}>
          <div style={sh.divider} />
          {!collapsed && (
            <div style={sh.userRow}>
              <div style={sh.userAvatar}>{initials}</div>
              <div style={sh.userInfo}>
                <div style={sh.userName}>{user?.name}</div>
                <div style={sh.userRole}>Staff</div>
              </div>
            </div>
          )}
          <button onClick={logout}
            style={{ ...sh.logoutBtn, justifyContent: collapsed ? 'center' : 'flex-start' }}
            title="Sign out" aria-label="Sign out"
          >
            <span>⏻</span>
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
        <button onClick={() => setCollapsed(v => !v)} style={sh.collapseBtn}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </aside>

      {/* Main */}
      <div style={sh.main}>
        <header style={sh.topbar}>
          <div style={sh.topbarLeft}>
            <span style={{ fontSize: 18 }}>{currentNav?.icon}</span>
            <h1 style={sh.pageTitle}>{currentNav?.label}</h1>
            {!isTablet && <span style={sh.datePill}>{formattedDate}</span>}
          </div>
          <div style={sh.topbarRight}>
            <span style={sh.timePill}>{formattedTime}</span>
            {!isTablet && <div style={sh.shiftBadge}>🟢 On Shift</div>}
          </div>
        </header>
        <main style={sh.content} role="main">{children}</main>
      </div>
    </div>
  );
}

// ── Mobile styles ─────────────────────────────────────────────────────────────
const mob: Record<string, React.CSSProperties> = {
  topbar:       { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 40 },
  timeBadge:    { fontSize: 12, fontWeight: 700, fontFamily: 'monospace', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 8px', color: '#0f172a' },
  hamburger:    { background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#0f172a', padding: 4, lineHeight: 1 },
  overlay:      { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex' },
  drawer:       { width: 260, background: '#0f172a', height: '100%', display: 'flex', flexDirection: 'column', padding: '0 0 20px' },
  drawerHead:   { display: 'flex', alignItems: 'center', gap: 12, padding: '20px 16px 16px' },
  drawerAvatar: { width: 36, height: 36, borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, flexShrink: 0 },
  drawerBtn:    { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 14, fontWeight: 500, textAlign: 'left', width: '100%' },
  drawerBtnActive: { background: '#1e293b', color: '#fff', fontWeight: 700 },
  drawerLogout: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', border: 'none', background: 'transparent', color: '#475569', cursor: 'pointer', fontSize: 13, fontWeight: 600, width: '100%' },
  pageTitleBar: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: '#fff', borderBottom: '1px solid #f1f5f9', fontSize: 14, color: '#0f172a' },
  bottomNav:    { position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', zIndex: 40, paddingBottom: 'env(safe-area-inset-bottom)' },
  bottomBtn:    { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, padding: '8px 0', border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer' },
  bottomBtnActive: { color: '#16a34a' },
};

// ── Desktop/tablet styles ─────────────────────────────────────────────────────
const SIDEBAR_BG = '#0f172a';
const SIDEBAR_FG = '#94a3b8';
const ACTIVE_BG  = '#1e293b';
const ACTIVE_FG  = '#ffffff';
const GREEN      = '#16a34a';

const sh: Record<string, React.CSSProperties> = {
  root:         { display: 'flex', minHeight: '100vh', fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", fontSize: 14, color: '#0f172a', background: '#f8fafc' },
  sidebar:      { background: SIDEBAR_BG, display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', overflowX: 'hidden', flexShrink: 0, transition: 'width 180ms ease', zIndex: 20 },
  brand:        { display: 'flex', alignItems: 'center', gap: 10, padding: '20px 14px 16px' },
  brandName:    { fontSize: 15, fontWeight: 800, color: '#fff', lineHeight: 1.2 },
  brandRole:    { fontSize: 10, color: '#475569', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' },
  divider:      { height: 1, background: '#1e293b', margin: '0 12px' },
  nav:          { flex: 1, padding: '8px', display: 'flex', flexDirection: 'column', gap: 2 },
  navBtn:       { display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 10px', border: 'none', borderRadius: 8, background: 'transparent', color: SIDEBAR_FG, cursor: 'pointer', fontSize: 13, fontWeight: 500, textAlign: 'left', whiteSpace: 'nowrap', transition: 'background 140ms, color 140ms' },
  navBtnActive: { background: ACTIVE_BG, color: ACTIVE_FG, fontWeight: 700 },
  navIcon:      { fontSize: 15, flexShrink: 0, width: 20, textAlign: 'center' },
  navLabel:     { overflow: 'hidden', textOverflow: 'ellipsis' },
  sidebarFooter:{ padding: '8px 8px 20px', display: 'flex', flexDirection: 'column', gap: 4 },
  userRow:      { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 10px 6px' },
  userAvatar:   { width: 32, height: 32, borderRadius: '50%', background: GREEN, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 },
  userInfo:     { overflow: 'hidden' },
  userName:     { fontSize: 12, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userRole:     { fontSize: 10, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5 },
  logoutBtn:    { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', border: 'none', borderRadius: 8, background: 'transparent', color: '#475569', cursor: 'pointer', width: '100%', fontSize: 12, fontWeight: 600 },
  collapseBtn:  { position: 'absolute', top: '50%', right: -12, transform: 'translateY(-50%)', width: 24, height: 24, borderRadius: '50%', background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', cursor: 'pointer', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30 },
  main:         { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' },
  topbar:       { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10, gap: 12 },
  topbarLeft:   { display: 'flex', alignItems: 'center', gap: 10 },
  topbarRight:  { display: 'flex', alignItems: 'center', gap: 10 },
  pageTitle:    { fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 },
  datePill:     { fontSize: 12, color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 10px' },
  timePill:     { fontSize: 12, fontWeight: 700, fontFamily: 'monospace', color: '#0f172a', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 10px' },
  shiftBadge:   { fontSize: 12, fontWeight: 700, color: '#15803d', background: '#dcfce7', padding: '4px 12px', borderRadius: 99 },
  content:      { flex: 1, overflowY: 'auto', padding: '24px 28px' },
};
