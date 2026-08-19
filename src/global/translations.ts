export type Lang = 'th' | 'en';

const translations = {
  common: {
    adminLogin: { th: 'เข้าสู่ระบบ Admin', en: 'Admin Login' },
    loading: { th: 'กำลังโหลด...', en: 'Loading...' },
    confirm: { th: 'ตกลง', en: 'OK' },
    cancel: { th: 'ยกเลิก', en: 'Cancel' },
    close: { th: 'ปิด', en: 'Close' },
    back: { th: 'กลับ', en: 'Back' },
    error: { th: 'เกิดข้อผิดพลาด', en: 'Error' },
    success: { th: 'สำเร็จ', en: 'Success' },
    warning: { th: 'คำเตือน', en: 'Warning' },
  },
  qanc: {
    title: { th: 'ระบบจองคิว ANC', en: 'ANC Queue Booking' },
    subtitle: {
      th: 'บริการนัดหมายตรวจฝากครรภ์ออนไลน์',
      en: 'Online Antenatal Care Appointment Service',
    },
    hospital: { th: 'โรงพยาบาล บางเลน', en: 'Banglen Hospital' },
    tagline: { th: 'สะดวก รวดเร็ว', en: 'Convenient & Fast' },
    footer: {
      th: 'โรงพยาบาล บางเลน · ระบบนัดหมายตรวจฝากครรภ์ ANC Online',
      en: 'Banglen Hospital · ANC Online Appointment System',
    },
    bookingDate: {
      label: { th: 'ดูวันที่เปิดจอง', en: 'Book Appointment' },
      desc: { th: 'เลือกวันและจองคิวตรวจฝากครรภ์', en: 'Select a date and book ANC appointment' },
    },
    check: {
      label: { th: 'ตรวจสอบการจอง', en: 'Check Booking' },
      desc: { th: 'ดูรายละเอียดการจองคิวของตัวเอง', en: 'View your booking details' },
    },
    cancel: {
      label: { th: 'ยกเลิกการจอง', en: 'Cancel Booking' },
      desc: { th: 'ยกเลิกคิวที่จองไว้ล่วงหน้าได้ง่ายๆ', en: 'Cancel your existing appointment easily' },
    },
  },
  auth: {
    title: { th: 'QANC Admin', en: 'QANC Admin' },
    subtitle: { th: 'ระบบจองคิวตรวจ ANC Online', en: 'ANC Queue Booking System' },
    emailLabel: { th: 'กรุณาระบุ อีเมลที่สมัครใช้งาน', en: 'Enter your registered email' },
    emailPlaceholder: { th: 'name@example.com', en: 'name@example.com' },
    loginBtn: { th: 'เข้าสู่ระบบ', en: 'Sign In' },
    onlyStaff: { th: 'เฉพาะเจ้าหน้าที่ที่ได้รับอนุญาตเท่านั้น', en: 'Authorized staff only' },
    loggingIn: { th: 'กำลังเข้าสู่ระบบ', en: 'Signing in...' },
    emailInvalid: { th: 'รูปแบบอีเมลไม่ถูกต้อง', en: 'Invalid email format' },
    emailRequired: { th: 'กรุณากรอกอีเมล', en: 'Email is required' },
    otpTitle: { th: 'ยืนยัน OTP', en: 'Verify OTP' },
    otpDesc: { th: 'กรอกรหัส OTP 6 หลัก ที่ส่งไปยัง', en: 'Enter the 6-digit OTP sent to' },
    otpLine: { th: 'หรือ line หมอพร้อมของคุณ', en: 'or your MophConnect LINE' },
    otpExpire: { th: 'รหัส OTP มีอายุ 2 นาที', en: 'OTP expires in 2 minutes' },
    otpVerify: { th: 'ยืนยัน', en: 'Verify' },
  },
  errors: {
    noToken: {
      title: { th: 'กรุณาเข้าสู่ระบบ', en: 'Please Sign In' },
      desc: { th: 'ยังไม่มี Token หรือ Token หมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง', en: 'No token or token expired. Please sign in again.' },
    },
    authFailed: {
      title: { th: 'สิทธิ์การเข้าถึงหมดอายุ', en: 'Session Expired' },
      desc: { th: 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง', en: 'Please sign in again.' },
    },
    noPermission: {
      title: { th: 'ไม่มีสิทธิ์', en: 'Access Denied' },
      desc: { th: 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้ เฉพาะผู้ดูแลระบบเท่านั้น', en: 'You do not have permission. Admins only.' },
    },
    network: {
      title: { th: 'ข้อผิดพลาดเครือข่าย', en: 'Network Error' },
      desc: { th: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', en: 'Unable to connect to server.' },
    },
    unknown: {
      title: { th: 'เกิดข้อผิดพลาด', en: 'Error' },
      desc: { th: 'กรุณาลองใหม่อีกครั้ง', en: 'Please try again.' },
    },
  },
} as const;

export type TranslationKey = typeof translations;
export default translations;

export function t(obj: { th: string; en: string }, lang: Lang): string {
  return obj[lang];
}
