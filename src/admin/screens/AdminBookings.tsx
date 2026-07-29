import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import type { ApiBooking } from '../../services/bookings.service';
import type { AdminBooking } from '../types';

const A = '#6366f1';

const SC: Record<string,string> = {
  confirmed:'#2563eb', pending:'#d97706', checked_in:'#16a34a',
  completed:'#475569', cancelled:'#dc2626', no_show:'#dc2626', reschedule_requested:'#7c3aed',
};
const SL: Record<string,string> = {
  confirmed:'Confirmed', pending:'Pending', checked_in:'On Court',
  completed:'Completed', cancelled:'Cancelled', no_show:'No Show', reschedule_requested:'Reschedule',
};

function SearchIcon() {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" /></svg>;
}

function mapBooking(b: ApiBooking): AdminBooking {
  return {
    id:           b.id,
    playerName:   (b as { profiles?: { display_name: string } }).profiles?.display_name ?? 'Guest',
    playerPhone:  '',
    courtId:      b.court_id,
    courtName:    b.courts?.display_name ?? b.courts?.name ?? 'Court',
    date:         b.date,
    startTime:    b.start_slot,
    endTime:      b.end_slot,
    durationHrs:  b.duration_hours,
    amount:       Number(b.total_amount),
    paid:         b.status === 'confirmed' || b.status === 'completed',
    status:       b.status as AdminBooking['status'],
  };
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [courts,   setCourts]   = useState<{ id: string; name: string }[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [statusF,  setStatusF]  = useState('all');
  const [courtF,   setCourtF]   = useState('all');

  useEffect(() => {
    Promise.all([
      adminService.getBookings(),
      fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:5000'}/api/courts`).then(r => r.json()),
    ])
      .then(([b, { courts: c }]) => {
        setBookings(b.map(mapBooking));
        setCourts(c.map((ct: { id: string; name: string }) => ({ id: ct.id, name: ct.name })));
      })
      .catch(err => console.error('Failed to load bookings:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading bookings...</div>;

  const filtered = bookings.filter(b => {
    if (statusF !== 'all' && b.status !== statusF) return false;
    if (courtF  !== 'all' && b.courtId !== courtF) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!b.playerName.toLowerCase().includes(q) && !b.id.toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date));

  const paid    = filtered.filter(b => b.paid);
  const unpaid  = filtered.filter(b => !b.paid);
  const paidRev = paid.reduce((s, b) => s + b.amount, 0);

  return (
    <div style={s.page}>
      {/* Summary strip */}
      <div style={s.summaryStrip}>
        <SummaryPill label="Total" val={filtered.length} color="#0f172a" />
        <SummaryPill label="Paid" val={paid.length} color="#15803d" />
        <SummaryPill label="Unpaid" val={unpaid.length} color="#b45309" />
        <SummaryPill label="Revenue collected" val={`₱${paidRev.toLocaleString()}`} color={A} />
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6, fontSize:11, fontWeight:700, color:'#64748b', background:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:7, padding:'4px 10px' }}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></svg>
          View only
        </div>
      </div>

      {/* Toolbar */}
      <div style={s.toolbar}>
        <div style={s.searchBox}>
          <SearchIcon />
          <input style={s.searchInput} placeholder="Search player name or booking ID..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={s.filters}>
          <select style={s.select} value={statusF} onChange={e => setStatusF(e.target.value)}>
            <option value="all">All Statuses</option>
            {Object.entries(SL).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select style={s.select} value={courtF} onChange={e => setCourtF(e.target.value)}>
            <option value="all">All Courts</option>
            {courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={s.card}>
        <div style={{ overflowX:'auto' }}>
          <table style={s.table}>
            <thead>
              <tr>{['ID','Player','Court','Date','Time','Duration','Amount','Payment','Status'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={s.empty}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                    <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" /></svg>
                    <span>No bookings match your filters</span>
                  </div>
                </td></tr>
              ) : filtered.map((b, i) => (
                <tr key={b.id} style={{ ...s.tr, background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ ...s.td, fontFamily:'monospace', fontSize:11, color:'#94a3b8' }}>{b.id}</td>
                  <td style={s.td}>
                    <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                      <div style={{ ...s.avatar, background: A+'18', color: A }}>{b.playerName[0]}</div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:13 }}>{b.playerName}</div>
                        <div style={{ fontSize:11, color:'#94a3b8' }}>{b.playerPhone}</div>
                      </div>
                    </div>
                  </td>
                  <td style={s.td}>{b.courtName}</td>
                  <td style={{ ...s.td, color:'#64748b' }}>{b.date}</td>
                  <td style={{ ...s.td, whiteSpace:'nowrap' as const, color:'#64748b' }}>{b.startTime} – {b.endTime}</td>
                  <td style={{ ...s.td, textAlign:'center' as const }}>{b.durationHrs}h</td>
                  <td style={{ ...s.td, fontWeight:700 }}>₱{b.amount.toLocaleString()}</td>
                  <td style={s.td}>
                    <span style={b.paid ? s.paid : s.unpaid}>{b.paid ? 'Paid' : 'Unpaid'}</span>
                  </td>
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
    </div>
  );
}

function SummaryPill({ label, val, color }: { label: string; val: string | number; color: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      <span style={{ fontSize:18, fontWeight:900, color }}>{val}</span>
      <span style={{ fontSize:12, color:'#94a3b8', fontWeight:500 }}>{label}</span>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page:        { display:'flex', flexDirection:'column', gap:16 },
  summaryStrip:{ display:'flex', alignItems:'center', gap:24, background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, padding:'14px 20px', flexWrap:'wrap' },
  toolbar:     { display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' },
  searchBox:   { display:'flex', alignItems:'center', gap:8, background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:9, padding:'0 14px', height:40, flex:1, minWidth:240 },
  searchInput: { border:'none', outline:'none', fontSize:13, color:'#0f172a', background:'transparent', width:'100%' },
  filters:     { display:'flex', gap:10 },
  select:      { height:40, padding:'0 12px', border:'1.5px solid #e2e8f0', borderRadius:9, fontSize:13, color:'#0f172a', background:'#fff', outline:'none', cursor:'pointer' },
  card:        { background:'#fff', border:'1px solid #e2e8f0', borderRadius:14, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' },
  table:       { width:'100%', borderCollapse:'collapse' as const, minWidth:860 },
  th:          { padding:'11px 16px', textAlign:'left' as const, fontSize:10, fontWeight:700, color:'#94a3b8', borderBottom:'1px solid #f1f5f9', background:'#f8fafc', textTransform:'uppercase' as const, letterSpacing:.8, whiteSpace:'nowrap' as const },
  tr:          { borderBottom:'1px solid #f8fafc' },
  td:          { padding:'12px 16px', fontSize:13, color:'#0f172a', verticalAlign:'middle' as const },
  avatar:      { width:30, height:30, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, flexShrink:0 },
  empty:       { padding:48, textAlign:'center' as const, color:'#94a3b8', fontSize:13 },
  badge:       { display:'inline-block', padding:'3px 9px', borderRadius:99, fontSize:11, fontWeight:700 },
  paid:        { display:'inline-block', padding:'3px 9px', borderRadius:99, fontSize:11, fontWeight:700, background:'#dcfce7', color:'#15803d' },
  unpaid:      { display:'inline-block', padding:'3px 9px', borderRadius:99, fontSize:11, fontWeight:700, background:'#fef3c7', color:'#b45309' },
};
