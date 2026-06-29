'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingBag,
  CreditCard,
  FileEdit,
  Users,
  LogOut,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Produk', icon: Package },
  { href: '/admin/categories', label: 'Kategori', icon: Tag },
  { href: '/admin/orders', label: 'Pesanan', icon: ShoppingBag },
  { href: '/admin/payments', label: 'Pembayaran', icon: CreditCard },
  { href: '/admin/users', label: 'Pengguna', icon: Users },
  { href: '/admin/cms', label: 'CMS Landing Page', icon: FileEdit },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { name, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/30">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <div>
            <span className="text-white font-bold text-lg tracking-tight">
              MASA<span className="text-primary">MAS</span>
            </span>
            <p className="text-gray-500 text-xs">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-grow px-3 py-5 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all group ${
                active
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={19} className={active ? 'text-white' : 'text-gray-500 group-hover:text-white transition'} />
              <span className="flex-grow">{item.label}</span>
              {active && <ChevronRight size={15} className="text-white/70" />}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-sm">
            {name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="flex-grow min-w-0">
            <p className="text-white text-sm font-semibold truncate">{name || 'Admin'}</p>
            <p className="text-gray-500 text-xs">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
        >
          <LogOut size={17} />
          Keluar
        </button>
        <Link
          href="/"
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition mt-1"
        >
          ← Kembali ke Website
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-charcoal h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-charcoal border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">M</span>
          </div>
          <span className="text-white font-bold text-lg">MASA<span className="text-primary">MAS</span></span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white p-1">
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-72 bg-charcoal h-full">
            <SidebarContent />
          </div>
          <div className="flex-grow bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  );
}
