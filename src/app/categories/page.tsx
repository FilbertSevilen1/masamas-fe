'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import api from '@/lib/api';
import { ArrowRight } from 'lucide-react';

interface Category {
  id: number; name: string; slug: string; image: string | null;
  _count: { products: number };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="bg-charcoal text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Semua Kategori</h1>
          <p className="text-gray-400">Temukan produk berdasarkan kategori konstruksi</p>
          <div className="flex items-center space-x-2 text-sm text-gray-500 mt-3">
            <Link href="/" className="hover:text-primary">Beranda</Link>
            <span>/</span>
            <span className="text-white">Kategori</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <div key={i} className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />)}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-2xl font-bold">Belum ada kategori</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map(cat => (
              <Link key={cat.id} href={`/products?category=${cat.slug}`} className="group relative rounded-2xl overflow-hidden aspect-square bg-charcoal shadow-sm hover:shadow-xl transition-all duration-300">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-60" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-charcoal to-charcoal-light flex items-center justify-center text-6xl">🏗️</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-white font-bold text-lg leading-tight">{cat.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-gray-300 text-sm">{cat._count.products} Produk</p>
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <ArrowRight size={16} className="text-white" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
