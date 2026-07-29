import { apiRequest } from '@/src/api/client';
import { ENDPOINTS } from '@/src/api/endpoints';
import type { Court } from '@/src/components/CourtCard';

/** Shape returned by GET /api/courts */
interface ApiCourt {
  id: string;
  name: string;
  display_name: string;
  location: string;
  hourly_rate: number;
  is_active: boolean;
  sport?: string;
  description?: string;
}

/** Map API shape → frontend Court type */
function mapCourt(c: ApiCourt): Court {
  return {
    id:           c.id,
    name:         c.display_name ?? c.name,
    location:     c.location,
    pricePerHour: Number(c.hourly_rate),
    rating:       0,
  };
}

export interface CourtAvailabilitySlot {
  slot: string;
  status: 'open' | 'pending' | 'booked';
}

export interface CourtAvailabilityResponse {
  courtId: string;
  court: ApiCourt;
  date: string;
  availability: CourtAvailabilitySlot[];
  availableCount: number;
}

export const courtsService = {
  /** GET /api/courts — public, no auth needed */
  async getAll(): Promise<Court[]> {
    const res = await apiRequest<{ courts: ApiCourt[] }>(ENDPOINTS.courts.list);
    return res.courts.map(mapCourt);
  },

  /** GET /api/courts/:id — uses availability endpoint */
  async getById(id: string): Promise<Court> {
    // Fetch availability for today just to get court info
    const today = new Date().toISOString().slice(0, 10);
    const res = await apiRequest<CourtAvailabilityResponse>(
      `${ENDPOINTS.courts.courtAvail(id)}?date=${today}`,
    );
    return mapCourt(res.court);
  },

  /** GET /api/courts/availability?date=YYYY-MM-DD */
  async getAllAvailability(date: string) {
    return apiRequest<{
      date: string;
      courts: { id: string; name: string; displayName: string; hourlyRate: number }[];
      grid: { slot: string; label: string; courts: Record<string, string> }[];
    }>(`${ENDPOINTS.courts.availability}?date=${date}`);
  },

  /** GET /api/courts/:id/availability?date=YYYY-MM-DD */
  async getCourtAvailability(id: string, date: string): Promise<CourtAvailabilityResponse> {
    return apiRequest<CourtAvailabilityResponse>(
      `${ENDPOINTS.courts.courtAvail(id)}?date=${date}`,
    );
  },

  /** GET /api/gcash — public */
  async getGcashSettings() {
    return apiRequest<{ gcash: { phone_number: string; account_name: string } }>(
      ENDPOINTS.courts.gcash,
    );
  },
};
