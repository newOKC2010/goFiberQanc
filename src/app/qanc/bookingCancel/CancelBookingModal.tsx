'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/modal/mainModal';
import { InputText } from '@/components/input/text/mainInputText';
import { useLang } from '@/global/globalLang';
import { API_BASE_URL, API_ENDPOINTS } from '@/global/globalApi';
import { showAlert, showConfirm } from '@/global/globalSwal';
import { type IdType } from '@/app/qanc/bookingDate/types';

type Step = 'input' | 'confirm' | 'done';

type BookingDetail = {
  id: number;
  slot_id: number;
  slot_date: string;
  queue_no: number;
  full_name: string;
  phone: string;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CancelBookingModal({ isOpen, onClose }: Props) {
  const { lang } = useLang();

  const [step, setStep] = useState<Step>('input');
  const [idType, setIdType] = useState<IdType>('cid');
  const [cid, setCid] = useState('');
  const [passport, setPassport] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<BookingDetail | null>(null);

  useEffect(() => {
    if (isOpen) return;
    const timer = setTimeout(() => {
      setStep('input');
      setCid('');
      setPassport('');
      setBooking(null);
    }, 250);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

  const handleSearch = async () => {
    const id = idType === 'cid' ? cid.trim() : passport.trim();
    if (!id) {
      showAlert(
        lang === 'th' ? 'กรุณากรอกข้อมูล' : 'Please fill in',
        lang === 'th' ? 'กรุณาระบุเลขบัตรหรือ Passport' : 'Please enter your ID or Passport',
        'warning', {}, undefined, lang
      );
      return;
    }
    if (idType === 'cid' && cid.length !== 13) {
      showAlert(
        lang === 'th' ? 'ข้อมูลไม่ถูกต้อง' : 'Invalid',
        lang === 'th' ? 'เลขบัตรประชาชนต้องมี 13 หลัก' : 'Thai ID must be 13 digits',
        'warning', {}, undefined, lang
      );
      return;
    }

    setLoading(true);
    try {
      const body = idType === 'cid' ? { cid } : { passport_no: passport };
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.QANC.BOOKING_CHECK}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept-Language': lang },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setBooking(data.data);
        setStep('confirm');
      } else {
        showAlert(
          lang === 'th' ? 'ไม่พบข้อมูล' : 'Not Found',
          data.message ?? '',
          'info', {}, undefined, lang
        );
      }
    } catch {
      showAlert(lang === 'th' ? 'เกิดข้อผิดพลาด' : 'Error', '', 'error', {}, undefined, lang);
    }
    setLoading(false);
  };

  const handleCancel = async () => {
    if (!booking) return;

    const confirmed = await showConfirm(
      lang === 'th'
        ? `ยืนยันยกเลิกการจอง?\n\nวันที่ ${formatDate(booking.slot_date)} คิวที่ ${booking.queue_no}`
        : `Confirm cancellation?\n\n${formatDate(booking.slot_date)}, Queue #${booking.queue_no}`,
      {},
      undefined,
      {
        confirm: lang === 'th' ? 'ยืนยัน' : 'Confirm',
        cancel:  lang === 'th' ? 'ยกเลิก' : 'Cancel',
      }
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const body = idType === 'cid'
        ? { slot_id: booking.slot_id, cid }
        : { slot_id: booking.slot_id, passport_no: passport };

      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.QANC.BOOKING_CANCEL}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Accept-Language': lang },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setStep('done');
      } else {
        showAlert(
          lang === 'th' ? 'เกิดข้อผิดพลาด' : 'Error',
          data.message ?? '',
          'error', {}, undefined, lang
        );
      }
    } catch {
      showAlert(lang === 'th' ? 'เกิดข้อผิดพลาด' : 'Error', '', 'error', {}, undefined, lang);
    }
    setLoading(false);
  };

  const title = {
    input:   lang === 'th' ? 'ยกเลิกการจอง'         : 'Cancel Booking',
    confirm: lang === 'th' ? 'ยืนยันข้อมูลการจอง'    : 'Confirm Booking Details',
    done:    lang === 'th' ? 'ยกเลิกการจองสำเร็จ'    : 'Booking Cancelled',
  }[step];

  const icon = {
    input:   'event_busy',
    confirm: 'warning',
    done:    'check_circle',
  }[step];

  const iconColor = {
    input:   'text-violet-400',
    confirm: 'text-amber-400',
    done:    'text-emerald-400',
  }[step];

  return (
    <Modal isOpen={isOpen} onClose={onClose} wrapperClassName="max-w-md" title={title}
      icon={
        <span className={`material-symbols-outlined text-3xl ${iconColor}`}
          style={{ fontVariationSettings: "'wght' 700" }}>
          {icon}
        </span>
      }
    >
      {/* ── Step 1: input ── */}
      {step === 'input' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400 font-bold text-center">
            {lang === 'th' ? 'ระบุเลขบัตรหรือ Passport เพื่อค้นหาการจองที่ต้องการยกเลิก' : 'Enter your ID or Passport to find the booking you want to cancel'}
          </p>

          <div className="flex gap-2">
            {(['cid', 'passport'] as IdType[]).map(v => (
              <button key={v} onClick={() => setIdType(v)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer ${
                  idType === v ? 'bg-violet-400 text-white border-violet-400' : 'bg-white text-gray-400 border-gray-200 hover:border-violet-300'
                }`}
              >
                {v === 'cid' ? (lang === 'th' ? 'บัตรประชาชน' : 'Thai ID') : 'Passport'}
              </button>
            ))}
          </div>

          {idType === 'cid' ? (
            <InputText
              label={lang === 'th' ? 'เลขบัตรประชาชน 13 หลัก' : 'Thai ID (13 digits)'}
              maxWidth="full" icon="badge" maxLength={13}
              value={cid} placeholder="1234567890123"
              onChange={e => setCid(e.target.value.replace(/\D/g, ''))}
            />
          ) : (
            <InputText
              label={lang === 'th' ? 'เลข Passport' : 'Passport No.'}
              maxWidth="full" icon="travel_explore"
              value={passport} placeholder="AB1234567"
              onChange={e => setPassport(e.target.value)}
            />
          )}

          <button onClick={handleSearch} disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-400 to-purple-400 text-white font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-60">
            {loading ? (lang === 'th' ? 'กำลังค้นหา...' : 'Searching...') : (lang === 'th' ? 'ค้นหาการจอง' : 'Find Booking')}
          </button>
        </div>
      )}

      {/* ── Step 2: confirm ── */}
      {step === 'confirm' && booking && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-2 text-sm font-bold">
            <p className="text-amber-500 text-xs text-center mb-3">
              {lang === 'th' ? '⚠ ตรวจสอบข้อมูลก่อนยกเลิก' : '⚠ Please verify before cancelling'}
            </p>
            <Row label={lang === 'th' ? 'วันนัดหมาย'  : 'Appointment'}  value={formatDate(booking.slot_date)} />
            <Row label={lang === 'th' ? 'เลขคิว'       : 'Queue No.'}    value={`#${booking.queue_no}`} />
            <Row label={lang === 'th' ? 'ชื่อ-นามสกุล' : 'Full Name'}    value={booking.full_name} />
            <Row label={lang === 'th' ? 'เบอร์โทร'     : 'Phone'}        value={booking.phone} />
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('input')}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-400 text-sm font-bold hover:bg-gray-50 transition-all cursor-pointer">
              {lang === 'th' ? '← กลับ' : '← Back'}
            </button>
            <button onClick={handleCancel} disabled={loading}
              className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-rose-400 to-red-400 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60">
              {loading ? (lang === 'th' ? 'กำลังดำเนินการ...' : 'Processing...') : (lang === 'th' ? 'ยืนยันยกเลิกการจอง' : 'Confirm Cancellation')}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: done ── */}
      {step === 'done' && (
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <span className="material-symbols-outlined text-6xl text-emerald-400"
              style={{ fontVariationSettings: "'wght' 700" }}>
              check_circle
            </span>
          </div>
          <p className="text-gray-700 font-bold">
            {lang === 'th' ? 'ยกเลิกการจองเรียบร้อยแล้ว' : 'Your booking has been cancelled.'}
          </p>
          <p className="text-xs text-gray-400 font-bold">
            {lang === 'th' ? 'หากต้องการจองใหม่ กลับไปที่หน้าหลัก' : 'To book again, return to the main page.'}
          </p>
          <button onClick={onClose}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-white font-bold shadow-md hover:shadow-lg transition-all cursor-pointer">
            {lang === 'th' ? 'ปิด' : 'Close'}
          </button>
        </div>
      )}
    </Modal>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-700">{value}</span>
    </div>
  );
}
