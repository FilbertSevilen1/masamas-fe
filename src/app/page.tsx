'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import api from '@/lib/api';
import { ArrowRight, Award, Truck, Users, Phone, Mail, MapPin, MessageCircle, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from 'framer-motion';

// ── Slide Animation Variants ──────────────────────────────────────────────────
const slideVariants = {
  enter: (dir: number) => ({
    y: dir > 0 ? '100%' : '-100%',
    opacity: 0,
    zIndex: 0
  }),
  center: {
    y: 0,
    opacity: 1,
    zIndex: 10
  },
  exit: (dir: number) => ({
    y: dir < 0 ? '100%' : '-100%',
    opacity: 0,
    zIndex: 0
  })
};


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
  const [direction, setDirection] = useState(1); // 1 = next/right, -1 = prev/left
  const [modalAlert, setModalAlert] = useState<{ open: boolean; type: 'info' | 'success' | 'danger'; title: string; message: string }>({ open: false, type: 'info', title: '', message: '' });

  const { addToCart } = useCartStore();
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();

  const handleQuickAdd = async (productId: number, stock: number) => {
    if (!isLoggedIn) {
      setModalAlert({ open: true, type: 'info', title: 'Informasi', message: 'Silakan login terlebih dahulu untuk berbelanja.' });
      return;
    }
    if (isAdmin) {
      setModalAlert({ open: true, type: 'info', title: 'Informasi', message: 'Akun Admin tidak diperbolehkan berbelanja. Silakan masuk dengan akun customer untuk melakukan pemesanan.' });
      return;
    }
    if (stock === 0) return;
    const res = await addToCart(productId, 1);
    if (res.success) {
      setModalAlert({ open: true, type: 'success', title: 'Berhasil', message: 'Produk berhasil ditambahkan ke keranjang!' });
    } else {
      setModalAlert({ open: true, type: 'danger', title: 'Gagal', message: res.message || 'Gagal menambahkan produk ke keranjang.' });
    }
  };

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

  // Dynamic carousel and gallery from dedicated API endpoints
  const [carouselSlides, setCarouselSlides] = useState<{ id: number; title: string; desc: string; image: string; position: number }[]>([]);
  const [galleryItems, setGalleryItems] = useState<{ id: number; title: string; image: string; position: number }[]>([]);

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
      api.get('/cms/banners').then(r => setCarouselSlides(r.data)).catch(() => {}),
      api.get('/cms/gallery').then(r => setGalleryItems(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  // Autoplay carousel
  useEffect(() => {
    if (loading || carouselSlides.length === 0) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentSlide(prev => (prev + 1) % carouselSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [loading, carouselSlides.length]);

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
        <div className="relative h-[81vh] flex items-center overflow-hidden w-full">
          
          {/* Sliding Background Layer */}
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            {carouselSlides.length > 0 && (
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentSlide}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  y: { type: "tween", duration: 1.4, ease: [0.22, 1, 0.36, 1] },
                  opacity: { duration: 1.0 }
                }}
                className="absolute inset-0 w-full h-full"
              >
                {/* Parallax Background with dynamic scale zoom animation */}
                <motion.div style={{ y: heroParallaxY }} className="absolute inset-0 overflow-hidden w-full h-full">
                  <motion.img
                    key={`img-${currentSlide}-${carouselSlides[currentSlide]?.image}`}
                    src={carouselSlides[currentSlide]?.image}
                    alt={carouselSlides[currentSlide]?.title}
                    initial={{ scale: 1.0 }}
                    animate={{ scale: 1.15 }}
                    transition={{ duration: 7, ease: "easeOut" }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/80 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
                </motion.div>
              </motion.div>
            </AnimatePresence>
            )}
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center relative z-20 w-full pointer-events-none">
            <div className="max-w-2xl pointer-events-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                    {carouselSlides[currentSlide]?.title}
                  </h1>
                  <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-lg">
                    {carouselSlides[currentSlide]?.desc}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Static Buttons (Animate on page load only) */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                {renderActionButton(cms.hero_cta_action || '/products', cms.hero_cta_text || 'Lihat Produk Kami')}
                <Link href="/about" className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition border border-white/20 text-lg">
                  Pelajari Lebih Lanjut
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Pagination dots (Vertical on the right) */}
          <div className="absolute right-6 sm:right-8 top-1/2 -translate-y-1/2 flex flex-col space-y-3 z-30">
            {carouselSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > currentSlide ? 1 : -1);
                  setCurrentSlide(i);
                }}
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-10">

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
                        <div className="flex justify-between items-center text-xs font-semibold mb-2">
                          <span className="text-gray-400">Harga Satuan:</span>
                          <span className="font-extrabold text-charcoal">Rp {Number(product.price).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-semibold mb-3">
                          <span className="text-gray-400">Stok:</span>
                          <span className={`font-bold ${product.stock <= 5 ? 'text-red-500' : 'text-gray-600'}`}>
                            {product.stock > 0 ? `${product.stock} unit` : 'Habis'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {!isAdmin && (
                      <div className="p-4 pt-0 space-y-2">
                        {product.stock > 0 ? (
                          <button
                            onClick={() => handleQuickAdd(product.id, product.stock)}
                            className="relative w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-emerald-600 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition shadow-md hover:scale-[1.01] active:scale-95 duration-200 cursor-pointer"
                          >
                            <ShoppingCart size={15} />
                            <span>Tambah ke Keranjang</span>
                          </button>
                        ) : (
                          <button
                            disabled
                            className="w-full flex items-center justify-center gap-2 py-3 bg-gray-200 text-gray-400 rounded-xl text-xs font-extrabold uppercase tracking-wider cursor-not-allowed"
                          >
                            Stok Habis
                          </button>
                        )}
                      </div>
                    )}
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
      <ConfirmDialog
        isOpen={modalAlert.open}
        type={modalAlert.type}
        title={modalAlert.title}
        message={modalAlert.message}
        confirmText="OK"
        showCancel={false}
        onClose={() => setModalAlert(m => ({ ...m, open: false }))}
        onConfirm={() => setModalAlert(m => ({ ...m, open: false }))}
      />
    </main>
  );
}
