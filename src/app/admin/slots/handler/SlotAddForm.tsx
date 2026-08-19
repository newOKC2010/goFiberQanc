'use client';

import MultiDateCalendar from '@/components/dataPicker/multiDateCalendar';
import { formatShortDate } from './handlerSlots';

interface SlotAddFormProps {
  selectedDates: string[];
  existingDates: string[];
  closedDates: string[];
  newMax: string;
  adding: boolean;
  onToggle: (date: string) => void;
  onMaxChange: (v: string) => void;
  onSubmit: () => void;
  onClear: () => void;
}

export default function SlotAddForm({
  selectedDates, existingDates, closedDates, newMax, adding,
  onToggle, onMaxChange, onSubmit, onClear,
}: SlotAddFormProps) {
  return (
    <div className="bg-pink-50 rounded-2xl shadow-sm border border-pink-100 p-5">
      <p className="text-sm font-bold text-pink-700 mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-pink-400" style={{ fontVariationSettings: "'wght' 700" }}>add_circle</span>
        เพิ่มวันเปิดจองใหม่
      </p>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Calendar */}
        <div className="flex-1 bg-white rounded-xl border border-pink-100 p-4">
          <MultiDateCalendar
            selectedDates={selectedDates}
            existingDates={existingDates}
            closedDates={closedDates}
            onToggle={onToggle}
          />
        </div>

        {/* Right panel */}
        <div className="lg:w-64 flex flex-col gap-4">
          {/* Selected chips */}
          <div>
            <p className="text-xs font-bold text-pink-500 mb-2">วันที่เลือก ({selectedDates.length} วัน)</p>
            {selectedDates.length === 0 ? (
              <p className="text-xs text-gray-400 font-bold">ยังไม่ได้เลือกวัน</p>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                {[...selectedDates].sort().map(d => (
                  <span key={d} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-pink-100 text-pink-700 text-xs font-bold">
                    {formatShortDate(d)}
                    <button onClick={() => onToggle(d)} className="hover:text-rose-500 cursor-pointer">
                      <span className="material-symbols-outlined" style={{ fontSize: '0.75rem' }}>close</span>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Max queue */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-pink-500">จำนวนคิวสูงสุด (ทุกวัน)</label>
            <input
              type="number" min={1} value={newMax}
              onChange={e => onMaxChange(e.target.value)}
              placeholder="เช่น 20"
              className="w-full px-4 py-3 rounded-xl border border-pink-200 text-sm font-bold text-pink-700 focus:outline-none focus:border-pink-400"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-2 mt-auto">
            <button onClick={onSubmit} disabled={adding || selectedDates.length === 0}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-400 to-rose-400 text-white text-sm font-bold shadow hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50">
              {adding ? 'กำลังเพิ่ม...' : `เพิ่ม ${selectedDates.length > 0 ? selectedDates.length : ''} วัน`}
            </button>
            {selectedDates.length > 0 && (
              <button onClick={onClear}
                className="w-full py-2 rounded-xl border border-pink-200 text-pink-500 text-xs font-bold hover:bg-pink-50 cursor-pointer transition-colors">
                ล้างทั้งหมด
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
