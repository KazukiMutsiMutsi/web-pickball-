import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import type { AdminCourt as ApiAdminCourt } from '../../services/admin.service';
import type { AdminCourt } from '../types';

const A = '#6366f1';
const EMPTY: Partial<AdminCourt> = { name:'', location:'', type:'Indoor', pricePerHour:210, active:true };

function mapCourt(c: ApiAdminCourt): AdminCourt {
  return {
    id:           c.id,
    name:         c.display_name ?? c.name,
    location:     c.location,
    type:         (c.sport === 'outdoor' ? 'Outdoor' : 'Indoor') as AdminCourt['type'],
    pricePerHour: Number(c.hourly_rate),
    active:       c.is_active,
  };
}

/* ── Inline icons ─────────────────────────────────────────────────────────── */
const ic = (d: string, size = 14, color = 'currentColor') => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);
const PlusIcon  = () => ic('M12 5v14M5 12h14', 14, '#fff');
const EditIcon  = () => ic('M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z');
const LockIcon  = () => ic('M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4');
const UnlockIcon= () => ic('M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 019.9-1');
const TrashIcon = () => ic('M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6');
const PinIcon   = () => ic('M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0zM12 13a3 3 0 100-6 3 3 0 000 6z');

export default function AdminCourts() {
  const [courts,    setCourts]    = useState<AdminCourt[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [editing,   setEditing]   = useState<AdminCourt | null>(null);
  const [form,      setForm]      = useState<Partial<AdminCourt>>({});
  const [adding,    setAdding]    = useState(false);
  const [addForm,   setAddForm]   = useState<Partial<AdminCourt>>({ ...EMPTY });
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [prices,    setPrices]    = useState<Record<string,string>>({});

  const loadCourts = () => {
    adminService.getCourts()
      .then(list => {
        const mapped = list.map(mapCourt);
        setCourts(mapped);
        setPrices(Object.fromEntries(mapped.map(c => [c.id, String(c.pricePerHour)])));
      })
      .catch(err => console.error('Failed to load courts:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCourts(); }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading courts...</div>;

  const openEdit   = (c: AdminCourt) => { setEditing(c); setForm({ ...c }); };
  const closeEdit  = () => { setEditing(null); setForm({}); };

  const saveEdit = async () => {
    if (!editing) return;
    await adminService.updateCourt(editing.id, {
      displayName: form.name,
      location:    form.location,
      hourlyRate:  form.pricePerHour,
      isActive:    form.active,
    });
    loadCourts(); closeEdit();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await adminService.updateCourt(id, { isActive: !current });
    loadCourts();
  };

  const handlePriceChange = (id: string, raw: string) => {
    if (raw !== '' && !/^\d+$/.test(raw)) return;
    setPrices(p => ({ ...p, [id]: raw }));
    const val = Number(raw);
    if (val > 0) adminService.updateCourt(id, { hourlyRate: val }).then(loadCourts);
  };

  const handleAdd = async () => {
    if (!addForm.name?.trim()) return;
    await adminService.createCourt({
      name:        addForm.name.trim().toLowerCase().replace(/\s+/g, '_'),
      displayName: addForm.name.trim(),
      sport:       'pickleball',
      location:    addForm.location?.trim() || 'Pajo, Lapu-Lapu City',
      hourlyRate:  Number(addForm.pricePerHour) || 210,
    });
    loadCourts(); setAdding(false); setAddForm({ ...EMPTY });
  };

  const handleDelete = async (id: string) => {
    await adminService.deleteCourt(id);
    loadCourts(); setConfirmId(null);
  };

  const openCourts = courts.filter(c => c.active).length;

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.pageHead}>
        <div>
          <h2 style={s.pageTitle}>Courts</h2>
          <p style={s.pageSub}>{courts.length} courts &nbsp;·&nbsp; {openCourts} open</p>
        </div>
        <button style={s.btnAdd} onClick={() => setAdding(true)}>
          <PlusIcon /> Add Court
        </button>
      </div>

      {/* Grid */}
      <div style={s.grid}>
        {courts.map(c => {
          return (
            <div key={c.id} style={{ ...s.card, opacity: c.active ? 1 : 0.65 }}>
              {/* Status bar */}
              <div style={{ ...s.statusBar, background: c.active ? '#16a34a' : '#94a3b8' }} />

              <div style={s.cardBody}>
                {/* Top row */}
                <div style={s.cardTop}>
                  <div style={s.courtTitle}>
                    <div style={s.courtName}>{c.name}</div>
                    <div style={{ display:'flex', gap:6, marginTop:4 }}>
                      <span style={s.typePill}>{c.type}</span>
                      <span style={{ ...s.statusPill, background: c.active ? '#dcfce7' : '#f1f5f9', color: c.active ? '#15803d' : '#64748b' }}>
                        {c.active ? 'Open' : 'Closed'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location + price */}
                <div style={s.metaBlock}>
                  <div style={s.metaRow}>
                    <PinIcon />
                    <span style={s.metaText}>{c.location || 'No location set'}</span>
                  </div>
                  <div style={s.metaRow}>
                    <span style={s.priceLabel}>Rate</span>
                    <div style={s.priceWrap}>
                      <span style={s.pesoSign}>₱</span>
                      <input
                        type="text" inputMode="numeric"
                        value={prices[c.id] ?? String(c.pricePerHour)}
                        onChange={e => handlePriceChange(c.id, e.target.value)}
                        style={s.priceInput}
                        aria-label={`Price per hour for ${c.name}`}
                      />
                      <span style={s.perHr}>/hr</span>
                    </div>
                  </div>
                </div>

                {/* Stats — real booking counts removed (use AdminBookings for that) */}
                <div style={s.statsRow}>
                  <div style={s.stat}>
                    <div style={s.statNum}>₱{c.pricePerHour}/hr</div>
                    <div style={s.statLbl}>Rate</div>
                  </div>
                  <div style={s.statLine} />
                  <div style={s.stat}>
                    <div style={{ ...s.statNum, color: c.active ? '#16a34a' : '#94a3b8' }}>{c.active ? 'Open' : 'Closed'}</div>
                    <div style={s.statLbl}>Status</div>
                  </div>
                </div>

                {/* Actions */}
                <div style={s.actions}>
                  <button style={s.btnEdit} onClick={() => openEdit(c)}>
                    <EditIcon /> Edit
                  </button>
                  <button
                    style={{ ...s.btnToggle, ...(c.active ? s.btnClose : s.btnOpen) }}
                    onClick={() => toggleActive(c.id, c.active)}>
                    {c.active ? <><LockIcon /> Close</> : <><UnlockIcon /> Open</>}
                  </button>
                  <button style={s.btnRemove} onClick={() => setConfirmId(c.id)}>
                    <TrashIcon /> Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add modal */}
      {adding && (
        <Modal title="Add New Court" onClose={() => { setAdding(false); setAddForm({ ...EMPTY }); }}>
          <CourtForm form={addForm} setForm={setAddForm} />
          <ModalFooter onCancel={() => { setAdding(false); setAddForm({ ...EMPTY }); }} onConfirm={handleAdd} confirmLabel="Add Court" />
        </Modal>
      )}

      {/* Edit modal */}
      {editing && (
        <Modal title={`Edit — ${editing.name}`} onClose={closeEdit}>
          <CourtForm form={form} setForm={setForm} />
          <ModalFooter onCancel={closeEdit} onConfirm={saveEdit} confirmLabel="Save Changes" />
        </Modal>
      )}

      {/* Confirm delete */}
      {confirmId && (() => {
        const court = courts.find(c => c.id === confirmId);
        return (
          <Modal title="Remove Court" onClose={() => setConfirmId(null)}>
            <p style={s.confirmText}>
              You are about to permanently remove <strong>{court?.name}</strong>. All associated data will be lost and this action cannot be undone.
            </p>
            <ModalFooter onCancel={() => setConfirmId(null)} onConfirm={() => handleDelete(confirmId)} confirmLabel="Remove Court" danger />
          </Modal>
        );
      })()}
    </div>
  );
}

/* ── Shared modal components ─────────────────────────────────────────────── */
function Modal({ title, onClose, children }: { title:string; onClose:()=>void; children:React.ReactNode }) {
  return (
    <div style={m.backdrop}>
      <div style={m.panel}>
        <div style={m.head}>
          <h2 style={m.title}>{title}</h2>
          <button onClick={onClose} style={m.close} aria-label="Close">&#x2715;</button>
        </div>
        <div style={m.body}>{children}</div>
      </div>
    </div>
  );
}

function ModalFooter({ onCancel, onConfirm, confirmLabel, danger }: { onCancel:()=>void; onConfirm:()=>void; confirmLabel:string; danger?:boolean }) {
  return (
    <div style={m.footer}>
      <button style={m.btnCancel} onClick={onCancel}>Cancel</button>
      <button style={{ ...m.btnConfirm, background: danger ? '#dc2626' : A }} onClick={onConfirm}>{confirmLabel}</button>
    </div>
  );
}

function CourtForm({ form, setForm }: { form: Partial<AdminCourt>; setForm: React.Dispatch<React.SetStateAction<Partial<AdminCourt>>> }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {([
        { label:'Court Name', key:'name', type:'text', placeholder:'e.g. Court 4' },
        { label:'Location',   key:'location', type:'text', placeholder:'e.g. Pajo, Lapu-Lapu City' },
        { label:'Price per Hour (₱)', key:'pricePerHour', type:'number', placeholder:'210' },
      ] as const).map(({ label, key, type, placeholder }) => (
        <div key={key} style={m.field}>
          <label style={m.label}>{label}</label>
          <input style={m.input} type={type} placeholder={placeholder} value={(form as any)[key] ?? ''}
            onChange={e => setForm(f => ({ ...f, [key]: type==='number' ? Number(e.target.value) : e.target.value }))} />
        </div>
      ))}
      <div style={m.field}>
        <label style={m.label}>Type</label>
        <select style={m.input} value={form.type ?? 'Indoor'} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}>
          <option>Indoor</option><option>Outdoor</option><option>Covered</option>
        </select>
      </div>
    </div>
  );
}

/* ── Styles ──────────────────────────────────────────────────────────────── */
const s: Record<string, React.CSSProperties> = {
  page:       { display:'flex', flexDirection:'column', gap:24 },
  pageHead:   { display:'flex', alignItems:'flex-start', justifyContent:'space-between' },
  pageTitle:  { fontSize:20, fontWeight:800, color:'#0f172a', margin:0 },
  pageSub:    { fontSize:13, color:'#64748b', marginTop:4 },
  btnAdd:     { display:'flex', alignItems:'center', gap:7, padding:'10px 18px', borderRadius:9, border:'none', background:A, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:`0 2px 8px ${A}40` },
  grid:       { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 },
  card:       { background:'#fff', border:'1px solid #e2e8f0', borderRadius:14, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)', display:'flex', flexDirection:'column' },
  statusBar:  { height:4, flexShrink:0 },
  cardBody:   { padding:20, display:'flex', flexDirection:'column', gap:14, flex:1 },
  cardTop:    { display:'flex', alignItems:'flex-start', justifyContent:'space-between' },
  courtTitle: {},
  courtName:  { fontSize:16, fontWeight:800, color:'#0f172a' },
  typePill:   { fontSize:10, fontWeight:700, background:'#f1f5f9', color:'#475569', padding:'2px 8px', borderRadius:99, textTransform:'uppercase' as const },
  statusPill: { fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99 },
  metaBlock:  { display:'flex', flexDirection:'column', gap:7 },
  metaRow:    { display:'flex', alignItems:'center', gap:7, fontSize:13 },
  metaText:   { color:'#64748b', fontSize:13 },
  priceLabel: { fontSize:12, fontWeight:700, color:'#94a3b8', width:28, flexShrink:0 },
  priceWrap:  { display:'flex', alignItems:'center', background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:7, overflow:'hidden' },
  pesoSign:   { padding:'5px 7px', fontSize:12, fontWeight:700, color:'#475569', background:'#f1f5f9', borderRight:'1px solid #e2e8f0' },
  priceInput: { width:62, padding:'5px 6px', border:'none', outline:'none', fontSize:13, fontWeight:700, color:'#0f172a', background:'transparent', textAlign:'right' as const },
  perHr:      { padding:'5px 7px', fontSize:11, color:'#94a3b8', background:'#f1f5f9', borderLeft:'1px solid #e2e8f0' },
  statsRow:   { display:'flex', alignItems:'center', background:'#f8fafc', borderRadius:10, padding:'12px 0' },
  stat:       { flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2 },
  statLine:   { width:1, height:30, background:'#e2e8f0' },
  statNum:    { fontSize:18, fontWeight:900, color:'#0f172a' },
  statLbl:    { fontSize:9, color:'#94a3b8', fontWeight:700, textTransform:'uppercase' as const, letterSpacing:.5 },
  actions:    { display:'flex', gap:8 },
  btnEdit:    { flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5, padding:'8px', borderRadius:8, border:'1.5px solid #e2e8f0', background:'#fff', color:'#0f172a', fontSize:12, fontWeight:600, cursor:'pointer' },
  btnToggle:  { flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5, padding:'8px', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', border:'none' },
  btnClose:   { background:'#fef3c7', color:'#b45309' },
  btnOpen:    { background:'#dcfce7', color:'#15803d' },
  btnRemove:  { display:'flex', alignItems:'center', justifyContent:'center', gap:5, padding:'8px 12px', borderRadius:8, border:'1.5px solid #fecaca', background:'#fff', color:'#dc2626', fontSize:12, fontWeight:600, cursor:'pointer' },
  confirmText:{ fontSize:14, color:'#374151', lineHeight:1.7, margin:0 },
};

const m: Record<string, React.CSSProperties> = {
  backdrop:   { position:'fixed' as const, inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, backdropFilter:'blur(3px)' },
  panel:      { background:'#fff', borderRadius:16, width:'100%', maxWidth:460, boxShadow:'0 24px 64px rgba(0,0,0,.2)', overflow:'hidden' },
  head:       { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:'1px solid #f1f5f9' },
  title:      { fontSize:16, fontWeight:800, margin:0, color:'#0f172a' },
  close:      { background:'none', border:'none', cursor:'pointer', fontSize:16, color:'#94a3b8', padding:4, lineHeight:1 },
  body:       { padding:'20px 24px', display:'flex', flexDirection:'column', gap:0 },
  footer:     { display:'flex', gap:8, justifyContent:'flex-end', padding:'16px 24px', borderTop:'1px solid #f1f5f9' },
  btnCancel:  { padding:'9px 18px', borderRadius:8, border:'1px solid #e2e8f0', background:'#fff', color:'#64748b', fontSize:13, cursor:'pointer' },
  btnConfirm: { padding:'9px 20px', borderRadius:8, border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' },
  field:      { display:'flex', flexDirection:'column', gap:5, marginBottom:14 },
  label:      { fontSize:12, fontWeight:700, color:'#374151' },
  input:      { padding:'9px 12px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:13, color:'#0f172a', outline:'none', width:'100%', boxSizing:'border-box' as const },
};
