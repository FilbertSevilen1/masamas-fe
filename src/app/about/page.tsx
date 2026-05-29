'use client';

import { useRef, useEffect, useState } from 'react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import Link from 'next/link';
import { Award, Users, Truck, Wrench, CheckCircle } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { fadeUp, fadeLeft, fadeRight, staggerContainer, staggerItem, EASE } from '@/lib/animations';

function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    let c = 0;
    const inc = target / 60;
    const t = setInterval(() => {
      c += inc;
      if (c >= target) { setCount(target); clearInterval(t); }
      else setCount(Math.floor(c));
    }, 1800 / 60);
    return () => clearInterval(t);
  }, [isInView, target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function AboutPage() {
  const statsRef  = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);
  const storyRef  = useRef<HTMLDivElement>(null);
  const ctaRef    = useRef<HTMLDivElement>(null);

  const statsInView  = useInView(statsRef,  { once: true, margin: '-60px' as `${number}px` });
  const valuesInView = useInView(valuesRef, { once: true, margin: '-60px' as `${number}px` });
  const storyInView  = useInView(storyRef,  { once: true, margin: '-60px' as `${number}px` });
  const ctaInView    = useInView(ctaRef,    { once: true, margin: '-60px' as `${number}px` });

  return (
    <main className="min-h-screen flex flex-col overflow-x-hidden">
      <Navbar />

      {/* ── HERO ── */}
      <section className="bg-charcoal text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1600" alt="bg" className="w-full h-full object-cover" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
            className="text-primary font-bold uppercase tracking-widest text-sm mb-4">Tentang Kami</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.22 }}
            className="text-5xl font-bold mb-6">Membangun Indonesia<br />Dengan Material Terbaik</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.38 }}
            className="text-gray-400 text-lg max-w-3xl mx-auto">
            Masamas telah melayani proyek konstruksi skala kecil hingga besar selama lebih dari 15 tahun. Kami berkomitmen menyediakan material bangunan berkualitas dengan harga kompetitif.
          </motion.p>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-white text-center"
            variants={staggerContainer} initial="hidden" animate={statsInView ? 'visible' : 'hidden'}>
            {[
              { value: 15, suffix: '+', label: 'Tahun Pengalaman' },
              { value: 2500, suffix: '+', label: 'Proyek Selesai' },
              { value: 500, suffix: '+', label: 'Produk Tersedia' },
              { value: 98, suffix: '%', label: 'Kepuasan Pelanggan' },
            ].map((stat, i) => (
              <motion.div key={i} variants={staggerItem}>
                <p className="text-5xl font-bold mb-2"><CountUp target={stat.value} suffix={stat.suffix} /></p>
                <p className="text-white/80 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={valuesRef}>
            <motion.div variants={fadeUp} custom={0} initial="hidden" animate={valuesInView ? 'visible' : 'hidden'} className="text-center mb-16">
              <h2 className="text-4xl font-bold text-charcoal mb-4">Mengapa Memilih Masamas?</h2>
              <p className="text-gray-500 max-w-2xl mx-auto">Kami tidak hanya menjual material — kami memberikan solusi konstruksi lengkap untuk setiap kebutuhan Anda.</p>
            </motion.div>
          </div>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer} initial="hidden" animate={valuesInView ? 'visible' : 'hidden'}>
            {[
              { icon: Award, title: 'Kualitas Bersertifikat SNI', desc: 'Semua produk kami telah melalui uji kualitas ketat dan bersertifikat Standar Nasional Indonesia.' },
              { icon: Truck, title: 'Pengiriman ke Lokasi', desc: 'Armada pengiriman kami siap mengantarkan material langsung ke lokasi proyek Anda di seluruh Jakarta.' },
              { icon: Users, title: 'Tim Konsultan Ahli', desc: 'Tim teknis berpengalaman siap membantu Anda memilih material yang tepat sesuai kebutuhan proyek.' },
              { icon: Wrench, title: 'Dukungan Purna Jual', desc: 'Garansi produk dan layanan purna jual untuk memastikan kepuasan Anda setelah pembelian.' },
            ].map((item, i) => (
              <motion.div key={i} variants={staggerItem}
                whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.10)' }} transition={{ duration: 0.25 }}
                className="p-8 bg-gray-50 rounded-2xl group cursor-default">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary transition">
                  <item.icon size={28} className="text-primary group-hover:text-white transition" />
                </div>
                <h3 className="text-xl font-bold text-charcoal mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── STORY ── */}
      <section className="py-24 bg-gray-50">
        <div ref={storyRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={fadeLeft} custom={0} initial="hidden" animate={storyInView ? 'visible' : 'hidden'}>
              <p className="text-primary font-bold uppercase tracking-widest text-sm mb-4">Kisah Kami</p>
              <h2 className="text-4xl font-bold text-charcoal mb-6">Dari Toko Kecil ke Distributor Terpercaya</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>Masamas didirikan pada tahun 2008 oleh Bapak Ahmad Fauzi dengan modal kecil dan tekad besar. Bermula dari toko material kecil di Cipinang, Jakarta Timur.</p>
                <p>Dengan fokus pada kualitas produk dan kejujuran dalam berbisnis, Masamas tumbuh menjadi salah satu distributor material bangunan terpercaya di DKI Jakarta.</p>
                <p>Kini, Masamas melayani ratusan kontraktor, arsitek, dan developer setiap bulannya, dan terus berkembang untuk memberikan layanan terbaik.</p>
              </div>
              <motion.div className="mt-8 space-y-3" variants={staggerContainer} initial="hidden" animate={storyInView ? 'visible' : 'hidden'}>
                {['Produk asli dan bergaransi', 'Harga transparan tanpa biaya tersembunyi', 'Tim profesional berpengalaman', 'Pengiriman tepat waktu'].map((item, i) => (
                  <motion.div key={i} variants={staggerItem} className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-primary shrink-0" />
                    <span className="text-charcoal font-medium">{item}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            <motion.div variants={fadeRight} custom={0.1} initial="hidden" animate={storyInView ? 'visible' : 'hidden'} className="grid grid-cols-2 gap-4">
              <motion.img whileHover={{ scale: 1.03 }} transition={{ duration: 0.3 }}
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600" alt="Gudang"
                className="rounded-2xl shadow-lg w-full object-cover aspect-square mt-8" />
              <motion.img whileHover={{ scale: 1.03 }} transition={{ duration: 0.3 }}
                src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=600" alt="Tim"
                className="rounded-2xl shadow-lg w-full object-cover aspect-square" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-charcoal text-white text-center">
        <motion.div ref={ctaRef} variants={fadeUp} custom={0} initial="hidden" animate={ctaInView ? 'visible' : 'hidden'}
          className="max-w-3xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-4">Siap Berkolaborasi?</h2>
          <p className="text-gray-400 mb-10 text-lg">Hubungi tim kami sekarang dan dapatkan konsultasi gratis untuk proyek Anda.</p>
          <motion.div variants={staggerContainer} initial="hidden" animate={ctaInView ? 'visible' : 'hidden'}
            className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div variants={staggerItem} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link href="/products" className="block px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition shadow-lg shadow-primary/30">Lihat Produk</Link>
            </motion.div>
            <motion.div variants={staggerItem} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link href="/contact" className="block px-8 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition border border-white/20">Hubungi Kami</Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
