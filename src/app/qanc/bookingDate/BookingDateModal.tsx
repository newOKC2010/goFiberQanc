'use client';

import { Modal } from '@/components/modal/mainModal';
import { useBookingModal } from './useBookingModal';
import { StepSlots } from './StepSlots';
import { StepBookingForm } from './StepBookingForm';
import { StepSuccess } from './StepSuccess';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const MODAL_ICON: Record<string, string> = {
  slots: 'calendar_month',
  form: 'edit_note',
  success: 'check_circle',
};

export function BookingDateModal({ isOpen, onClose }: Props) {
  const bm = useBookingModal(isOpen);

  const modalTitle =
    bm.step === 'slots'   ? (bm.lang === 'th' ? 'วันที่เปิดรับจอง' : 'Available Dates') :
    bm.step === 'form'    ? (bm.lang === 'th' ? 'กรอกข้อมูลการจอง' : 'Booking Details') :
                            (bm.lang === 'th' ? 'จองคิวสำเร็จ!' : 'Booking Confirmed!');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      wrapperClassName={bm.step === 'form' ? 'max-w-xl' : 'max-w-md'}
      title={modalTitle}
      icon={
        <span
          className={`material-symbols-outlined text-3xl ${bm.step === 'success' ? 'text-green-400' : 'text-sky-400'}`}
          style={{ fontVariationSettings: "'wght' 700" }}
        >
          {MODAL_ICON[bm.step]}
        </span>
      }
    >
      {bm.step === 'slots' && (
        <StepSlots
          slots={bm.slots}
          loading={bm.loading}
          lang={bm.lang}
          onSelect={bm.handleSelectSlot}
        />
      )}

      {bm.step === 'form' && bm.selectedSlot && (
        <StepBookingForm
          lang={bm.lang}
          slot={bm.selectedSlot}
          form={bm.form}
          idType={bm.idType}
          loading={bm.loading}
          setF={bm.setF}
          setIdType={bm.setIdType}
          onBack={() => bm.setStep('slots')}
          onSubmit={bm.handleSubmit}
        />
      )}

      {bm.step === 'success' && bm.result && bm.selectedSlot && (
        <StepSuccess
          lang={bm.lang}
          result={bm.result}
          slot={bm.selectedSlot}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}
