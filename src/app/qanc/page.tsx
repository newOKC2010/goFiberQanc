'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/global/globalLang';
import tr, { t } from '@/global/translations';
import { BookingDateModal } from '@/app/qanc/bookingDate/BookingDateModal';
import { CheckBookingModal } from '@/app/qanc/bookingCheck/CheckBookingModal';
import { CancelBookingModal } from '@/app/qanc/bookingCancel/CancelBookingModal';

const featureKeys = ['bookingDate', 'check', 'cancel'] as const;
type FeatureKey = typeof featureKeys[number];

const featureConfig: Record<FeatureKey, { icon: string; color: string; shadow: string; hover: string; bg: string; border: string }> = {
  bookingDate: { icon: 'edit_calendar',  color: 'from-sky-400 to-cyan-400',     shadow: 'shadow-sky-200',     hover: 'hover:shadow-sky-300',     bg: 'bg-sky-50',     border: 'border-sky-100' },
  check:       { icon: 'search',         color: 'from-emerald-400 to-teal-400', shadow: 'shadow-emerald-200', hover: 'hover:shadow-emerald-300', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  cancel:      { icon: 'event_busy',     color: 'from-violet-400 to-purple-400',shadow: 'shadow-violet-200',  hover: 'hover:shadow-violet-300',  bg: 'bg-violet-50',  border: 'border-violet-100' },
};

export default function QancPage() {
  const router = useRouter();
  const { lang, toggleLang } = useLang();
  const [showBooking, setShowBooking] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  return (
    <>
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-pink-50 via-sky-50 to-cyan-50">
      {/* Blobs */}
      <div className="absolute top-[-8%] left-[-8%] w-[35%] h-[35%] bg-pink-200/40 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-8%] w-[40%] h-[40%] bg-sky-200/40 rounded-full blur-[120px] animate-pulse delay-1000" />
      <div className="absolute top-[45%] left-[55%] w-[20%] h-[20%] bg-violet-200/30 rounded-full blur-[80px] animate-pulse delay-500" />

      {/* Top-right controls */}
      <div className="absolute top-5 right-5 z-20 flex items-center gap-2">
        {/* Language toggle */}
        <button
          onClick={toggleLang}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/70 backdrop-blur-md border border-white/60 shadow-sm text-gray-500 text-xs font-bold hover:bg-white/90 hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 600", fontSize: '1rem' }}>
            translate
          </span>
          {lang === 'th' ? 'EN' : 'ไทย'}
        </button>

        {/* Admin Login */}
        <button
          onClick={() => router.push('/auth')}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/70 backdrop-blur-md border border-white/60 shadow-sm text-gray-500 text-xs font-bold hover:bg-white/90 hover:text-gray-700 hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 600", fontSize: '1rem' }}>
            admin_panel_settings
          </span>
          {t(tr.common.adminLogin, lang)}
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16">

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-pink-200 to-rose-100 shadow-xl shadow-pink-100 mb-6 group hover:scale-105 transition-all duration-300">
            <span className="material-symbols-outlined text-pink-400" style={{ fontVariationSettings: "'wght' 700", fontSize: '3rem' }}>
              pregnant_woman
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-700 mb-3 tracking-tight">
            {lang === 'th' ? 'ระบบจองคิว ' : 'ANC '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-rose-300">
              {lang === 'th' ? 'ANC' : 'Queue Booking'}
            </span>
          </h1>
          <p className="text-gray-500 text-sm sm:text-base font-bold max-w-sm mx-auto leading-relaxed">
            {t(tr.qanc.subtitle, lang)}<br />
            {t(tr.qanc.hospital, lang)}<br />
            {t(tr.qanc.tagline, lang)}
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-2xl">
          {featureKeys.map((key) => {
            const cfg = featureConfig[key];
            const label = t(tr.qanc[key].label, lang);
            const desc = t(tr.qanc[key].desc, lang);
            return (
              <button
                key={key}
                onClick={() => key === 'bookingDate' ? setShowBooking(true) : key === 'check' ? setShowCheck(true) : setShowCancel(true)}
                className={`group flex flex-col items-center gap-4 p-7 rounded-3xl ${cfg.bg} border ${cfg.border} shadow-lg ${cfg.shadow} ${cfg.hover} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer text-center`}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cfg.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'wght' 700", fontSize: '2rem' }}>
                    {cfg.icon}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-gray-700 text-base mb-1">{label}</p>
                  <p className="text-gray-500 text-xs font-bold leading-relaxed">{desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="mt-10 text-xs text-gray-400 font-bold">
          {t(tr.qanc.footer, lang)}
        </p>
      </div>
    </div>

    <BookingDateModal isOpen={showBooking} onClose={() => setShowBooking(false)} />
    <CheckBookingModal isOpen={showCheck} onClose={() => setShowCheck(false)} />
    <CancelBookingModal isOpen={showCancel} onClose={() => setShowCancel(false)} />
    </>
  );
}
