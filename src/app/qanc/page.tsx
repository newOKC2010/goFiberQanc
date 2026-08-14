'use client';

import { useRouter } from 'next/navigation';

const features = [
  {
    icon: 'calendar_month',
    label: 'ดูวันที่เปิดจอง',
    desc: 'ตรวจสอบวันที่เปิดรับการจองคิว',
    color: 'from-sky-400 to-cyan-400',
    shadow: 'shadow-sky-200',
    hover: 'hover:shadow-sky-300',
    bg: 'bg-sky-50',
    border: 'border-sky-100',
    onClick: 'slots',
  },
  {
    icon: 'edit_calendar',
    label: 'จองคิว ANC',
    desc: 'นัดหมายตรวจฝากครรภ์ออนไลน์ได้ทันที',
    color: 'from-pink-400 to-rose-400',
    shadow: 'shadow-pink-200',
    hover: 'hover:shadow-pink-300',
    bg: 'bg-pink-50',
    border: 'border-pink-100',
    onClick: 'booking',
  },
  {
    icon: 'search',
    label: 'ตรวจสอบการจอง',
    desc: 'ดูรายละเอียดการจองคิวของตัวเอง',
    color: 'from-emerald-400 to-teal-400',
    shadow: 'shadow-emerald-200',
    hover: 'hover:shadow-emerald-300',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    onClick: 'check',
  },
  {
    icon: 'event_busy',
    label: 'ยกเลิกการจอง',
    desc: 'ยกเลิกคิวที่จองไว้ล่วงหน้าได้ง่ายๆ',
    color: 'from-violet-400 to-purple-400',
    shadow: 'shadow-violet-200',
    hover: 'hover:shadow-violet-300',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
    onClick: 'cancel',
  },
];

export default function QancPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-pink-50 via-sky-50 to-cyan-50">
      {/* Blobs */}
      <div className="absolute top-[-8%] left-[-8%] w-[35%] h-[35%] bg-pink-200/40 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-8%] w-[40%] h-[40%] bg-sky-200/40 rounded-full blur-[120px] animate-pulse delay-1000" />
      <div className="absolute top-[45%] left-[55%] w-[20%] h-[20%] bg-violet-200/30 rounded-full blur-[80px] animate-pulse delay-500" />

      {/* Admin Login - มุมบนขวา */}
      <div className="absolute top-5 right-5 z-20">
        <button
          onClick={() => router.push('/auth')}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/70 backdrop-blur-md border border-white/60 shadow-sm text-gray-500 text-xs font-bold hover:bg-white/90 hover:text-gray-700 hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'wght' 600", fontSize: '1rem' }}
          >
            admin_panel_settings
          </span>
          เข้าสู่ระบบ Admin
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16">

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-pink-200 to-rose-100 shadow-xl shadow-pink-100 mb-6 group hover:scale-105 transition-all duration-300">
            <span
              className="material-symbols-outlined text-pink-400"
              style={{ fontVariationSettings: "'wght' 700", fontSize: '3rem' }}
            >
              pregnant_woman
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-700 mb-3 tracking-tight">
            ระบบจองคิว{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-rose-300">
              ANC
            </span>
          </h1>
          <p className="text-gray-500 text-sm sm:text-base font-bold max-w-sm mx-auto leading-relaxed">
            บริการนัดหมายตรวจฝากครรภ์ออนไลน์ <br />
            โรงพยาบาล บางเลน<br />
            สะดวก รวดเร็ว
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 w-full max-w-4xl">
          {features.map((f) => (
            <button
              key={f.onClick}
              onClick={() => router.push(`/qanc/${f.onClick}`)}
              className={`group flex flex-col items-center gap-4 p-7 rounded-3xl ${f.bg} border ${f.border} shadow-lg ${f.shadow} ${f.hover} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer text-center`}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                <span
                  className="material-symbols-outlined text-white"
                  style={{ fontVariationSettings: "'wght' 700", fontSize: '2rem' }}
                >
                  {f.icon}
                </span>
              </div>
              <div>
                <p className="font-bold text-gray-700 text-base mb-1">{f.label}</p>
                <p className="text-gray-500 text-xs font-bold leading-relaxed">{f.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Footer note */}
        <p className="mt-10 text-xs text-gray-400 font-bold">
          โรงพยาบาล บางเลน · ระบบนัดหมายตรวจฝากครรภ์ ANC Online
        </p>
      </div>
    </div>
  );
}
