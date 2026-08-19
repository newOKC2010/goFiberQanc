export const formatDate = (d: string): string =>
  new Date(d).toLocaleDateString('th-TH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

export const formatShortDate = (d: string): string =>
  new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });

export const toggleDate = (prev: string[], date: string): string[] =>
  prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date];

export const buildBulkSuccessMsg = (
  message: string,
  results: { success: boolean; slot_date: string }[]
): string => {
  const failed = results.filter(r => !r.success);
  return failed.length > 0 ? `${message} (ซ้ำ: ${failed.map(r => r.slot_date).join(', ')})` : message;
};
