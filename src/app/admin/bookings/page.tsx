'use client';

import { useEffect, useState, useCallback } from 'react';
import { AuthToken } from '@/global/globalAuth';
import { API_BASE_URL, API_ENDPOINTS } from '@/global/globalApi';
import Pagination from '@/components/pagination/mainPagination';
import { type PaginationData } from '@/components/pagination/handler/handlerPagination';
import HeaderFiltersDate from '@/components/dataPicker/headerFiltersDate';

type Booking = {
  id: number;
  slot_date: string;
  queue_no: number;
  full_name: string;
  phone: string;
  rights_type: string;
  lmp_date: string | null;
  is_first_pregnancy: boolean | null;
  previous_births: number;
  previous_miscarriages: number;
  has_prior_anc: boolean | null;
  expected_due_date: string | null;
  diseases: string[];
  note: string;
  status: string;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  booked:    'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-600',
  completed: 'bg-sky-100 text-sky-700',
};

const STATUS_LABELS: Record<string, string> = {
  booked:    'จอง',
  cancelled: 'ยกเลิก',
  completed: 'เสร็จสิ้น',
};

const LIMIT = 10;
const EMPTY_PAGINATION: PaginationData = { count: 0, total_count: 0, total_pages: 1, current_page: 1 };

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filterDate, setFilterDate] = useState('');      // picker value
  const [activeDate, setActiveDate] = useState('');      // ค่าที่ส่ง API จริง
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>(EMPTY_PAGINATION);

  const fetchBookings = useCallback(async (p = 1, date = activeDate) => {
    setLoading(true);
    const token = AuthToken.getToken();
    const params = new URLSearchParams({ page: String(p), limit: String(LIMIT) });
    if (date) params.set('slot_date', date);
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.BOOKINGS}?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setBookings(data.success ? data.data : []);
    setPagination(data.pagination ?? EMPTY_PAGINATION);
    setLoading(false);
  }, [activeDate]);

  useEffect(() => { fetchBookings(page, activeDate); }, [page]);  // eslint-disable-line

  const handleSearch = () => {
    setActiveDate(filterDate);
    setPage(1);
    fetchBookings(1, filterDate);
  };

  const handleClear = () => {
    setFilterDate('');
    setActiveDate('');
    setPage(1);
    fetchBookings(1, '');
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">รายการจองคิว</h1>
          <p className="text-sm text-gray-500 font-bold mt-1">คลินิกฝากครรภ์ (ANC)</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="w-full sm:min-w-[300px]">
            <HeaderFiltersDate
              selectedDate={filterDate}
              onDateChange={setFilterDate}
              placeholder="เลือกวันที่"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-gradient-to-r from-pink-400 to-rose-400 text-white text-sm font-bold shadow hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'wght' 700" }}>search</span>
              ค้นหา
            </button>
            {activeDate && (
              <button
                onClick={handleClear}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-3 rounded-xl border border-pink-200 text-pink-500 text-sm font-bold hover:bg-pink-50 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'wght' 600" }}>close</span>
                ล้าง
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'ทั้งหมด',  count: bookings.length,                                      color: 'from-pink-400 to-rose-400' },
          { label: 'จอง',      count: bookings.filter(b => b.status === 'booked').length,    color: 'from-rose-300 to-pink-400' },
          { label: 'ยกเลิก',   count: bookings.filter(b => b.status === 'cancelled').length,  color: 'from-rose-400 to-rose-500' },
        ].map(s => (
          <div key={s.label} className="bg-rose-50 rounded-2xl p-4 shadow-sm border border-rose-100">
            <p className="text-xs font-bold text-rose-400">{s.label}</p>
            <p className={`text-2xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.count}</p>
          </div>
        ))}
      </div>

      {/* Table / Cards */}
      <div className="bg-white rounded-2xl shadow-sm border border-pink-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="material-symbols-outlined animate-spin text-4xl text-pink-400">progress_activity</span>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <span className="material-symbols-outlined text-5xl mb-2">event_busy</span>
            <p className="font-bold text-sm">ไม่พบรายการจอง</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-pink-100 bg-pink-50/40">
                    {['คิว', 'วันที่', 'ชื่อ-นามสกุล', 'เบอร์', 'สิทธิ์', 'สถานะ', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-bold text-gray-500 text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.map(b => (
                    <tr key={b.id} className="hover:bg-pink-50/40 transition-colors">
                      <td className="px-4 py-3 font-bold text-gray-700">#{b.queue_no}</td>
                      <td className="px-4 py-3 font-bold text-gray-600 whitespace-nowrap">{formatDate(b.slot_date)}</td>
                      <td className="px-4 py-3 font-bold text-gray-800">{b.full_name}</td>
                      <td className="px-4 py-3 text-gray-600 font-bold">{b.phone}</td>
                      <td className="px-4 py-3 text-gray-500 font-bold text-xs">{b.rights_type || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${STATUS_COLORS[b.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {STATUS_LABELS[b.status] ?? b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelected(b)}
                          className="px-3 py-1 rounded-lg bg-pink-50 text-pink-600 text-xs font-bold hover:bg-pink-100 transition-colors cursor-pointer">
                          รายละเอียด
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-pink-50">
              {bookings.map(b => (
                <div key={b.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-pink-100 text-pink-600 text-xs font-bold">#{b.queue_no}</span>
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${STATUS_COLORS[b.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[b.status] ?? b.status}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-gray-400">{formatDate(b.slot_date)}</span>
                  </div>
                  <p className="font-bold text-gray-800 text-sm">{b.full_name}</p>
                  <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-pink-300" style={{ fontVariationSettings: "'wght' 600" }}>call</span>
                      {b.phone}
                    </span>
                    {b.rights_type && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-pink-300" style={{ fontVariationSettings: "'wght' 600" }}>badge</span>
                        {b.rights_type}
                      </span>
                    )}
                  </div>
                  <button onClick={() => setSelected(b)}
                    className="w-full py-2 rounded-xl bg-pink-50 text-pink-600 text-xs font-bold hover:bg-pink-100 transition-colors cursor-pointer">
                    ดูรายละเอียด
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        paginationData={pagination}
        onPageChange={p => setPage(p)}
        loading={loading}
      />

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setSelected(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4"
            onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-gray-800">รายละเอียดการจอง</h2>
                <p className="text-xs text-gray-400 font-bold">คิว #{selected.queue_no} · {formatDate(selected.slot_date)}</p>
              </div>
              <button onClick={() => setSelected(null)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm font-bold">
              <InfoRow label="ชื่อ-นามสกุล" value={selected.full_name} />
              <InfoRow label="เบอร์โทร" value={selected.phone} />
              <InfoRow label="สิทธิ์การรักษา" value={selected.rights_type || '-'} />
              <InfoRow label="สถานะ" value={STATUS_LABELS[selected.status] ?? selected.status} />
              <InfoRow label="ครรภ์แรก" value={selected.is_first_pregnancy == null ? '-' : selected.is_first_pregnancy ? 'ใช่' : 'ไม่ใช่'} />
              <InfoRow label="คลอดแล้ว / แท้ง" value={`${selected.previous_births} / ${selected.previous_miscarriages} ครั้ง`} />
              <InfoRow label="LMP" value={selected.lmp_date ? formatDate(selected.lmp_date) : '-'} />
              <InfoRow label="กำหนดคลอด" value={selected.expected_due_date ? formatDate(selected.expected_due_date) : '-'} />
              <InfoRow label="เคยฝากครรภ์" value={selected.has_prior_anc == null ? '-' : selected.has_prior_anc ? 'ใช่' : 'ไม่ใช่'} />
              <InfoRow label="โรคประจำตัว" value={selected.diseases?.length ? selected.diseases.join(', ') : '-'} />
            </div>
            {selected.note && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 font-bold mb-1">หมายเหตุ</p>
                <p className="text-sm font-bold text-gray-700">{selected.note}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-gray-800">{value}</p>
    </div>
  );
}
