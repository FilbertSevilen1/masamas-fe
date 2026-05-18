'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Package, Tag, ShoppingBag, CreditCard, TrendingUp, Users } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ products: 0, categories: 0, orders: 0, payments: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/products?limit=1').then(r => r.data.total || 0).catch(() => 0),
      api.get('/categories').then(r => r.data.length || 0).catch(() => 0),
      api.get('/orders').then(r => r.data.length || 0).catch(() => 0),
      api.get('/payments').then(r => r.data.length || 0).catch(() => 0),
    ]).then(([products, categories, orders, payments]) => {
      setStats({ products, categories, orders, payments });
    });
  }, []);

  const cards = [
    { label: 'Total Produk', value: stats.products, icon: Package, href: '/admin/products', color: 'bg-blue-500' },
    { label: 'Kategori', value: stats.categories, icon: Tag, href: '/admin/categories', color: 'bg-purple-500' },
    { label: 'Pesanan Masuk', value: stats.orders, icon: ShoppingBag, href: '/admin/orders', color: 'bg-primary' },
    { label: 'Menunggu Verifikasi', value: stats.payments, icon: CreditCard, href: '/admin/payments', color: 'bg-green-500' },
  ];

  const menuItems = [
    { href: '/admin/products', icon: Package, label: 'Kelola Produk', desc: 'Tambah, edit, hapus produk' },
    { href: '/admin/categories', icon: Tag, label: 'Kelola Kategori', desc: 'Atur kategori produk' },
    { href: '/admin/orders', icon: ShoppingBag, label: 'Kelola Pesanan', desc: 'Lihat dan update status pesanan' },
    { href: '/admin/payments', icon: CreditCard, label: 'Verifikasi Pembayaran', desc: 'Review bukti transfer masuk' },
    { href: '/admin/cms', icon: TrendingUp, label: 'CMS Landing Page', desc: 'Edit konten halaman utama' },
    { href: '/admin/users', icon: Users, label: 'Manajemen Pengguna', desc: 'Lihat daftar pengguna' },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="px-6 py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-charcoal">Dashboard Admin</h1>
          <p className="text-gray-500 mt-1">Selamat datang di panel administrasi Masamas</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {cards.map((card, i) => (
            <Link key={i} href={card.href} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition group">
              <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
                <card.icon size={22} className="text-white" />
              </div>
              <p className="text-3xl font-bold text-charcoal">{card.value}</p>
              <p className="text-gray-500 text-sm mt-1">{card.label}</p>
            </Link>
          ))}
        </div>

        {/* Menu Grid */}
        <h2 className="text-xl font-bold text-charcoal mb-5">Menu Admin</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {menuItems.map((item, i) => (
            <Link key={i} href={item.href} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-transparent hover:border-primary/20 transition group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary transition">
                  <item.icon size={22} className="text-primary group-hover:text-white transition" />
                </div>
                <div>
                  <p className="font-bold text-charcoal">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

