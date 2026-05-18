'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import api from '@/lib/api';
import { ArrowRight, ShoppingCart, CheckCircle, CheckCircle2, X, Award, Truck, Users, Phone } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

interface CmsMap {
  hero_title?: string; hero_subtitle?: string; hero_cta_text?: string;
  hero_badge_1?: string; hero_badge_2?: string; hero_badge_3?: string;
  about_title?: string; about_desc?: string;
  about_point_1_title?: string; about_point_1_desc?: string;
  about_point_2_title?: string; about_point_2_desc?: string;
  about_point_3_title?: string; about_point_3_desc?: string;
  about_stat_years?: string; about_stat_projects?: string;
  cta_title?: string; cta_subtitle?: string; cta_button_text?: string; cta_secondary_text?: string;
}

interface Category {
  id: number; name: string; slug: string; image: string | null;
  _count: { products: number };
}

interface Product {
  id: number; name: string; slug: string; price: string; thumbnail: string | null; stock: number;
  category: { name: string };
}

export default function HomePage() {
  const [cms, setCms] = useState<CmsMap>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCartStore();

  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'warning' }>({
    visible: false,
    message: '',
    type: 'success'
  });

  const triggerSnackbar = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setSnackbar({ visible: true, message, type });
    setTimeout(() => {
      setSnackbar(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  useEffect(() => {
    Promise.all([
      api.get('/cms/map').then(r => setCms(r.data)).catch(() => {}),
      api.get('/categories').then(r => setCategories(r.data.slice(0, 8))).catch(() => {}),
      api.get('/products?limit=8&sort=createdAt').then(r => setProducts(r.data.products)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const heroTitle = cms.hero_title || 'Bangun Masa Depan Anda\nDengan Material Terbaik';
  const heroSubtitle = cms.hero_subtitle || 'Masamas menyediakan material bangunan berkualitas tinggi untuk proyek konstruksi industri dan residensial.';

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      {/* ── HERO ── */}
      <section className="bg-charcoal text-white min-h-[90vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1600&auto=format&fit=crop" alt="bg" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/90 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-24">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 text-primary px-4 py-2 rounded-full text-sm font-bold mb-8 uppercase tracking-widest">
              🏗️ Material Bangunan Terpercaya
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6 whitespace-pre-line">
              {heroTitle.split('\n').map((line, i) => (
                <span key={i}>{i === 1 ? <><br /><span className="text-primary">{line}</span></> : line}<br /></span>
              ))}
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-lg">{heroSubtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products" className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition shadow-xl shadow-primary/30 text-lg">
                {cms.hero_cta_text || 'Lihat Produk Kami'} <ArrowRight size={20} />
              </Link>
              <Link href="/about" className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition border border-white/20 text-lg">
                Pelajari Lebih Lanjut
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 mt-10">
              {[cms.hero_badge_1, cms.hero_badge_2, cms.hero_badge_3].filter(Boolean).map((badge, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle size={16} className="text-primary" /> {badge}
                </div>
              ))}
            </div>
          </div>
          <div className="hidden lg:grid grid-cols-2 gap-4">
            <div className="space-y-4 mt-12">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
                <p className="text-4xl font-bold text-primary">{cms.about_stat_years || '15+'}</p>
                <p className="text-gray-300 mt-1">Tahun Pengalaman</p>
              </div>
              <img src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=500" alt="material" className="rounded-2xl w-full object-cover aspect-video" />
            </div>
            <div className="space-y-4">
              <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=500" alt="site" className="rounded-2xl w-full object-cover aspect-video" />
              <div className="bg-primary rounded-2xl p-6 text-center">
                <p className="text-3xl font-bold">{cms.about_stat_projects || '2.500+'}</p>
                <p className="text-white/80 mt-1">Proyek Terlayani</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SHOP BY CATEGORY ── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="text-primary font-bold uppercase tracking-widest text-sm mb-2">Koleksi Kami</p>
              <h2 className="text-4xl font-bold text-charcoal">Belanja per Kategori</h2>
              <div className="w-20 h-1.5 bg-primary mt-3 rounded-full" />
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-2 text-primary font-bold hover:underline">
              Semua Produk <ArrowRight size={18} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => <div key={i} className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />)}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-xl font-semibold">Belum ada kategori</p>
              <Link href="/admin/categories" className="text-primary hover:underline mt-2 block text-sm">Tambah kategori di Admin</Link>
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-white font-bold text-lg leading-tight">{cat.name}</h3>
                    <p className="text-gray-300 text-sm mt-1">{cat._count.products} Produk</p>
                  </div>
                  <div className="absolute top-4 right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <ArrowRight size={16} className="text-white" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="text-primary font-bold uppercase tracking-widest text-sm mb-2">Pilihan Terbaik</p>
              <h2 className="text-4xl font-bold text-charcoal">Produk Unggulan</h2>
              <div className="w-20 h-1.5 bg-primary mt-3 rounded-full" />
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-2 text-primary font-bold hover:underline">
              Lihat Semua <ArrowRight size={18} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-xl font-semibold">Belum ada produk</p>
              <Link href="/admin/products" className="text-primary hover:underline mt-2 block text-sm">Tambah produk di Admin</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <div key={product.id} className="card-premium group">
                  <Link href={`/products/${product.slug}`}>
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      <div className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full z-10">BARU</div>
                      {product.thumbnail ? (
                        <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">📦</div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">{product.category.name}</p>
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="text-sm font-bold text-charcoal mb-3 line-clamp-2 hover:text-primary transition">{product.name}</h3>
                    </Link>
                    <div className="space-y-3 mt-3">
                      {/* Price display */}
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-gray-400">Harga Satuan:</span>
                        <span className="font-extrabold text-charcoal">Rp {Number(product.price).toLocaleString('id-ID')}</span>
                      </div>

                      {/* Compact Qty Selector + Add Button */}
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden shrink-0">
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setQuantities(prev => ({
                                ...prev,
                                [product.id]: Math.max(1, (prev[product.id] || 1) - 1)
                              }));
                            }}
                            disabled={product.stock === 0}
                            className="px-2.5 py-1.5 hover:bg-gray-205 transition text-gray-500 font-bold text-xs disabled:opacity-30"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-bold text-charcoal min-w-[20px] text-center bg-white py-1">
                            {quantities[product.id] || 1}
                          </span>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setQuantities(prev => ({
                                ...prev,
                                [product.id]: Math.min(product.stock, (prev[product.id] || 1) + 1)
                              }));
                            }}
                            disabled={product.stock === 0}
                            className="px-2.5 py-1.5 hover:bg-gray-205 transition text-gray-500 font-bold text-xs disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>
                        
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.preventDefault();
                            const qty = quantities[product.id] || 1;
                            await addToCart(product.id, qty);
                            triggerSnackbar(`Berhasil menambahkan ${qty} unit "${product.name}" ke keranjang belanja Anda!`, 'success');
                            // Reset qty to 1
                            setQuantities(prev => ({ ...prev, [product.id]: 1 }));
                          }}
                          disabled={product.stock === 0}
                          className="flex-grow flex items-center justify-center gap-1 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-black transition shadow-sm disabled:opacity-40 shrink-0"
                        >
                          <ShoppingCart size={13} /> Beli
                        </button>
                      </div>
                    </div>
                    {product.stock === 0 && <p className="text-[10px] font-bold text-red-500 mt-2 text-center bg-red-50 py-1 rounded">Stok habis</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── WHY MASAMAS ── */}
      <section className="py-24 bg-charcoal text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-primary font-bold uppercase tracking-widest text-sm mb-3">Keunggulan Kami</p>
            <h2 className="text-4xl font-bold">{cms.about_title || 'Mengapa Profesional Mempercayai Masamas?'}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Award, title: cms.about_point_1_title || 'Kualitas Bersertifikat', desc: cms.about_point_1_desc || 'Setiap material melewati pemeriksaan kualitas ketat sesuai standar SNI.' },
              { icon: Users, title: cms.about_point_2_title || 'Konsultasi Proyek', desc: cms.about_point_2_desc || 'Tim ahli kami siap membantu menghitung kebutuhan material Anda.' },
              { icon: Truck, title: cms.about_point_3_title || 'Pengiriman Massal', desc: cms.about_point_3_desc || 'Armada logistik siap mengantarkan langsung ke lokasi konstruksi.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-5 p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition">
                <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                  <item.icon size={26} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-primary">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-5xl font-bold mb-5">{cms.cta_title || 'Siap Memulai Proyek Anda?'}</h2>
          <p className="text-white/80 text-xl mb-12 max-w-2xl mx-auto">{cms.cta_subtitle || 'Hubungi tim kami atau mulai belanja sekarang.'}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products" className="px-10 py-4 bg-white text-primary font-bold rounded-xl hover:bg-gray-100 transition shadow-xl text-lg">
              {cms.cta_button_text || 'Mulai Belanja'}
            </Link>
            <Link href="/contact" className="flex items-center justify-center gap-2 px-10 py-4 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 transition border border-white/30 text-lg">
              <Phone size={20} /> {cms.cta_secondary_text || 'Hubungi Kami'}
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      {/* Toast / Snackbar Notification Container */}
      {snackbar.visible && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in pointer-events-auto">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border backdrop-blur-md max-w-md ${
            snackbar.type === 'success' ? 'bg-green-500/90 text-white border-green-600' :
            snackbar.type === 'error' ? 'bg-red-500/90 text-white border-red-600' :
            'bg-orange-500/90 text-white border-orange-600'
          }`}>
            {snackbar.type === 'success' ? <CheckCircle2 size={18} className="shrink-0" /> : null}
            <span className="text-xs font-bold leading-tight">{snackbar.message}</span>
            <button 
              onClick={() => setSnackbar(prev => ({ ...prev, visible: false }))}
              className="p-1 hover:bg-white/20 rounded-full transition ml-auto"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
