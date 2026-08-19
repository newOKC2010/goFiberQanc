import { type Lang } from '@/global/translations';

export type Slot = { id: number; slot_date: string; max_queue: number; booked: number; available: number };
export type IdType = 'cid' | 'passport';
export type Step = 'slots' | 'form' | 'success';
export type BookingResult = { booking_id: number; queue_no: number };

export type BookingForm = {
  cid: string; passport_no: string; full_name: string; phone: string;
  rights_type: string; is_first_pregnancy: boolean;
  previous_births: number; previous_miscarriages: number;
  lmp_date: string; has_prior_anc: boolean; diseases: string; note: string;
};

export const getRightsOptions = (lang: Lang) => [
  { value: 'บัตรทอง',           label: lang === 'th' ? 'บัตรทอง'           : 'Universal Coverage' },
  { value: 'ประกันสังคม',       label: lang === 'th' ? 'ประกันสังคม'       : 'Social Security' },
  { value: 'ข้าราชการ',         label: lang === 'th' ? 'ข้าราชการ'         : 'Government Officer' },
  { value: 'ชำระเงินเอง',       label: lang === 'th' ? 'ชำระเงินเอง'       : 'Self-Pay' },
  { value: 'ต่างด้าว / Foreigner', label: lang === 'th' ? 'ต่างด้าว / Foreigner' : 'Foreigner' },
];

export const INIT_FORM: BookingForm = {
  cid: '', passport_no: '', full_name: '', phone: '',
  rights_type: '', is_first_pregnancy: true,
  previous_births: 0, previous_miscarriages: 0,
  lmp_date: '', has_prior_anc: false, diseases: '', note: '',
};
