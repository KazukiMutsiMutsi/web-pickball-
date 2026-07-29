import { apiRequest } from '@/src/api/client';
import { ENDPOINTS } from '@/src/api/endpoints';
import type { Booking } from '@/src/components/BookingCard';

/** Raw booking shape from the API */
export interface ApiBooking {
  id: string;
  booking_ref: string;
  user_id: string;
  court_id: string;
  date: string;
  start_slot: string;
  end_slot: string;
  duration_hours: number;
  players: number;
  hourly_rate: number;
  subtotal: number;
  service_fee: number;
  total_amount: number;
  payment_method: string;
  payment_note?: string;
  status: string;
  qr_code?: string;
  created_at: string;
  courts?: { name: string; display_name: string; location: string };
}

function mapBooking(b: ApiBooking): Booking {
  const statusMap: Record<string, Booking['status']> = {
    confirmed: 'upcoming',
    pending:   'upcoming',
    checked_in: 'upcoming',
    completed: 'completed',
    cancelled: 'cancelled',
    no_show:   'cancelled',
  };
  return {
    id:         b.id,
    courtName:  b.courts?.display_name ?? b.courts?.name ?? 'Court',
    date:       b.date,
    startTime:  b.start_slot,
    endTime:    b.end_slot,
    status:     statusMap[b.status] ?? 'upcoming',
    totalPrice: Number(b.total_amount),
  };
}

export interface CreateBookingPayload {
  courtId:   string;
  date:      string;
  startSlot: string;
  endSlot:   string;
  players:   number;
}

export const bookingsService = {
  /** GET /api/bookings/me — requires auth */
  async getAll(): Promise<Booking[]> {
    const res = await apiRequest<{ bookings: ApiBooking[] }>(ENDPOINTS.bookings.me);
    return res.bookings.map(mapBooking);
  },

  /** GET /api/bookings/me — returns raw API shape for screens that need full detail */
  async getAllRaw(): Promise<ApiBooking[]> {
    const res = await apiRequest<{ bookings: ApiBooking[] }>(ENDPOINTS.bookings.me);
    return res.bookings;
  },

  /** GET /api/bookings/:id */
  async getById(id: string): Promise<ApiBooking> {
    const res = await apiRequest<{ booking: ApiBooking }>(ENDPOINTS.bookings.detail(id));
    return res.booking;
  },

  /** POST /api/bookings — requires auth */
  async create(payload: CreateBookingPayload): Promise<ApiBooking> {
    const res = await apiRequest<{ booking: ApiBooking; gcash: { phone_number: string; account_name: string } }>(
      ENDPOINTS.bookings.create,
      { method: 'POST', body: JSON.stringify(payload) },
    );
    return res.booking;
  },

  /** POST /api/bookings/:id/pay — user marks "I've sent payment" (manual GCash) */
  async submitPayment(id: string, paymentNote: string): Promise<ApiBooking> {
    const res = await apiRequest<{ booking: ApiBooking }>(
      ENDPOINTS.bookings.pay(id),
      { method: 'POST', body: JSON.stringify({ paymentNote }) },
    );
    return res.booking;
  },

  /** PATCH /api/bookings/:id/cancel */
  async cancel(id: string): Promise<void> {
    await apiRequest(ENDPOINTS.bookings.cancel(id), { method: 'PATCH' });
  },

  /** GET /api/bookings/:id/qr */
  async getQRTicket(id: string): Promise<{ bookingRef: string; qrCode: string }> {
    return apiRequest(ENDPOINTS.bookings.qr(id));
  },
};
