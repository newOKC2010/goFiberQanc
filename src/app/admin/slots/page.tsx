'use client';

import { useEffect, useState, useCallback } from 'react';
import { AuthToken } from '@/global/globalAuth';
import { showAlert, showConfirm } from '@/global/globalSwal';
import Pagination from '@/components/pagination/mainPagination';
import { type PaginationData } from '@/components/pagination/handler/handlerPagination';

import { Slot, EMPTY_PAGINATION } from './utils/TYPE';
import { fetchSlotsApi, fetchAllSlotDatesApi, bulkAddSlotsApi, editSlotMaxQueueApi, toggleSlotApi } from './service/slotsService';
import { toggleDate, buildBulkSuccessMsg, formatDate } from './handler/handlerSlots';
import SlotAddForm from './handler/SlotAddForm';
import SlotList from './handler/SlotList';

export default function AdminSlotsPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [openDates, setOpenDates] = useState<string[]>([]);
  const [closedDates, setClosedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>(EMPTY_PAGINATION);

  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [newMax, setNewMax] = useState('');
  const [adding, setAdding] = useState(false);

  const [editId, setEditId] = useState<number | null>(null);
  const [editMax, setEditMax] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const token = AuthToken.getToken() ?? '';

  const refreshAllDates = useCallback(async () => {
    const { openDates, closedDates } = await fetchAllSlotDatesApi(token);
    setOpenDates(openDates);
    setClosedDates(closedDates);
  }, [token]);

  const fetchSlots = useCallback(async (p = page) => {
    setLoading(true);
    const result = await fetchSlotsApi(token, p);
    setSlots(result.slots);
    setPagination(result.pagination);
    setLoading(false);
  }, [token, page]);

  useEffect(() => { fetchSlots(page); }, [page]); // eslint-disable-line
  useEffect(() => { refreshAllDates(); }, []); // eslint-disable-line

  const handleBulkAdd = async () => {
    if (selectedDates.length === 0) { showAlert('ข้อมูลไม่ครบ', 'กรุณาเลือกอย่างน้อย 1 วัน', 'warning'); return; }
    if (!newMax || parseInt(newMax) <= 0) { showAlert('ข้อมูลไม่ครบ', 'กรุณาระบุจำนวนคิว', 'warning'); return; }
    setAdding(true);
    const data = await bulkAddSlotsApi(token, selectedDates, parseInt(newMax));
    if (data.success) {
      showAlert('สำเร็จ', buildBulkSuccessMsg(data.message, data.results), 'success');
      setSelectedDates([]); setNewMax('');
      fetchSlots(); refreshAllDates();
    } else {
      showAlert('ผิดพลาด', data.message ?? '', 'error');
    }
    setAdding(false);
  };

  const handleEditSave = async (id: number) => {
    if (!editMax || parseInt(editMax) <= 0) return;
    setEditLoading(true);
    const data = await editSlotMaxQueueApi(token, id, parseInt(editMax));
    if (data.success) { setEditId(null); fetchSlots(); }
    else showAlert('ผิดพลาด', data.message ?? '', 'error');
    setEditLoading(false);
  };

  const handleToggle = async (slot: Slot) => {
    const ok = await showConfirm(
      `ยืนยันการ${slot.is_active ? 'ปิด' : 'เปิด'}รับจองวันที่ ${formatDate(slot.slot_date)}?`,
      {}, undefined, { confirm: 'ยืนยัน', cancel: 'ยกเลิก' }
    );
    if (!ok) return;
    const data = await toggleSlotApi(token, slot.id, !slot.is_active);
    if (data.success) { fetchSlots(); refreshAllDates(); }
    else showAlert('ผิดพลาด', data.message ?? '', 'error');
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">จัดการวันเปิดจอง</h1>

      <SlotAddForm
        selectedDates={selectedDates}
        existingDates={openDates}
        closedDates={closedDates}
        newMax={newMax}
        adding={adding}
        onToggle={d => setSelectedDates(prev => toggleDate(prev, d))}
        onMaxChange={setNewMax}
        onSubmit={handleBulkAdd}
        onClear={() => setSelectedDates([])}
      />

      <div className="bg-pink-50 rounded-2xl shadow-sm border border-pink-100 overflow-hidden">
        <SlotList
          slots={slots}
          loading={loading}
          editId={editId}
          editMax={editMax}
          editLoading={editLoading}
          onEditStart={(id, max) => { setEditId(id); setEditMax(String(max)); }}
          onEditCancel={() => setEditId(null)}
          onEditMaxChange={setEditMax}
          onEditSave={handleEditSave}
          onToggle={handleToggle}
        />
      </div>

      <Pagination paginationData={pagination} onPageChange={setPage} loading={loading} />
    </div>
  );
}
