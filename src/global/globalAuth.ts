import { API_BASE_URL, API_ENDPOINTS } from '@/global/globalApi';

export const USER_ROLES = {
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const;

export interface AdminUser {
  id: number;
  email: string;
  role: string;
}

export type UserViewLabInfo = AdminUser;

function parseTimeToSeconds(time: string): number {
  const value = parseInt(time);
  const unit = time.slice(-1);
  
  if (unit === 'm') return value * 60;
  if (unit === 'h') return value * 3600;
  if (unit === 'd') return value * 86400;
  
  return 86400;
}

export class AuthToken {
  private static key = 'auth_token';
  private static getMaxAge = () => {
    const envTime = process.env.NEXT_PUBLIC_TOKEN_EXPIRE || '1d';
    return parseTimeToSeconds(envTime);
  };
  
  static storeToken = (token: string) => {
    document.cookie = `${this.key}=${token}; path=/; max-age=${this.getMaxAge()}`;
  };
  
  static getToken = () => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith(`${this.key}=`))
      ?.split('=')[1];
  };
  
  static removeToken = () => {
    document.cookie = `${this.key}=; path=/; max-age=0`;
  };
}

export class UserInfoStorage {
  private static key = 'user_info';

  static store = (user: AdminUser) => {
    localStorage.setItem(this.key, JSON.stringify(user));
  };

  static get = (): AdminUser | null => {
    const raw = localStorage.getItem(this.key);
    return raw ? JSON.parse(raw) : null;
  };

  static remove = () => {
    localStorage.removeItem(this.key);
  };
}

export function logout() {
  AuthToken.removeToken();
  UserInfoStorage.remove();
}

export async function checkAuth(): Promise<{ success: boolean; user?: AdminUser; message?: string }> {
  const token = AuthToken.getToken();
  if (!token) {
    return { success: false, message: 'ไม่พบ token' };
  }

  try {
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.SLOTS}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!res.ok) {
      logout();
      return { success: false, message: 'token หมดอายุหรือไม่มีสิทธิ์เข้าถึง' };
    }

    const user = UserInfoStorage.get();
    return { success: true, user: user ?? undefined };
  } catch {
    return { success: false, message: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์' };
  }
}