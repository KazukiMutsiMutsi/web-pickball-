import React, { useState } from 'react';
import { getAllBookings, getAllCourts } from '@/src/booking/bookingStore';
import type { AdminBooking } from '../types';

const STATUS_COLOR: Record<string, string> = {
  confirmed:'#2563eb', pending:'#d97706', checked_in:'#16a34a',
  completed:'#64748b', cancelled:'#dc2626', no_show:'#dc2626', reschedule_requested:'#7c3aed',
};
const STATUS_LABEL: Record<string, string> = {
  confirmed:'Confirmed', pending:'Pending', checked_in:'On Court',
  completed:'Completed', cancelled:'Cancelled', no_show:'No Show', reschedule_requested:'↻ Reschedule',
};

export default function AdminBookings() {
  const [bookings] = useState<AdminBooking[]>(getAllBookings() as AdminBooking[]);
  const [search,  setSearch]  = useState('');
  const [statusF, setStatusF] = useState('all');
  const [courtF,  setCourtF]  = useState('all');

  const ADMIN_COURTS = getAllCourts();

  const filtered = bookings.filter((b) => {
    if (statusF !== 'all' && b.status !== statusF) return false;
    if (courtF  !== 'all' && b.courtId !== courtF) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!b.playerName.toLowerCase().includes(q) && !b.id.toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date));

  const totalRevenue = filtered.filter(b => b.paid).reduce((s, b) => s + b.amount, 0);

  return (
    <div style={s.page}>
      {/* Toolbar */}
      <div style={s.toolbar}>
        <div style={s.filters}>
          <div style={s.searchWrap}>
            <span>🔍</span>
            <input
              style={s.searchInput}
              placeholder="Search player or ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select style={s.select} value={statusF} onChange={e => setStatusF(e.target.value)}>
            <option value="all">All Statuses</option>
            {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select style={s.select} value={courtF} onChange={e => setCourtF(e.target.value)}>
            <option value="all">All Courts</option>
            {ADMIN_COURTS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <span style={s.pill}>{filtered.length} bookings · ₱{totalRevenue.toLocaleString()} paid</span>
        </div>
        <div style={s.readOnlyBadge}>👁 View only</div>
      </div>

      {/* Table */}
      <div style={s.card}>
        <div style={{ overflowX: 'auto' }}>
          <table style={s.table}>
            <thead>
              <tr>
                {['ID', 'Player', 'Court', 'Date', 'Time', 'Duration', 'Amount', 'Paid', 'Status'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={s.empty}>No bookings match your filters.</td></tr>
              ) : filtered.map((b) => (
                <tr key={b.id} style={s.tr}>
                  <td style={{ ...s.td, fontFamily: 'monospace', fontSize: 11, color: '#94a3b8' }}>{b.id}</td>
                  <td style={s.td}>
                    <div style={{ fontWeight: 700 }}>{b.playerName}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{b.playerPhone}</div>
                  </td>
                  <td style={s.td}>{b.courtName}</td>
                  <td style={s.td}>{b.date}</td>
                  <td style={{ ...s.td, whiteSpace: 'nowrap' as const }}>{b.startTime} – {b.endTime}</td>
                  <td style={{ ...s.td, textAlign: 'center' as const }}>{b.durationHrs}hr</td>
                  <td style={{ ...s.td, fontWeight: 700 }}>₱{b.amount.toLocaleString()}</td>
                  <td style={s.td}>
                    <span style={b.paid ? s.paid : s.unpaid}>{b.paid ? '✓ Paid' : 'Unpaid'}</span>
                  </td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, background: STATUS_COLOR[b.status] + '18', color: STATUS_COLOR[b.status] }}>
                      {STATUS_LABEL[b.status]}
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

const s: Record<string, React.CSSProperties> = {
  page:         { display: 'flex', flexDirection: 'column', gap: 16 },
  toolbar:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  filters:      { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  searchWrap:   { display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '0 12px' },
  searchInput:  { padding: '9px 0', border: 'none', outline: 'none', fontSize: 13, color: '#0f172a', background: 'transparent', minWidth: 200 },
  select:       { padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#0f172a', background: '#fff', outline: 'none', cursor: 'pointer' },
  pill:         { fontSize: 13, color: '#94a3b8', fontWeight: 600 },
  readOnlyBadge:{ fontSize: 12, fontWeight: 700, color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 12px' },
  card:         { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' },
  table:        { width: '100%', borderCollapse: 'collapse' as const, minWidth: 860 },
  th:           { padding: '10px 16px', textAlign: 'left' as const, fontSize: 11, fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', textTransform: 'uppercase' as const, letterSpacing: 0.5, whiteSpace: 'nowrap' as const },
  tr:           { borderBottom: '1px solid #f1f5f9' },
  td:           { padding: '12px 16px', fontSize: 13, color: '#0f172a', verticalAlign: 'middle' as const },
  empty:        { padding: '32px', textAlign: 'center' as const, color: '#94a3b8' },
  badge:        { display: 'inline-block', padding: '2px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700 },
  paid:         { display: 'inline-block', padding: '2px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: '#dcfce7', color: '#15803d' },
  unpaid:       { display: 'inline-block', padding: '2px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: '#fef3c7', color: '#b45309' },
};
