'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/modal/mainModal';
import { InputText } from '@/components/input/text/mainInputText';
import { useLang } from '@/global/globalLang';
import { API_BASE_URL, API_ENDPOINTS } from '@/global/globalApi';
import { showAlert } from '@/global/globalSwal';
import { type IdType } from '@/app/qanc/bookingDate/types';

type Step = 'input' | 'result';

type BookingDetail = {
  id: number;
  slot_date: string;
  queue_no: number;
  full_name: string;
  phone: string;
  status: string;
  created_at: string;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckBookingModal({ isOpen, onClose }: Props) {
  const { lang } = useLang();

  const [step, setStep] = useState<Step>('input');
  const [idType, setIdType] = useState<IdType>('cid');
  const [cid, setCid] = useState('');
  const [passport, setPassport] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<BookingDetail | null>(null);

  // reset เมื่อปิด modal
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
        setStep('result');
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

  const modalTitle =
    step === 'input'
      ? (lang === 'th' ? 'ตรวจสอบการจอง' : 'Check Booking')
      : (lang === 'th' ? 'ข้อมูลการจองของคุณ' : 'Your Booking');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      wrapperClassName="max-w-md"
      title={modalTitle}
      icon={
        <span
          className="material-symbols-outlined text-3xl text-emerald-400"
          style={{ fontVariationSettings: "'wght' 700" }}
        >
          {step === 'input' ? 'search' : 'event_available'}
        </span>
      }
    >
      {/* ── Step 1: input ── */}
      {step === 'input' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400 font-bold text-center">
            {lang === 'th' ? 'ใช้เลขบัตรประชาชนหรือ Passport เพื่อดูข้อมูลการจอง' : 'Enter your Thai ID or Passport to view your booking'}
          </p>

          {/* ID type toggle */}
          <div className="flex gap-2">
            {(['cid', 'passport'] as IdType[]).map(v => (
              <button key={v} onClick={() => setIdType(v)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer ${
                  idType === v ? 'bg-emerald-400 text-white border-emerald-400' : 'bg-white text-gray-400 border-gray-200 hover:border-emerald-300'
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

          <button
            onClick={handleSearch} disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-white font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-60"
          >
            {loading ? (lang === 'th' ? 'กำลังค้นหา...' : 'Searching...') : (lang === 'th' ? 'ค้นหาการจอง' : 'Search Booking')}
          </button>
        </div>
      )}

      {/* ── Step 2: result ── */}
      {step === 'result' && booking && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-3">
            <div className="flex justify-center mb-1">
              <span className="text-5xl font-bold text-emerald-500">{booking.queue_no}</span>
            </div>
            <p className="text-center text-xs text-emerald-400 font-bold -mt-1">
              {lang === 'th' ? 'เลขคิวของคุณ' : 'Your Queue Number'}
            </p>

            <div className="space-y-2 text-sm font-bold pt-2 border-t border-emerald-100">
              <Row label={lang === 'th' ? 'วันนัดหมาย' : 'Appointment'} value={formatDate(booking.slot_date)} />
              <Row label={lang === 'th' ? 'ชื่อ-นามสกุล' : 'Full Name'} value={booking.full_name} />
              <Row label={lang === 'th' ? 'เบอร์โทร' : 'Phone'} value={booking.phone} />
              <Row label={lang === 'th' ? 'รหัสการจอง' : 'Booking ID'} value={`#${booking.id}`} />
              <Row
                label={lang === 'th' ? 'สถานะ' : 'Status'}
                value={booking.status === 'booked' ? (lang === 'th' ? 'จองแล้ว ✓' : 'Booked ✓') : booking.status}
                valueClass="text-emerald-600"
              />
            </div>
          </div>

          <p className="text-xs text-gray-400 font-bold text-center">
            {lang === 'th' ? '* กรุณานำเลขคิวมาในวันนัดหมาย' : '* Please bring your queue number on the appointment day'}
          </p>

          <div className="flex gap-3">
            <button onClick={() => setStep('input')}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-400 text-sm font-bold hover:bg-gray-50 transition-all cursor-pointer">
              {lang === 'th' ? '← ค้นหาใหม่' : '← Search Again'}
            </button>
            <button onClick={onClose}
              className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer">
              {lang === 'th' ? 'ปิด' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Row({ label, value, valueClass = 'text-gray-700' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-400">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}
