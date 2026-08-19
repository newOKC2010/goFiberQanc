'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar/mainSidebar';
import { checkAuth, type AdminUser } from '@/global/globalAuth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth().then(({ success, user }) => {
      if (!success) { router.replace('/auth'); return; }
      setUser(user ?? null);
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <span className="material-symbols-outlined animate-spin text-4xl text-pink-400">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-pink-50/60 overflow-hidden">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
