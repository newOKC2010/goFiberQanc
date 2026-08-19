'use client';

import { type Lang } from '@/global/translations';
import { type BookingResult, type Slot } from './types';

interface Props {
  lang: Lang;
  result: BookingResult;
  slot: Slot;
  onClose: () => void;
}

const formatDate = (dateStr: string, lang: Lang) =>
  new Date(dateStr).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

export function StepSuccess({ lang, result, slot, onClose }: Props) {
  return (
    <div className="text-center space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 space-y-3">
        <p className="text-green-500 font-bold">
          {lang === 'th' ? 'จองคิวสำเร็จ!' : 'Booking Successful!'}
        </p>
        <div className="space-y-2 text-sm font-bold">
          <div className="flex justify-between">
            <span className="text-gray-400">{lang === 'th' ? 'วันที่' : 'Date'}</span>
            <span className="text-gray-700">{formatDate(slot.slot_date, lang)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">{lang === 'th' ? 'เลขคิว' : 'Queue No.'}</span>
            <span className="text-3xl text-sky-500 font-bold">{result.queue_no}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">{lang === 'th' ? 'รหัสการจอง' : 'Booking ID'}</span>
            <span className="text-gray-700">#{result.booking_id}</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 font-bold">
        {lang === 'th' ? '* กรุณาจดหมายเลขคิวและมาตรงเวลา' : '* Please note your queue number and arrive on time'}
      </p>

      <button onClick={onClose}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-400 text-white font-bold shadow-md hover:shadow-lg transition-all cursor-pointer">
        {lang === 'th' ? 'เสร็จสิ้น' : 'Done'}
      </button>
    </div>
  );
}
