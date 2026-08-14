import { verifyOtp } from '@/app/auth/verify/service/serviceVerify';
import { showToast } from '@/global/globalSwal';
import { AuthToken, UserInfoStorage } from '@/global/globalAuth';

export const handleVerifyOtp = async (email: string, otp: string) => {
  try {
    const data = await verifyOtp(email, otp);
    
    if (data.token) {
      AuthToken.storeToken(data.token);
    }

    if (data.user_info) {
      UserInfoStorage.store(data.user_info);
    }
    
    showToast(data.message || 'ยืนยัน OTP สำเร็จ', 'success');
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ไม่สามารถยืนยัน OTP ได้';
    showToast(message, 'error');
    return { success: false, error: message };
  }
};
