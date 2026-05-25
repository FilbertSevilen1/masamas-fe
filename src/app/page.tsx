'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import api from '@/lib/api';
import { ArrowRight, Award, Truck, Users, Phone } from 'lucide-react';

interface CmsMap {
  hero_title?: string; hero_subtitle?: string; hero_cta_text?: string;
  hero_badge_1?: string; hero_badge_2?: string; hero_badge_3?: string;
  about_title?: string; about_desc?: string;
  about_point_1_title?: string; about_point_1_desc?: string;
  about_point_2_title?: string; about_point_2_desc?: string;
  about_point_3_title?: string; about_point_3_desc?: string;
  about_stat_years?: string; about_stat_projects?: string;
  cta_title?: string; cta_subtitle?: string; cta_button_text?: string; cta_secondary_text?: string;
  [key: string]: string | undefined;
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [whatsapp, setWhatsapp] = useState('');

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsAdmin(localStorage.getItem('role') === 'ADMIN');
    }
    Promise.all([
      api.get('/cms/map').then(r => {
        setCms(r.data);
        setWhatsapp(r.data.footer_whatsapp || '+62 812 3456 7890');
      }).catch(() => {}),
      api.get('/categories').then(r => setCategories(r.data.slice(0, 8))).catch(() => {}),
      api.get('/products?limit=8&sort=createdAt').then(r => setProducts(r.data.products)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  // Autoplay Carousel
  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, [loading]);

  const carouselSlides = [
    {
      title: cms.carousel_1_title || 'Bangun Rumah Impian Anda',
      desc: cms.carousel_1_desc || 'Material berkualitas tinggi langsung dikirim ke proyek Anda dengan garansi mutu.',
      image: cms.carousel_1_image || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1200',
      action: cms.carousel_1_action || '/products'
    },
    {
      title: cms.carousel_2_title || 'Baja & Besi Bersertifikat SNI',
      desc: cms.carousel_2_desc || 'Ketahanan maksimal untuk konstruksi yang kokoh, tangguh, dan tahan lama.',
      image: cms.carousel_2_image || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1200',
      action: cms.carousel_2_action || '/products'
    },
    {
      title: cms.carousel_3_title || 'Konsultasi Material Gratis',
      desc: cms.carousel_3_desc || 'Hubungi tim ahli kami sekarang untuk menghitung estimasi kebutuhan proyek Anda.',
      image: cms.carousel_3_image || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1200',
      action: cms.carousel_3_action || '/contact'
    }
  ];

  const galleryItems = [
    { image: cms.gallery_1_image || 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=600', title: cms.gallery_1_title || 'Proyek Perumahan Elite' },
    { image: cms.gallery_2_image || 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?q=80&w=600', title: cms.gallery_2_title || 'Konstruksi Jembatan Baja' },
    { image: cms.gallery_3_image || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600', title: cms.gallery_3_title || 'Pabrik Industri Modern' },
    { image: cms.gallery_4_image || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600', title: cms.gallery_4_title || 'Pembangunan Ruko 3 Lantai' },
    { image: cms.gallery_5_image || 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=600', title: cms.gallery_5_title || 'Gudang Logistik Skala Besar' },
    { image: cms.gallery_6_image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600', title: cms.gallery_6_title || 'Renovasi Rumah Tinggal' },
  ];

  const cleanNum = whatsapp.replace(/[^0-9]/g, '');
  const waNumber = cleanNum.startsWith('0') ? `62${cleanNum.slice(1)}` : cleanNum;

  const renderActionButton = (action: string, text: string) => {
    const isExternal = action.startsWith('http://') || action.startsWith('https://');
    const className = "flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition shadow-xl shadow-primary/30 text-lg hover:scale-105 duration-200";
    if (isExternal) {
      return (
        <a href={action} target="_blank" rel="noopener noreferrer" className={className}>
          {text} <ArrowRight size={20} />
        </a>
      );
    }
    return (
      <Link href={action} className={className}>
        {text} <ArrowRight size={20} />
      </Link>
    );
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      {/* ── HERO CAROUSEL ── */}
      <section className="bg-charcoal text-white h-[85vh] relative overflow-hidden flex items-center">
        {carouselSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/80 to-transparent" />
            </div>

            {/* Slide Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center relative z-20">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 text-primary px-4 py-2 rounded-full text-sm font-bold mb-6 uppercase tracking-widest">
                  🏗️ Material Bangunan Terpercaya
                </div>
                <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                  {slide.title}
                </h1>
                <p className="text-gray-300 text-lg leading-relaxed mb-10 max-w-lg">
                  {slide.desc}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  {renderActionButton(slide.action, cms.hero_cta_text || 'Lihat Produk Kami')}
                  <Link href="/about" className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition border border-white/20 text-lg">
                    Pelajari Lebih Lanjut
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Pagination dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-30">
          {carouselSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'bg-primary w-8' : 'bg-white/40 hover:bg-white/70'}`}
            />
          ))}
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
              {isAdmin && (
                <Link href="/admin/categories" className="text-primary hover:underline mt-2 block text-sm">Tambah kategori di Admin</Link>
              )}
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
              {isAdmin && (
                <Link href="/admin/products" className="text-primary hover:underline mt-2 block text-sm">Tambah produk di Admin</Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map(product => {
                const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Halo Admin Masamas, saya tertarik untuk memesan produk:\n\n*Nama Produk*: ${product.name}\n*Harga*: Rp ${Number(product.price).toLocaleString('id-ID')}\n\nApakah barang tersebut tersedia? Mohon informasinya.`)}`;

                return (
                  <div key={product.id} className="card-premium group flex flex-col justify-between h-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition duration-300">
                    <div>
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
                        <div className="flex justify-between items-center text-xs font-semibold mb-3">
                          <span className="text-gray-400">Harga Satuan:</span>
                          <span className="font-extrabold text-charcoal">Rp {Number(product.price).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0 space-y-2">
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl text-xs font-bold transition shadow-sm"
                      >
                        <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Beli via WhatsApp
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── GALLERY SECTION ── */}
      <section id="gallery" className="py-24 bg-gray-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-primary font-bold uppercase tracking-widest text-sm mb-2">Galeri Proyek</p>
            <h2 className="text-4xl font-bold text-charcoal">Dokumentasi Portofolio Proyek</h2>
            <div className="w-20 h-1.5 bg-primary mt-3 mx-auto rounded-full" />
            <p className="text-gray-500 mt-4 max-w-xl mx-auto text-sm">Berbagai dokumentasi proyek residensial dan industrial yang dibangun menggunakan material berkualitas dari Masamas.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {galleryItems.map((item, i) => (
              <div key={i} className="group relative rounded-2xl overflow-hidden aspect-video shadow-md hover:shadow-xl transition-all duration-300 bg-charcoal">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6" />
                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-white font-bold text-lg drop-shadow-md">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
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
    </main>
  );
}
