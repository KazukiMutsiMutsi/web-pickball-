import { apiRequest } from '@/src/api/client';
import { ENDPOINTS } from '@/src/api/endpoints';
import type { ApiBooking } from './bookings.service';

export interface AdminCourt {
  id: string;
  name: string;
  display_name: string;
  sport: string;
  location: string;
  description?: string;
  hourly_rate: number;
  is_active: boolean;
}

export interface CreateCourtPayload {
  name: string;
  displayName: string;
  sport: string;
  location: string;
  description?: string;
  hourlyRate: number;
}

export interface UpdateCourtPayload extends Partial<CreateCourtPayload> {
  isActive?: boolean;
}

export const adminService = {
  // ── Bookings ────────────────────────────────────────────────────────────────

  /** GET /api/admin/bookings — optionally filter by status, date, courtId */
  async getBookings(filters?: {
    status?: string;
    date?: string;
    courtId?: string;
  }): Promise<ApiBooking[]> {
    const params = new URLSearchParams();
    if (filters?.status)  params.set('status',  filters.status);
    if (filters?.date)    params.set('date',    filters.date);
    if (filters?.courtId) params.set('courtId', filters.courtId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await apiRequest<{ bookings: ApiBooking[] }>(
      `${ENDPOINTS.admin.bookings}${qs}`,
    );
    return res.bookings;
  },

  /** PATCH /api/admin/bookings/:id/status */
  async updateBookingStatus(id: string, status: string): Promise<ApiBooking> {
    const res = await apiRequest<{ booking: ApiBooking }>(
      ENDPOINTS.admin.updateBooking(id),
      { method: 'PATCH', body: JSON.stringify({ status }) },
    );
    return res.booking;
  },

  // ── Courts ──────────────────────────────────────────────────────────────────

  /** GET /api/courts (public endpoint) */
  async getCourts(): Promise<AdminCourt[]> {
    const res = await apiRequest<{ courts: AdminCourt[] }>('/courts');
    return res.courts;
  },

  /** POST /api/admin/courts */
  async createCourt(payload: CreateCourtPayload): Promise<AdminCourt> {    const res = await apiRequest<{ court: AdminCourt }>(
      ENDPOINTS.admin.courts,
      { method: 'POST', body: JSON.stringify(payload) },
    );
    return res.court;
  },

  /** PATCH /api/admin/courts/:id */
  async updateCourt(id: string, payload: UpdateCourtPayload): Promise<AdminCourt> {
    const res = await apiRequest<{ court: AdminCourt }>(
      ENDPOINTS.admin.updateCourt(id),
      { method: 'PATCH', body: JSON.stringify(payload) },
    );
    return res.court;
  },

  /** DELETE /api/admin/courts/:id */
  async deleteCourt(id: string): Promise<void> {
    await apiRequest(ENDPOINTS.admin.deleteCourt(id), { method: 'DELETE' });
  },

  // ── GCash ───────────────────────────────────────────────────────────────────

  /** PUT /api/admin/gcash */
  async updateGcash(phoneNumber: string, accountName: string) {
    return apiRequest<{ gcash: { phone_number: string; account_name: string } }>(
      ENDPOINTS.admin.updateGcash,
      { method: 'PUT', body: JSON.stringify({ phoneNumber, accountName }) },
    );
  },
};
