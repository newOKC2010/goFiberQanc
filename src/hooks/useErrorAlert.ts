'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { showAlert } from '@/global/globalSwal';

export function useErrorAlert() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const error = searchParams.get('error');
    
    if (error) {
      switch (error) {
        case 'no_token':
          showAlert('กรุณาเข้าสู่ระบบ', 'ยังไม่มี Token หรือ Token หมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง', 'warning');
          break;
        case 'auth_failed':
          showAlert('สิทธิ์การเข้าถึงหมดอายุ', 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง', 'warning');
          break;
        case 'no_permission':
          showAlert('ไม่มีสิทธิ์', 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้ เฉพาะผู้ดูแลระบบเท่านั้น', 'error');
          break;
        case 'network_error':
          showAlert('ข้อผิดพลาดเครือข่าย', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error');
          break;
        default:
          showAlert('เกิดข้อผิดพลาด', 'กรุณาลองใหม่อีกครั้ง', 'error');
      }
      
      // ลบ error parameter จาก URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('error');
      router.replace(newUrl.pathname + newUrl.search, { scroll: false });
    }
  }, [searchParams, router]);
}