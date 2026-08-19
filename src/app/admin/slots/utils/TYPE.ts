import { type PaginationData } from '@/components/pagination/handler/handlerPagination';

export type Slot = {
  id: number;
  slot_date: string;
  max_queue: number;
  booked: number;
  is_active: boolean;
};

export const LIMIT = 10;
export const EMPTY_PAGINATION: PaginationData = { count: 0, total_count: 0, total_pages: 1, current_page: 1 };
