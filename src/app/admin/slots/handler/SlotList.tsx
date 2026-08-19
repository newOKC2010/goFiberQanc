'use client';

import { Slot } from '../utils/TYPE';
import { formatDate } from './handlerSlots';

interface SlotListProps {
  slots: Slot[];
  loading: boolean;
  editId: number | null;
  editMax: string;
  editLoading: boolean;
  onEditStart: (id: number, max: number) => void;
  onEditCancel: () => void;
  onEditMaxChange: (v: string) => void;
  onEditSave: (id: number) => void;
  onToggle: (slot: Slot) => void;
}

export default function SlotList({
  slots, loading, editId, editMax, editLoading,
  onEditStart, onEditCancel, onEditMaxChange, onEditSave, onToggle,
}: SlotListProps) {
  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <span className="material-symbols-outlined animate-spin text-4xl text-pink-400">progress_activity</span>
    </div>
  );

  if (slots.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-pink-400">
      <span className="material-symbols-outlined text-5xl mb-2">event_busy</span>
      <p className="font-bold text-sm">ยังไม่มีวันเปิดจองในระบบ</p>
    </div>
  );

  const statusBadge = (is_active: boolean) => (
    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-pink-100 text-pink-500'}`}>
      {is_active ? 'เปิดจอง' : 'ปิดจอง'}
    </span>
  );

  const toggleBtn = (slot: Slot) => (
    <button onClick={() => onToggle(slot)}
      className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${slot.is_active ? 'bg-rose-50 text-rose-500 hover:bg-rose-100' : 'bg-pink-50 text-pink-600 hover:bg-pink-100'}`}>
      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'wght' 700" }}>
        {slot.is_active ? 'toggle_on' : 'toggle_off'}
      </span>
      {slot.is_active ? 'ปิดจอง' : 'เปิดจอง'}
    </button>
  );

  const queueDisplay = (slot: Slot) => (
    <span className="font-bold">
      <span className={slot.booked >= slot.max_queue ? 'text-rose-500' : 'text-emerald-600'}>{slot.booked}</span>
      <span className="text-pink-400"> / {slot.max_queue}</span>
    </span>
  );

  const editInline = (slot: Slot) => (
    <div className="flex items-center gap-2">
      <span className="font-bold text-pink-600">{slot.booked} /</span>
      <input type="number" min={slot.booked} value={editMax}
        onChange={e => onEditMaxChange(e.target.value)}
        className="w-16 px-2 py-1 border border-pink-300 rounded-lg text-sm font-bold focus:outline-none focus:border-pink-500" />
      <button onClick={() => onEditSave(slot.id)} disabled={editLoading}
        className="px-3 py-1 rounded-lg bg-pink-500 text-white text-xs font-bold hover:bg-pink-600 cursor-pointer disabled:opacity-60">
        บันทึก
      </button>
      <button onClick={onEditCancel}
        className="px-3 py-1 rounded-lg border border-pink-200 text-pink-500 text-xs font-bold hover:bg-pink-50 cursor-pointer">
        ยกเลิก
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-pink-100 bg-pink-50/40">
              {['วันที่', 'จองแล้ว / คิวสูงสุด', 'สถานะ', 'แก้ไข', 'เปิด/ปิด'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-bold text-pink-500 text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-pink-50">
            {slots.map(slot => (
              <tr key={slot.id} className="hover:bg-pink-50/40 transition-colors">
                <td className="px-4 py-3 font-bold text-pink-800 whitespace-nowrap">{formatDate(slot.slot_date)}</td>
                <td className="px-4 py-3">{editId === slot.id ? editInline(slot) : queueDisplay(slot)}</td>
                <td className="px-4 py-3">{statusBadge(slot.is_active)}</td>
                <td className="px-4 py-3">
                  <button onClick={() => onEditStart(slot.id, slot.max_queue)}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-50 text-amber-600 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'wght' 700" }}>edit</span>
                    แก้ไข
                  </button>
                </td>
                <td className="px-4 py-3">{toggleBtn(slot)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden divide-y divide-pink-50">
        {slots.map(slot => (
          <div key={slot.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-bold text-pink-800 text-sm">{formatDate(slot.slot_date)}</p>
              {statusBadge(slot.is_active)}
            </div>
            {editId === slot.id ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-pink-500">คิวสูงสุด</span>
                {editInline(slot)}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-sm font-bold">
                <span className="material-symbols-outlined text-pink-300 text-base" style={{ fontVariationSettings: "'wght' 600" }}>people</span>
                <span className="text-xs text-pink-400">จองแล้ว</span>
                <span className={slot.booked >= slot.max_queue ? 'text-rose-500' : 'text-emerald-600'}>{slot.booked}</span>
                <span className="text-pink-300">/</span>
                <span className="text-pink-600">{slot.max_queue}</span>
                <span className="text-xs text-pink-400">คิว</span>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => onEditStart(slot.id, slot.max_queue)}
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-amber-50 text-amber-600 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'wght' 700" }}>edit</span>
                แก้ไขคิว
              </button>
              <div className="flex-1">{toggleBtn(slot)}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
