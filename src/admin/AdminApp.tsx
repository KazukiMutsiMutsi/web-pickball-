import { useState } from 'react';
import AdminLayout from './components/AdminLayout';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import AdminBookings from './screens/AdminBookings';
import AdminCourts from './screens/AdminCourts';
import AdminDashboard from './screens/AdminDashboard';
import AdminReports from './screens/AdminReports';
import AdminSettings from './screens/AdminSettings';
import AdminStaff from './screens/AdminStaff';
import AdminUsers from './screens/AdminUsers';
import type { AdminPage } from './types';

/** Inner portal — requires AdminAuthProvider above it in the tree */
export function AdminPortal() {
  const { isAuthenticated } = useAdminAuth();
  const [page, setPage] = useState<AdminPage>('dashboard');

  if (!isAuthenticated) return null; // UnifiedApp handles login gate

  return (
    <AdminLayout page={page} onNavigate={setPage}>
      {page === 'dashboard' && <AdminDashboard />}
      {page === 'bookings'  && <AdminBookings  />}
      {page === 'courts'    && <AdminCourts    />}
      {page === 'users'     && <AdminUsers     />}
      {page === 'staff'     && <AdminStaff     />}
      {page === 'reports'   && <AdminReports   />}
      {page === 'settings'  && <AdminSettings  />}
    </AdminLayout>
  );
}

/** Standalone entry — wraps its own provider (used when AdminApp is the root) */
export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <AdminPortal />
    </AdminAuthProvider>
  );
}
