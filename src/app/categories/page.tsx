'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import api from '@/lib/api';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Category {
  id: number; name: string; slug: string; image: string | null;
  _count: { products: number };
}

const EASE = [0.22, 1, 0.36, 1] as const;

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden relative">
      {/* Subtle premium green dot grid background pattern */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, #059669 1.5px, transparent 1.5px)',
        backgroundSize: '32px 32px'
      }} />
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-primary/[0.015] to-white pointer-events-none" />

      <Navbar />

      {/* ── HERO / HEADER ── */}
      <section className="bg-charcoal text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1600" alt="bg" className="w-full h-full object-cover" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
            className="text-primary font-bold uppercase tracking-widest text-sm mb-4">Kategori Produk</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.22 }}
            className="text-5xl font-bold mb-6">Belanja per Kategori</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.38 }}
            className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
            Temukan berbagai macam material bangunan berkualitas premium yang dikelompokkan berdasarkan kategori konstruksi untuk mempermudah pencarian Anda.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.5 }}
            className="flex justify-center items-center space-x-2 text-sm text-gray-400 mt-6 bg-white/5 backdrop-blur-md px-4 py-2.5 rounded-2xl w-fit mx-auto border border-white/10 shadow-lg">
            <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1.5 font-medium">Beranda</Link>
            <span>/</span>
            <span className="text-white font-medium">Kategori</span>
          </motion.div>
        </div>
      </section>

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
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {categories.map((cat) => (
              <motion.div
                key={cat.id}
                variants={staggerItem}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group relative rounded-2xl overflow-hidden aspect-square bg-charcoal shadow-sm hover:shadow-xl transition-shadow duration-300"
              >
                <Link href={`/products?category=${cat.slug}`} className="block w-full h-full">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-charcoal via-charcoal/95 to-primary/25 flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-700">
                      {/* Blueprint grid lines */}
                      <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                      }} />
                      {/* Glowing ambient light */}
                      <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-colors" />
                      <span className="text-5xl drop-shadow-lg relative z-10 animate-pulse">🏗️</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-white font-bold text-lg leading-tight">{cat.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-gray-300 text-sm">{cat._count.products} Produk</p>
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center transform group-hover:translate-x-1 transition-transform">
                        <ArrowRight size={16} className="text-white" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <Footer />
    </main>
  );
}

