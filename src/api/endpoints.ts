export const ENDPOINTS = {
  // Courts (public)
  courts: {
    list:             '/courts',
    availability:     '/courts/availability',          // ?date=YYYY-MM-DD
    courtAvail:       (id: string) => `/courts/${id}/availability`, // ?date=YYYY-MM-DD
    gcash:            '/gcash',
  },
  // Bookings (auth required)
  bookings: {
    create:           '/bookings',
    pay:              (id: string) => `/bookings/${id}/pay`,
    me:               '/bookings/me',
    detail:           (id: string) => `/bookings/${id}`,
    qr:               (id: string) => `/bookings/${id}/qr`,
    cancel:           (id: string) => `/bookings/${id}/cancel`,
  },
  // Notifications (auth required)
  notifications: {
    list:             '/notifications',
    markRead:         (id: string) => `/notifications/${id}/read`,
    markAllRead:      '/notifications/read-all',
  },
  // Payments (auth required)
  payments: {
    gcash:            '/payments/gcash',
    status:           (bookingId: string) => `/payments/status/${bookingId}`,
  },
  // Admin (admin role required)
  admin: {
    bookings:         '/admin/bookings',
    updateBooking:    (id: string) => `/admin/bookings/${id}/status`,
    courts:           '/admin/courts',
    updateCourt:      (id: string) => `/admin/courts/${id}`,
    deleteCourt:      (id: string) => `/admin/courts/${id}`,
    updateGcash:      '/admin/gcash',
  },
} as const;
