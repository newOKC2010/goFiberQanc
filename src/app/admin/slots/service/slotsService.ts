import { API_BASE_URL, API_ENDPOINTS } from '@/global/globalApi';
import { type PaginationData } from '@/components/pagination/handler/handlerPagination';
import { Slot, LIMIT, EMPTY_PAGINATION } from '../utils/TYPE';

type AuthHeader = { Authorization: string; 'Content-Type': string };

function getAuthHeader(token: string): AuthHeader {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function fetchSlotsApi(token: string, page: number): Promise<{ slots: Slot[]; pagination: PaginationData }> {
  const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
  const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.SLOTS}?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return {
    slots: data.success ? data.data : [],
    pagination: data.pagination ?? EMPTY_PAGINATION,
  };
}

// ดึงทุกวัน (ไม่ paginate) สำหรับ calendar — แยก open/closed
export async function fetchAllSlotDatesApi(token: string): Promise<{ openDates: string[]; closedDates: string[] }> {
  const params = new URLSearchParams({ page: '1', limit: '9999' });
  const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.SLOTS}?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!data.success) return { openDates: [], closedDates: [] };
  const slots = data.data as Slot[];
  return {
    openDates: slots.filter(s => s.is_active).map(s => s.slot_date),
    closedDates: slots.filter(s => !s.is_active).map(s => s.slot_date),
  };
}

export async function bulkAddSlotsApi(token: string, slotDates: string[], maxQueue: number) {
  const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.SLOTS_BULK}`, {
    method: 'POST',
    headers: getAuthHeader(token),
    body: JSON.stringify({ slot_dates: slotDates, max_queue: maxQueue }),
  });
  return res.json();
}

export async function editSlotMaxQueueApi(token: string, id: number, maxQueue: number) {
  const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.SLOTS}/${id}`, {
    method: 'PUT',
    headers: getAuthHeader(token),
    body: JSON.stringify({ max_queue: maxQueue }),
  });
  return res.json();
}

export async function toggleSlotApi(token: string, id: number, isActive: boolean) {
  const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.SLOTS_TOGGLE}`, {
    method: 'POST',
    headers: getAuthHeader(token),
    body: JSON.stringify({ id, is_active: isActive }),
  });
  return res.json();
}
