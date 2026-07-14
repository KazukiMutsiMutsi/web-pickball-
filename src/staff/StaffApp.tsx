import { useState } from 'react';
import StaffLayout from './components/StaffLayout';
import { StaffAuthProvider, useStaffAuth } from './context/StaffAuthContext';
import StaffCheckIn from './screens/StaffCheckIn';
import StaffCourts from './screens/StaffCourts';
import StaffDashboard from './screens/StaffDashboard';
import StaffPlayers from './screens/StaffPlayers';
import StaffSchedule from './screens/StaffSchedule';
import type { StaffPage } from './types';

/** Inner portal — requires StaffAuthProvider above it in the tree */
export function StaffPortal() {
  const { isAuthenticated } = useStaffAuth();
  const [page, setPage] = useState<StaffPage>('dashboard');

  if (!isAuthenticated) return null; // UnifiedApp handles login gate

  return (
    <StaffLayout page={page} onNavigate={setPage}>
      {page === 'dashboard' && <StaffDashboard />}
      {page === 'schedule'  && <StaffSchedule  />}
      {page === 'courts'    && <StaffCourts    />}
      {page === 'checkin'   && <StaffCheckIn   />}
      {page === 'players'   && <StaffPlayers   />}
    </StaffLayout>
  );
}

/** Standalone entry — wraps its own provider */
export default function StaffApp() {
  return (
    <StaffAuthProvider>
      <StaffPortal />
    </StaffAuthProvider>
  );
}
