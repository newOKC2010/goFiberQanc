'use client';

import { useState, useEffect } from 'react';
import { useLang } from '@/global/globalLang';
import { API_BASE_URL, API_ENDPOINTS } from '@/global/globalApi';
import { showAlert } from '@/global/globalSwal';
import { type Slot, type IdType, type Step, type BookingForm, type BookingResult, INIT_FORM } from './types';

export function useBookingModal(isOpen: boolean) {
  const { lang } = useLang();

  const [step, setStep] = useState<Step>('slots');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [idType, setIdType] = useState<IdType>('cid');
  const [form, setForm] = useState<BookingForm>(INIT_FORM);
  const [result, setResult] = useState<BookingResult | null>(null);

  const setF = (patch: Partial<BookingForm>) => setForm(f => ({ ...f, ...patch }));

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

  // fetch slots เมื่อ modal เปิดครั้งแรก
  useEffect(() => {
    if (!isOpen || fetched) return;
    const fetchSlots = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.QANC.SLOTS}`, {
        headers: { 'Accept-Language': lang },
      });
        const data = await res.json();
        setSlots(data.success ? (data.data ?? []) : []);
        setFetched(true);
      } catch {
        showAlert(
          lang === 'th' ? 'เกิดข้อผิดพลาด' : 'Error',
          lang === 'th' ? 'ไม่สามารถโหลดข้อมูลได้' : 'Unable to load data',
          'error', {}, undefined, lang
        );
      }
      setLoading(false);
    };
    fetchSlots();
  }, [isOpen, fetched, lang]);

  // reset state หลัง modal ปิด (รอ animation จบ)
  useEffect(() => {
    if (isOpen) return;
    const timer = setTimeout(() => {
      setStep('slots');
      setSelectedSlot(null);
      setForm(INIT_FORM);
      setResult(null);
      setFetched(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleSelectSlot = (slot: Slot) => {
    setSelectedSlot(slot);
    setStep('form');
  };

  const handleSubmit = async () => {
    if (!selectedSlot) return;

    const requiredFilled = form.full_name && form.phone && form.rights_type && form.lmp_date;
    const idValid = idType === 'cid' ? form.cid.length === 13 : form.passport_no.length > 0;

    if (!requiredFilled) {
      showAlert(lang === 'th' ? 'กรุณากรอกข้อมูลให้ครบ' : 'Please fill all required fields', '', 'warning', {}, undefined, lang);
      return;
    }
    if (!idValid) {
      showAlert(
        lang === 'th' ? 'ข้อมูลตัวตนไม่ถูกต้อง' : 'Invalid identity',
        lang === 'th'
          ? (idType === 'cid' ? 'กรุณากรอกเลขบัตรประชาชน 13 หลัก' : 'กรุณากรอกเลข Passport')
          : (idType === 'cid' ? 'ID must be 13 digits' : 'Enter passport number'),
        'warning', {}, undefined, lang
      );
      return;
    }

    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        slot_date: selectedSlot.slot_date,
        full_name: form.full_name,
        phone: form.phone,
        rights_type: form.rights_type,
        is_first_pregnancy: form.is_first_pregnancy,
        previous_births: form.is_first_pregnancy ? 0 : form.previous_births,
        previous_miscarriages: form.previous_miscarriages,
        lmp_date: form.lmp_date,
        has_prior_anc: form.has_prior_anc,
        diseases: form.diseases ? [form.diseases] : [],
        note: form.note,
      };
      if (idType === 'cid') body.cid = form.cid;
      else body.passport_no = form.passport_no;

      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.QANC.BOOKING}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept-Language': lang },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        setResult({ booking_id: data.booking_id, queue_no: data.queue_no });
        setStep('success');
      } else {
        showAlert(lang === 'th' ? 'จองไม่สำเร็จ' : 'Booking Failed', data.message ?? '', 'error', {}, undefined, lang);
      }
    } catch {
      showAlert(lang === 'th' ? 'เกิดข้อผิดพลาด' : 'Error', '', 'error', {}, undefined, lang);
    }
    setLoading(false);
  };

  return {
    lang, step, setStep,
    slots, selectedSlot,
    loading, idType, setIdType,
    form, setF,
    result, formatDate,
    handleSelectSlot, handleSubmit,
  };
}
