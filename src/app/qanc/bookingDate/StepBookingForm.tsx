'use client';

import { InputText } from '@/components/input/text/mainInputText';
import Dropdown from '@/components/dropdown/mainDropdown';
import HeaderFiltersDate from '@/components/dataPicker/headerFiltersDate';
import { type Lang } from '@/global/translations';
import { type IdType, type BookingForm, type Slot, getRightsOptions } from './types';

interface Props {
  lang: Lang;
  slot: Slot;
  form: BookingForm;
  idType: IdType;
  loading: boolean;
  setF: (patch: Partial<BookingForm>) => void;
  setIdType: (v: IdType) => void;
  onBack: () => void;
  onSubmit: () => void;
}

const formatDate = (dateStr: string, lang: Lang) =>
  new Date(dateStr).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

const BoolToggle = ({ value, onChange, trueLabel, falseLabel }: {
  value: boolean; onChange: (v: boolean) => void; trueLabel: string; falseLabel: string;
}) => (
  <div className="flex gap-2">
    {[true, false].map(v => (
      <button key={String(v)} onClick={() => onChange(v)}
        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer ${
          value === v ? 'bg-sky-400 text-white border-sky-400' : 'bg-white text-gray-400 border-gray-200 hover:border-sky-300'
        }`}
      >
        {v ? trueLabel : falseLabel}
      </button>
    ))}
  </div>
);

export function StepBookingForm({ lang, slot, form, idType, loading, setF, setIdType, onBack, onSubmit }: Props) {
  return (
    <div className="space-y-4">
      {/* Selected date */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-center">
        <p className="text-xs text-sky-400 font-bold">{lang === 'th' ? 'วันที่เลือก' : 'Selected Date'}</p>
        <p className="text-sky-600 font-bold text-sm mt-0.5">{formatDate(slot.slot_date, lang)}</p>
      </div>

      {/* ID type toggle */}
      <div className="flex gap-2">
        {(['cid', 'passport'] as IdType[]).map(v => (
          <button key={v} onClick={() => setIdType(v)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer ${
              idType === v ? 'bg-sky-400 text-white border-sky-400' : 'bg-white text-gray-400 border-gray-200 hover:border-sky-300'
            }`}
          >
            {v === 'cid' ? (lang === 'th' ? 'บัตรประชาชน' : 'Thai ID') : 'Passport'}
          </button>
        ))}
      </div>

      {idType === 'cid' ? (
        <InputText
          label={lang === 'th' ? 'เลขบัตรประชาชน 13 หลัก *' : 'Thai ID (13 digits) *'}
          maxWidth="full" icon="badge" maxLength={13}
          value={form.cid} placeholder="1234567890123"
          onChange={e => setF({ cid: e.target.value.replace(/\D/g, '') })}
        />
      ) : (
        <InputText
          label={lang === 'th' ? 'เลข Passport *' : 'Passport No. *'}
          maxWidth="full" icon="travel_explore"
          value={form.passport_no} placeholder="AB1234567"
          onChange={e => setF({ passport_no: e.target.value })}
        />
      )}

      <InputText
        label={lang === 'th' ? 'ชื่อ-นามสกุล *' : 'Full Name *'}
        maxWidth="full" icon="person"
        value={form.full_name} placeholder={lang === 'th' ? 'สมหญิง ใจดี' : 'Jane Doe'}
        onChange={e => setF({ full_name: e.target.value })}
      />

      <InputText
        label={lang === 'th' ? 'เบอร์โทรศัพท์ *' : 'Phone *'}
        maxWidth="full" icon="phone" maxLength={10}
        value={form.phone} placeholder="0812345678"
        onChange={e => setF({ phone: e.target.value.replace(/\D/g, '') })}
      />

      <Dropdown
        label={lang === 'th' ? 'สิทธิ์การรักษา *' : 'Rights Type *'}
        icon="verified_user" required inModal
        options={getRightsOptions(lang)} value={form.rights_type}
        placeholder={lang === 'th' ? '-- เลือกสิทธิ์ --' : '-- Select --'}
        onChange={v => setF({ rights_type: v })}
      />

      <HeaderFiltersDate
        label={lang === 'th' ? 'วันประจำเดือนครั้งล่าสุด (LMP) *' : 'Last Menstrual Period (LMP) *'}
        placeholder={lang === 'th' ? 'เลือกวันที่' : 'Select date'}
        selectedDate={form.lmp_date}
        onDateChange={v => setF({ lmp_date: v })}
        lang={lang}
      />

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          {lang === 'th' ? 'ครรภ์แรก?' : 'First Pregnancy?'}
        </label>
        <BoolToggle
          value={form.is_first_pregnancy} onChange={v => setF({ is_first_pregnancy: v })}
          trueLabel={lang === 'th' ? 'ใช่' : 'Yes'} falseLabel={lang === 'th' ? 'ไม่ใช่' : 'No'}
        />
      </div>

      {!form.is_first_pregnancy && (
        <div className="grid grid-cols-2 gap-3">
          <InputText
            label={lang === 'th' ? 'คลอดแล้ว (ครั้ง)' : 'Previous Births'}
            maxWidth="full" type="number"
            value={form.previous_births}
            onChange={e => setF({ previous_births: parseInt(e.target.value) || 0 })}
          />
          <InputText
            label={lang === 'th' ? 'แท้ง (ครั้ง)' : 'Miscarriages'}
            maxWidth="full" type="number"
            value={form.previous_miscarriages}
            onChange={e => setF({ previous_miscarriages: parseInt(e.target.value) || 0 })}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          {lang === 'th' ? 'เคยฝากครรภ์ที่อื่นมาก่อน?' : 'Prior ANC elsewhere?'}
        </label>
        <BoolToggle
          value={form.has_prior_anc} onChange={v => setF({ has_prior_anc: v })}
          trueLabel={lang === 'th' ? 'เคย' : 'Yes'} falseLabel={lang === 'th' ? 'ไม่เคย' : 'No'}
        />
      </div>

      <InputText
        label={lang === 'th' ? 'โรคประจำตัว (ถ้ามี)' : 'Underlying Disease (optional)'}
        maxWidth="full" icon="medical_information"
        value={form.diseases} placeholder={lang === 'th' ? 'เช่น เบาหวาน, ความดัน' : 'e.g. Diabetes, Hypertension'}
        onChange={e => setF({ diseases: e.target.value })}
      />

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          {lang === 'th' ? 'หมายเหตุ (ถ้ามี)' : 'Notes (optional)'}
        </label>
        <textarea value={form.note} onChange={e => setF({ note: e.target.value })} rows={2}
          placeholder={lang === 'th' ? 'เช่น ต้องการพบแพทย์เฉพาะทาง' : 'e.g. Request specialist'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 focus:outline-none focus:border-sky-400 resize-none" />
      </div>

      <div className="flex gap-3 pt-1">
        <button onClick={onBack}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-400 text-sm font-bold hover:bg-gray-50 transition-all cursor-pointer">
          {lang === 'th' ? '← กลับ' : '← Back'}
        </button>
        <button onClick={onSubmit} disabled={loading}
          className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-400 text-white text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-60">
          {loading ? (lang === 'th' ? 'กำลังจอง...' : 'Booking...') : (lang === 'th' ? 'ยืนยันการจอง' : 'Confirm Booking')}
        </button>
      </div>
    </div>
  );
}
