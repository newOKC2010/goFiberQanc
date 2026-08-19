'use client';

import { type Slot } from './types';
import { type Lang } from '@/global/translations';

interface Props {
  slots: Slot[];
  loading: boolean;
  lang: Lang;
  onSelect: (slot: Slot) => void;
}

const formatDate = (dateStr: string, lang: Lang) =>
  new Date(dateStr).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

export function StepSlots({ slots, loading, lang, onSelect }: Props) {
  if (loading) return (
    <p className="text-center text-gray-400 py-8 font-bold">
      {lang === 'th' ? 'กำลังโหลด...' : 'Loading...'}
    </p>
  );

  if (slots.length === 0) return (
    <p className="text-center text-gray-400 py-8 font-bold">
      {lang === 'th' ? 'ยังไม่มีวันเปิดให้จองขณะนี้' : 'No available dates at this time'}
    </p>
  );

  return (
    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
      {slots.map(slot => (
        <button
          key={slot.id}
          onClick={() => onSelect(slot)}
          disabled={slot.available === 0}
          className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200 ${
            slot.available === 0
              ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
              : 'bg-sky-50 border-sky-200 hover:bg-sky-100 hover:border-sky-400 hover:scale-[1.01] cursor-pointer'
          }`}
        >
          <div>
            <p className="font-bold text-gray-700 text-sm">{formatDate(slot.slot_date, lang)}</p>
            <p className="text-xs text-gray-400 mt-0.5 font-bold">
              {lang === 'th'
                ? `ว่าง ${slot.available} / ${slot.max_queue} คิว`
                : `${slot.available} / ${slot.max_queue} slots available`}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            slot.available === 0 ? 'bg-red-100 text-red-400' : 'bg-sky-200 text-sky-600'
          }`}>
            {slot.available === 0
              ? (lang === 'th' ? 'เต็ม' : 'Full')
              : (lang === 'th' ? 'จองได้' : 'Available')}
          </span>
        </button>
      ))}
    </div>
  );
}
