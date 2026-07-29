import { apiRequest } from '@/src/api/client';
import { ENDPOINTS } from '@/src/api/endpoints';

export interface ApiNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  booking_id?: string;
  created_at: string;
}

export const notificationsService = {
  /** GET /api/notifications */
  async getAll(): Promise<{ notifications: ApiNotification[]; unreadCount: number }> {
    return apiRequest(ENDPOINTS.notifications.list);
  },

  /** PATCH /api/notifications/:id/read */
  async markRead(id: string): Promise<void> {
    await apiRequest(ENDPOINTS.notifications.markRead(id), { method: 'PATCH' });
  },

  /** PATCH /api/notifications/read-all */
  async markAllRead(): Promise<void> {
    await apiRequest(ENDPOINTS.notifications.markAllRead, { method: 'PATCH' });
  },
};
