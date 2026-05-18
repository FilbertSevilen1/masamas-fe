import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
