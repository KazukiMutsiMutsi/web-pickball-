import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import type { ApiBooking } from '../../services/bookings.service';

const A = '#6366f1';

const SC: Record<string,string> = {
  confirmed:'#2563eb', pending:'#d97706', checked_in:'#16a34a',
  completed:'#475569', cancelled:'#dc2626', no_show:'#dc2626', reschedule_requested:'#7c3aed',
};
const SL: Record<string,string> = {
  confirmed:'Confirmed', pending:'Pending', checked_in:'On Court',
  completed:'Completed', cancelled:'Cancelled', no_show:'No Show', reschedule_requested:'Reschedule',
};

const ic = (d: string, size = 18, color = 'currentColor') => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

interface ApiCourt { id: string; name: string; display_name: string; is_active: boolean; }

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [courts,   setCourts]   = useState<ApiCourt[]>([]);
  const [loading,  setLoading]  = useState(true);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    Promise.all([
      adminService.getBookings(),
      fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:5000'}/api/courts`).then(r => r.json()),
    ])
      .then(([b, { courts: c }]) => { setBookings(b); setCourts(c); })
      .catch(err => console.error('Dashboard load error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading dashboard...</div>;

  const todayB   = bookings.filter(b => b.date === today);
  const revenue  = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').reduce((s, b) => s + Number(b.total_amount), 0);
  const todayRev = todayB.filter(b => b.status === 'confirmed' || b.status === 'completed').reduce((s, b) => s + Number(b.total_amount), 0);
  const pending  = todayB.filter(b => b.status === 'pending').length;
  const active   = courts.filter(c => c.is_active).length;

  const stats = [
    { label:'Total Revenue',    val:`₱${revenue.toLocaleString()}`,  sub:`₱${todayRev.toLocaleString()} today`, accent:'#16a34a', bg:'#f0fdf4', icon: ic('M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6') },
    { label:"Today's Bookings", val:String(todayB.length),            sub:`${pending} pending`,                  accent:'#2563eb', bg:'#eff6ff', icon: ic('M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z') },
    { label:'Total Bookings',   val:String(bookings.length),          sub:'all time',                            accent:'#0284c7', bg:'#f0f9ff', icon: ic('M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z') },
    { label:'Active Courts',    val:`${active} / ${courts.length}`,   sub:'available now',                       accent:'#7c3aed', bg:'#faf5ff', icon: ic('M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5') },
    { label:'Pending Payments', val:String(bookings.filter(b=>b.status==='pending').length), sub:'awaiting confirmation', accent:'#d97706', bg:'#fffbeb', icon: ic('M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75') },
  ];

  const courtRevenue = courts.map(c => ({
    name:     c.display_name ?? c.name,
    revenue:  bookings.filter(b => b.court_id === c.id && (b.status === 'confirmed' || b.status === 'completed')).reduce((s, b) => s + Number(b.total_amount), 0),
    bookings: bookings.filter(b => b.court_id === c.id).length,
    pct:      0,
  }));
  const maxRev = Math.max(...courtRevenue.map(c => c.revenue), 1);
  courtRevenue.forEach(c => { c.pct = Math.round((c.revenue / maxRev) * 100); });

  const recent = [...bookings].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
  const totalBookings  = bookings.length;
  const completedToday = todayB.filter(b => b.status === 'completed').length;

  return (
    <div style={s.page}>
      {/* ── Banner ── */}
      <div style={s.banner}>
        <div style={s.bannerLeft}>
          <div style={s.bannerEyebrow}>Good day, Admin</div>
          <div style={s.bannerTitle}>PicklePro Dashboard</div>
          <div style={s.bannerMeta}>Pajo, Lapu-Lapu City &nbsp;·&nbsp; Full system access</div>
        </div>
        <div style={s.bannerRight}>
          <div style={s.bannerMetrics}>
            <div style={s.bm}>
              <div style={s.bmVal}>₱{todayRev.toLocaleString()}</div>
              <div style={s.bmLbl}>Revenue today</div>
            </div>
            <div style={s.bmDivider} />
            <div style={s.bm}>
              <div style={s.bmVal}>{todayB.length}</div>
              <div style={s.bmLbl}>Bookings today</div>
            </div>
            <div style={s.bmDivider} />
            <div style={s.bm}>
              <div style={s.bmVal}>{completedToday}</div>
              <div style={s.bmLbl}>Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div style={s.kpiGrid}>
        {stats.map(st => (
          <div key={st.label} style={s.kpiCard}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <div style={{ ...s.kpiIcon, background: st.bg, color: st.accent }}>{st.icon}</div>
              <span style={{ ...s.kpiTrend, color: st.accent }}>+</span>
            </div>
            <div style={{ ...s.kpiVal, color: st.accent }}>{st.val}</div>
            <div style={s.kpiLabel}>{st.label}</div>
            <div style={s.kpiSub}>{st.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Two-column ── */}
      <div style={s.twoCol}>
        {/* Recent bookings */}
        <div style={s.card}>
          <div style={s.cardHead}>
            <div>
              <div style={s.cardTitle}>Recent Bookings</div>
              <div style={s.cardSub}>{totalBookings} total bookings on record</div>
            </div>
            <span style={s.viewBadge}>View only</span>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>{['ID','Player','Court','Date','Amount','Status'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {recent.map((b, i) => (
                  <tr key={b.id} style={{ ...s.tr, background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ ...s.td, fontFamily:'monospace', fontSize:11, color:'#94a3b8' }}>{b.booking_ref ?? b.id}</td>
                    <td style={s.td}>
                      <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                        <div style={{ ...s.avatar, background: A + '18', color: A }}>
                          {((b as { profiles?: { display_name?: string } }).profiles?.display_name ?? 'U')[0]}
                        </div>
                        <div>
                          <div style={s.playerName}>{(b as { profiles?: { display_name?: string } }).profiles?.display_name ?? 'Guest'}</div>
                          <div style={s.playerSub}>{b.payment_method ?? 'gcash'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={s.td}>{b.courts?.display_name ?? b.courts?.name ?? 'Court'}</td>
                    <td style={{ ...s.td, color:'#64748b' }}>{b.date}</td>
                    <td style={{ ...s.td, fontWeight:700 }}>₱{Number(b.total_amount).toLocaleString()}</td>
                    <td style={s.td}>
                      <span style={{ ...s.badge, background: SC[b.status]+'18', color: SC[b.status] }}>
                        {SL[b.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revenue by court */}
        <div style={s.card}>
          <div style={s.cardHead}>
            <div>
              <div style={s.cardTitle}>Revenue by Court</div>
              <div style={s.cardSub}>Total: ₱{revenue.toLocaleString()}</div>
            </div>
          </div>
          <div style={s.courtList}>
            {courtRevenue.map(c => (
              <div key={c.name}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>{c.name}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:'#16a34a' }}>₱{c.revenue.toLocaleString()}</span>
                </div>
                <div style={s.barTrack}>
                  <div style={{ ...s.barFill, width:`${c.pct}%` }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                  <span style={{ fontSize:11, color:'#94a3b8' }}>{c.bookings} bookings</span>
                  <span style={{ fontSize:11, color:'#94a3b8' }}>{c.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page:        { display:'flex', flexDirection:'column', gap:24 },
  banner:      { background:'linear-gradient(120deg,#0f0c29,#1a1060,#24243e)', borderRadius:16, padding:'28px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:20, color:'#fff', boxShadow:'0 8px 32px rgba(99,102,241,.2)' },
  bannerLeft:  { display:'flex', flexDirection:'column', gap:6 },
  bannerEyebrow:{ fontSize:11, fontWeight:700, color:'#a5b4fc', letterSpacing:1.5, textTransform:'uppercase' },
  bannerTitle: { fontSize:24, fontWeight:900, color:'#fff', lineHeight:1.1 },
  bannerMeta:  { fontSize:13, color:'#818cf8' },
  bannerRight: {},
  bannerMetrics:{ display:'flex', alignItems:'center', gap:0, background:'rgba(255,255,255,.08)', borderRadius:12, border:'1px solid rgba(255,255,255,.12)', overflow:'hidden' },
  bm:          { padding:'14px 22px', display:'flex', flexDirection:'column', alignItems:'center', gap:3 },
  bmVal:       { fontSize:22, fontWeight:900, color:'#fff' },
  bmLbl:       { fontSize:11, color:'#a5b4fc', fontWeight:600, whiteSpace:'nowrap' },
  bmDivider:   { width:1, height:48, background:'rgba(255,255,255,.12)' },
  kpiGrid:     { display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:16 },
  kpiCard:     { background:'#fff', border:'1px solid #e2e8f0', borderRadius:14, padding:'18px 20px', display:'flex', flexDirection:'column', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' },
  kpiIcon:     { width:38, height:38, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' },
  kpiTrend:    { fontSize:11, fontWeight:700, opacity:.5 },
  kpiVal:      { fontSize:26, fontWeight:900, marginBottom:3 },
  kpiLabel:    { fontSize:12, fontWeight:700, color:'#0f172a' },
  kpiSub:      { fontSize:11, color:'#94a3b8', marginTop:2 },
  twoCol:      { display:'grid', gridTemplateColumns:'1fr 340px', gap:20, alignItems:'start' },
  card:        { background:'#fff', border:'1px solid #e2e8f0', borderRadius:14, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' },
  cardHead:    { padding:'16px 20px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10 },
  cardTitle:   { fontSize:15, fontWeight:700, color:'#0f172a', margin:0 },
  cardSub:     { fontSize:12, color:'#94a3b8', marginTop:3 },
  viewBadge:   { fontSize:11, fontWeight:600, color:'#64748b', background:'#f1f5f9', borderRadius:6, padding:'3px 9px', flexShrink:0, alignSelf:'flex-start' },
  table:       { width:'100%', borderCollapse:'collapse' as const, minWidth:480 },
  th:          { padding:'10px 16px', textAlign:'left' as const, fontSize:10, fontWeight:700, color:'#94a3b8', borderBottom:'1px solid #f1f5f9', background:'#f8fafc', textTransform:'uppercase' as const, letterSpacing:.8 },
  tr:          { borderBottom:'1px solid #f8fafc' },
  td:          { padding:'11px 16px', fontSize:13, color:'#0f172a', verticalAlign:'middle' as const },
  avatar:      { width:30, height:30, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, flexShrink:0 },
  playerName:  { fontWeight:700, fontSize:13 },
  playerSub:   { fontSize:11, color:'#94a3b8' },
  badge:       { display:'inline-block', padding:'3px 9px', borderRadius:99, fontSize:11, fontWeight:700 },
  courtList:   { padding:'20px', display:'flex', flexDirection:'column', gap:20 },
  barTrack:    { background:'#f1f5f9', borderRadius:99, height:7, overflow:'hidden' },
  barFill:     { background:A, height:'100%', borderRadius:99, transition:'width 600ms' },
};
