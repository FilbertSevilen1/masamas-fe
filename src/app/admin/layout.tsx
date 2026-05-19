'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAuthStore } from '@/store/useAuthStore';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { init } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Hydrate store from localStorage
    init();
    
    // Give zustand state 100ms to settle, then verify auth
    const timer = setTimeout(() => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');

      if (!token || role !== 'ADMIN') {
        router.replace('/login');
      } else {
        setChecking(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [init, router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-charcoal flex flex-col items-center justify-center text-white p-6">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-primary font-bold text-xs">M</span>
          </div>
        </div>
        <p className="text-gray-400 font-medium animate-pulse text-sm">Memverifikasi Hak Akses Admin...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      {/* Main content — offset for mobile top bar, fills remaining width */}
      <main className="flex-grow min-w-0 lg:pt-0 pt-14 overflow-auto">
        {children}
      </main>
    </div>
  );
}
