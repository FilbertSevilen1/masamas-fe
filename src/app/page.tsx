'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import api from '@/lib/api';
import { ArrowRight, Award, Truck, Users, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useMotionValue,
  useSpring,
} from 'framer-motion';

// ── Interfaces ────────────────────────────────────────────────────────────────
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

// ── Animation Variants ────────────────────────────────────────────────────────
const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 45 },
  visible: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.75, ease: EASE, delay },
  }),
};

const fadeLeft = {
  hidden: { opacity: 0, x: -55 },
  visible: (delay = 0) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.75, ease: EASE, delay },
  }),
};

const fadeRight = {
  hidden: { opacity: 0, x: 55 },
  visible: (delay = 0) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.75, ease: EASE, delay },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: (delay = 0) => ({
    opacity: 1, scale: 1,
    transition: { duration: 0.65, ease: EASE, delay },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};

// ── CountUp Component ─────────────────────────────────────────────────────────
function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let current = 0;
    const steps = 60;
    const increment = target / steps;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 1800 / steps);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ── TiltCard Component ────────────────────────────────────────────────────────
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const xVal = useMotionValue(0);
  const yVal = useMotionValue(0);
  const rotateX = useSpring(useTransform(yVal, [-0.5, 0.5], [6, -6]), { stiffness: 400, damping: 40 });
  const rotateY = useSpring(useTransform(xVal, [-0.5, 0.5], [-6, 6]), { stiffness: 400, damping: 40 });
  const scale = useSpring(1, { stiffness: 400, damping: 40 });

  return (
    <motion.div
      ref={cardRef}
      style={{
        rotateX,
        rotateY,
        scale,
        transformPerspective: 800,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden'
      }}
      onMouseMove={(e) => {
        const rect = cardRef.current?.getBoundingClientRect();
        if (!rect) return;
        xVal.set((e.clientX - rect.left) / rect.width - 0.5);
        yVal.set((e.clientY - rect.top) / rect.height - 0.5);
        scale.set(1.04);
      }}
      onMouseLeave={() => { xVal.set(0); yVal.set(0); scale.set(1); }}
      className={`${className} isolate overflow-hidden`}
    >
      {children}
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [cms, setCms] = useState<CmsMap>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [whatsapp, setWhatsapp] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Scroll-trigger refs
  const heroRef = useRef<HTMLElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const whyRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Hero parallax
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroParallaxY = useTransform(heroScroll, [0, 1], ['0%', '28%']);

  // Gallery parallax
  const { scrollYProgress: galleryScroll } = useScroll({ target: galleryRef, offset: ['start end', 'end start'] });
  const galleryBgY = useTransform(galleryScroll, [0, 1], ['-4%', '4%']);

  // InView flags
  const categoriesInView = useInView(categoriesRef, { once: true, margin: '-80px' as `${number}px` });
  const productsInView   = useInView(productsRef,   { once: true, margin: '-80px' as `${number}px` });
  const galleryInView    = useInView(galleryRef,    { once: true, margin: '-80px' as `${number}px` });
  const whyInView        = useInView(whyRef,        { once: true, margin: '-80px' as `${number}px` });
  const ctaInView        = useInView(ctaRef,        { once: true, margin: '-80px' as `${number}px` });

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

  // Autoplay carousel
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
    const cls = "flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition shadow-xl shadow-primary/30 text-lg hover:scale-105 duration-200";
    if (isExternal) {
      return <a href={action} target="_blank" rel="noopener noreferrer" className={cls}>{text} <ArrowRight size={20} /></a>;
    }
    return <Link href={action} className={cls}>{text} <ArrowRight size={20} /></Link>;
  };

  return (
    <main className="min-h-screen flex flex-col overflow-x-hidden">
      <Navbar />

      {/* ══════════════════════════════════════════════
          HERO CAROUSEL — parallax background
      ══════════════════════════════════════════════ */}
      <section ref={heroRef} className="bg-charcoal text-white relative flex flex-col">
        <div className="relative h-[81vh] flex items-center overflow-hidden">
          {carouselSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              {/* Parallax Background */}
              <motion.div style={{ y: heroParallaxY }} className="absolute inset-0 scale-110">
                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
              </motion.div>

              {/* Slide content — staggered text reveal */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center relative z-20">
                <div className="max-w-2xl">
                  <motion.h1
                    animate={index === currentSlide ? { opacity: 1, y: 0 } : { opacity: 0, y: 35 }}
                    transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.22 }}
                    className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6"
                  >
                    {slide.title}
                  </motion.h1>
                  <motion.p
                    animate={index === currentSlide ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.38 }}
                    className="text-gray-300 text-lg leading-relaxed mb-8 max-w-lg"
                  >
                    {slide.desc}
                  </motion.p>
                  <motion.div
                    animate={index === currentSlide ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.52 }}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    {renderActionButton(slide.action, cms.hero_cta_text || 'Lihat Produk Kami')}
                    <Link href="/about" className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition border border-white/20 text-lg">
                      Pelajari Lebih Lanjut
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination dots (Vertical on the right) */}
          <div className="absolute right-6 sm:right-8 top-1/2 -translate-y-1/2 flex flex-col space-y-3 z-30">
            {carouselSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2.5 transition-all duration-300 rounded-full cursor-pointer ${i === currentSlide ? 'bg-primary h-8' : 'h-2.5 bg-white/40 hover:bg-white/70'}`}
              />
            ))}
          </div>
        </div>

      </section>

      {/* ══════════════════════════════════════════════
          SHOP BY CATEGORY — stagger + 3D tilt
      ══════════════════════════════════════════════ */}
      <section className="bg-gray-50 pt-1 relative">
        {/* Subtle premium green dot grid background pattern */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, #059669 1.5px, transparent 1.5px)',
          backgroundSize: '32px 32px'
        }} />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-primary/[0.015] to-gray-50 pointer-events-none" />
        {/* ── QUICK CONTACT FLOATING CARDS ── */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-30 -mt-16 md:-mt-20 mb-8 md:mb-12">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* WhatsApp */}
            <motion.a
              href={`https://wa.me/${waNumber}`}
              target="_blank" rel="noopener noreferrer"
              id="hero-contact-whatsapp"
              variants={staggerItem}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
              className="flex items-center gap-4 p-6 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center shrink-0 group-hover:bg-[#25D366]/20 transition-colors">
                <svg viewBox="0 0 24 24" width={22} height={22} fill="currentColor" className="text-[#25D366]">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">WhatsApp</p>
                <p className="text-charcoal font-bold text-sm truncate group-hover:text-[#25D366] transition-colors">{whatsapp || '+62 812 3456 7890'}</p>
                <p className="text-gray-400 text-xs mt-0.5">Respon Cepat</p>
              </div>
            </motion.a>

            {/* Phone */}
            <motion.a
              href={`tel:${(cms.footer_phone || '+622112345678').replace(/\s+/g, '')}`}
              id="hero-contact-phone"
              variants={staggerItem}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
              className="flex items-center gap-4 p-6 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <Phone size={22} className="text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Telepon</p>
                <p className="text-charcoal font-bold text-sm truncate group-hover:text-primary transition-colors">{cms.footer_phone || '+62 21 1234 5678'}</p>
                <p className="text-gray-400 text-xs mt-0.5">Senin–Sabtu 08.00–17.00</p>
              </div>
            </motion.a>

            {/* Email */}
            <motion.a
              href={`mailto:${cms.footer_email || 'info@masamas.co.id'}`}
              id="hero-contact-email"
              variants={staggerItem}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
              className="flex items-center gap-4 p-6 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
                <Mail size={22} className="text-blue-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Email</p>
                <p className="text-charcoal font-bold text-sm truncate group-hover:text-blue-500 transition-colors">{cms.footer_email || 'info@masamas.co.id'}</p>
                <p className="text-gray-400 text-xs mt-0.5">Balas dalam 1×24 jam</p>
              </div>
            </motion.a>

            {/* Address */}
            <motion.div
              variants={staggerItem}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
              className="rounded-2xl border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/95 backdrop-blur-md group"
            >
              <Link href="/contact" id="hero-contact-address" className="flex items-center gap-4 p-6 group h-full">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors">
                  <MapPin size={22} className="text-amber-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Kantor Kami</p>
                  <p className="text-charcoal font-bold text-sm truncate group-hover:text-amber-400 transition-colors">{cms.footer_address || 'Jl. Industri Raya No. 45, Jakarta'}</p>
                  <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">Lihat detail kontak <MessageCircle size={10} /></p>
                </div>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-10">

          {/* Section header */}
          <div ref={categoriesRef}>
            <motion.div
              variants={fadeUp} custom={0}
              initial="hidden" animate={categoriesInView ? 'visible' : 'hidden'}
              className="flex justify-between items-end mb-12"
            >
              <div>
                <p className="text-primary font-bold uppercase tracking-widest text-sm mb-2">Koleksi Kami</p>
                <h2 className="text-4xl font-bold text-charcoal">Belanja per Kategori</h2>
                <motion.div
                  initial={{ width: 0 }}
                  animate={categoriesInView ? { width: 80 } : { width: 0 }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
                  className="h-1.5 bg-primary mt-3 rounded-full"
                />
              </div>
              <Link href="/products" className="hidden sm:flex items-center gap-2 text-primary font-bold hover:underline">
                Semua Produk <ArrowRight size={18} />
              </Link>
            </motion.div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => <div key={i} className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />)}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-xl font-semibold">Belum ada kategori</p>
              {isAdmin && <Link href="/admin/categories" className="text-primary hover:underline mt-2 block text-sm">Tambah kategori di Admin</Link>}
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
              variants={staggerContainer}
              initial="hidden"
              animate={categoriesInView ? 'visible' : 'hidden'}
            >
              {categories.map(cat => (
                <motion.div key={cat.id} variants={staggerItem}>
                  <TiltCard className="group relative rounded-2xl overflow-hidden aspect-square bg-charcoal shadow-sm hover:shadow-xl transition-all duration-300 border border-white/5 group-hover:border-primary/30">
                    <Link href={`/products?category=${cat.slug}`} className="block w-full h-full rounded-2xl">
                      
                      {/* Floating product count glass badge */}
                      <span className="absolute top-4 left-4 z-10 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[10px] font-bold text-white border border-white/10 group-hover:bg-primary group-hover:border-primary/50 transition-all duration-300 shadow-sm uppercase tracking-wider">
                        {cat._count.products} Produk
                      </span>

                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60 rounded-2xl" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-charcoal via-charcoal/95 to-primary/25 flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-700 rounded-2xl">
                          {/* Blueprint grid lines */}
                          <div className="absolute inset-0 opacity-10" style={{
                            backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                          }} />
                          {/* Glowing ambient light */}
                          <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-colors animate-pulse" />
                          <span className="text-5xl drop-shadow-lg relative z-10 animate-bounce-slow">🏗️</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent group-hover:via-black/20 transition-all duration-300 rounded-2xl" />
                      
                      <div className="absolute bottom-0 left-0 right-0 p-5 transform group-hover:translate-y-[-4px] transition-transform duration-300">
                        <h3 className="text-white font-extrabold text-lg leading-tight tracking-tight">{cat.name}</h3>
                        <p className="text-gray-300 text-xs font-semibold mt-1 group-hover:text-primary transition-colors flex items-center gap-1">
                          Lihat Kategori <ArrowRight size={12} className="inline opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                        </p>
                      </div>

                      {/* Smooth top-right action button on hover */}
                      <div className="absolute top-4 right-4 w-9 h-9 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10 opacity-0 transform translate-y-[-6px] group-hover:opacity-100 group-hover:translate-y-0 group-hover:bg-primary transition-all duration-300 shadow-lg shadow-primary/25">
                        <ArrowRight size={16} className="text-white" />
                      </div>

                    </Link>
                  </TiltCard>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURED PRODUCTS — cascade reveal
      ══════════════════════════════════════════════ */}
      <section className="py-24 bg-white relative">
        {/* Diagonal top edge */}
        <div className="absolute top-0 left-0 right-0 h-14 bg-gray-50" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 0)' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div ref={productsRef}>
            <motion.div
              variants={fadeUp} custom={0}
              initial="hidden" animate={productsInView ? 'visible' : 'hidden'}
              className="flex justify-between items-end mb-12"
            >
              <div>
                <p className="text-primary font-bold uppercase tracking-widest text-sm mb-2">Pilihan Terbaik</p>
                <h2 className="text-4xl font-bold text-charcoal">Produk Unggulan</h2>
                <motion.div
                  initial={{ width: 0 }}
                  animate={productsInView ? { width: 80 } : { width: 0 }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
                  className="h-1.5 bg-primary mt-3 rounded-full"
                />
              </div>
              <Link href="/products" className="hidden sm:flex items-center gap-2 text-primary font-bold hover:underline">
                Lihat Semua <ArrowRight size={18} />
              </Link>
            </motion.div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-xl font-semibold">Belum ada produk</p>
              {isAdmin && <Link href="/admin/products" className="text-primary hover:underline mt-2 block text-sm">Tambah produk di Admin</Link>}
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
              variants={staggerContainer}
              initial="hidden"
              animate={productsInView ? 'visible' : 'hidden'}
            >
              {products.map(product => {
                const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Halo Admin Masamas, saya tertarik untuk memesan produk:\n\n*Nama Produk*: ${product.name}\n*Harga*: Rp ${Number(product.price).toLocaleString('id-ID')}\n\nApakah barang tersebut tersedia? Mohon informasinya.`)}`;
                return (
                  <motion.div
                    key={product.id}
                    variants={staggerItem}
                    className="card-premium group flex flex-col justify-between h-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300"
                  >
                    <div>
                      <Link href={`/products/${product.slug}`}>
                        <div className="aspect-square bg-gray-50 relative overflow-hidden">
                          {/* Premium floating BARU tag */}
                          <div className="absolute top-3 left-3 bg-primary/90 text-white backdrop-blur-sm text-[9px] font-extrabold px-2.5 py-1.5 rounded-lg z-10 border border-white/20 uppercase tracking-widest shadow-md shadow-primary/20">
                            BARU
                          </div>
                          
                          {/* Soft hover overlay */}
                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none" />

                          {product.thumbnail ? (
                            <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">📦</div>
                          )}
                        </div>
                      </Link>
                      <div className="p-4">
                        <p className="text-xs text-primary font-extrabold uppercase tracking-wider mb-1">{product.category.name}</p>
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
                        target="_blank" rel="noopener noreferrer"
                        className="relative w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.01] active:scale-95 duration-200 overflow-hidden group/wa cursor-pointer"
                      >
                        {/* Pulse ring on hover */}
                        <span className="absolute inset-0 bg-[#25D366] rounded-xl opacity-0 group-hover/wa:opacity-100 animate-ping-slow" />
                        <svg viewBox="0 0 24 24" width={15} height={15} fill="currentColor" className="relative z-10">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        <span className="relative z-10">Beli via WhatsApp</span>
                      </a>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          GALLERY — zoom-from-center + parallax drift
      ══════════════════════════════════════════════ */}
      <section id="gallery" className="py-24 bg-gray-50 scroll-mt-20 relative overflow-hidden">
        {/* Subtle parallax tinted overlay */}
        <motion.div
          style={{ y: galleryBgY }}
          className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent pointer-events-none"
        />
        <div ref={galleryRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

          <motion.div
            variants={fadeUp} custom={0}
            initial="hidden" animate={galleryInView ? 'visible' : 'hidden'}
            className="text-center mb-16"
          >
            <p className="text-primary font-bold uppercase tracking-widest text-sm mb-2">Galeri Proyek</p>
            <h2 className="text-4xl font-bold text-charcoal">Dokumentasi Portofolio Proyek</h2>
            <motion.div
              initial={{ width: 0 }}
              animate={galleryInView ? { width: 80 } : { width: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
              className="h-1.5 bg-primary mt-3 mx-auto rounded-full"
            />
            <p className="text-gray-500 mt-4 max-w-xl mx-auto text-sm">Berbagai dokumentasi proyek residensial dan industrial yang dibangun menggunakan material berkualitas dari Masamas.</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            animate={galleryInView ? 'visible' : 'hidden'}
          >
            {galleryItems.slice(0, 3).map((item, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                custom={i * 0.05}
                className="group relative rounded-2xl overflow-hidden aspect-video shadow-md hover:shadow-xl transition-all duration-300 bg-charcoal"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={item.image} alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-white font-bold text-lg drop-shadow-md">{item.title}</h3>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={0.2}
            initial="hidden"
            animate={galleryInView ? 'visible' : 'hidden'}
            className="text-center mt-12"
          >
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition shadow-lg shadow-primary/20 text-sm hover:scale-105 duration-200"
            >
              Lihat Galeri Selengkapnya <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          WHY MASAMAS — alt slide-in + stat counters
      ══════════════════════════════════════════════ */}
      <section className="py-24 bg-charcoal text-white relative overflow-hidden">
        {/* Dot grid overlay */}
        <div className="absolute inset-0 opacity-[0.045]" style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div ref={whyRef}>
            <motion.div
              variants={fadeUp} custom={0}
              initial="hidden" animate={whyInView ? 'visible' : 'hidden'}
              className="text-center mb-12"
            >
              <p className="text-primary font-bold uppercase tracking-widest text-sm mb-3">Keunggulan Kami</p>
              <h2 className="text-4xl font-bold">{cms.about_title || 'Mengapa Profesional Mempercayai Masamas?'}</h2>
            </motion.div>
          </div>

          {/* Stat counters */}
          <motion.div
            className="grid grid-cols-3 gap-6 mb-16"
            variants={staggerContainer}
            initial="hidden"
            animate={whyInView ? 'visible' : 'hidden'}
          >
            {[
              { value: 12,   suffix: '+', label: 'Tahun Berpengalaman' },
              { value: 5000, suffix: '+', label: 'Proyek Selesai' },
              { value: 99,   suffix: '%', label: 'Tingkat Kepuasan' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                whileHover={{ scale: 1.04, backgroundColor: 'rgba(255,255,255,0.1)' }}
                transition={{ duration: 0.25 }}
                className="text-center p-6 bg-white/5 rounded-2xl border border-white/10 cursor-default"
              >
                <p className="text-4xl lg:text-5xl font-extrabold text-primary">
                  <CountUp target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-gray-400 mt-2 text-sm font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Feature cards — alt slide-in */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Award, title: cms.about_point_1_title || 'Kualitas Bersertifikat',  desc: cms.about_point_1_desc || 'Setiap material melewati pemeriksaan kualitas ketat sesuai standar SNI.',                  variant: fadeLeft  },
              { icon: Users, title: cms.about_point_2_title || 'Konsultasi Proyek',        desc: cms.about_point_2_desc || 'Tim ahli kami siap membantu menghitung kebutuhan material Anda.',                         variant: fadeUp    },
              { icon: Truck, title: cms.about_point_3_title || 'Pengiriman Massal',        desc: cms.about_point_3_desc || 'Armada logistik siap mengantarkan langsung ke lokasi konstruksi.',                       variant: fadeRight },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={item.variant}
                custom={i * 0.1}
                initial="hidden"
                animate={whyInView ? 'visible' : 'hidden'}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)', y: -4 }}
                transition={{ duration: 0.25 }}
                className="flex gap-5 p-6 bg-white/5 rounded-2xl border border-white/10 cursor-default"
              >
                <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                  <item.icon size={26} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CTA — animated gradient + shimmer sweep
      ══════════════════════════════════════════════ */}
      <section className="py-24 cta-gradient relative overflow-hidden">
        {/* Shimmer sweep overlay */}
        <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent shimmer-sweep pointer-events-none" />

        <div ref={ctaRef} className="max-w-4xl mx-auto px-4 text-center text-white relative z-10">
          <motion.h2
            variants={fadeUp} custom={0}
            initial="hidden" animate={ctaInView ? 'visible' : 'hidden'}
            className="text-5xl font-bold mb-5"
          >
            {cms.cta_title || 'Siap Memulai Proyek Anda?'}
          </motion.h2>
          <motion.p
            variants={fadeUp} custom={0.15}
            initial="hidden" animate={ctaInView ? 'visible' : 'hidden'}
            className="text-white/80 text-xl mb-12 max-w-2xl mx-auto"
          >
            {cms.cta_subtitle || 'Hubungi tim kami atau mulai belanja sekarang.'}
          </motion.p>
          <motion.div
            variants={fadeUp} custom={0.3}
            initial="hidden" animate={ctaInView ? 'visible' : 'hidden'}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link href="/products" className="block px-10 py-4 bg-white text-primary font-bold rounded-xl hover:bg-gray-100 transition shadow-xl text-lg">
                {cms.cta_button_text || 'Mulai Belanja'}
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link href="/contact" className="flex items-center justify-center gap-2 px-10 py-4 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 transition border border-white/30 text-lg">
                <Phone size={20} /> {cms.cta_secondary_text || 'Hubungi Kami'}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
