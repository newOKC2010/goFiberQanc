export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export const API_ENDPOINTS = {
  AUTH: {
    REQUEST_OTP: '/auth/req',
    VERIFY_OTP: '/auth/verify',
  },
  QANC: {
    SLOTS: '/qanc/slots',
    BOOKING: '/qanc/booking',
    BOOKING_CHECK: '/qanc/booking/check',
    BOOKING_CANCEL: '/qanc/booking/cancel',
  },
  ADMIN: {
    SLOTS: '/qanc/admin/slots',
    SLOTS_BULK: '/qanc/admin/slots/bulk',
    SLOTS_TOGGLE: '/qanc/admin/slots/toggle',
    BOOKINGS: '/qanc/admin/bookings',
  },
}
