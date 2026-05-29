'use client';

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, ArrowRight } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { fadeUp, fadeLeft, fadeRight, staggerContainer, staggerItem, EASE } from '@/lib/animations';

const WhatsAppIcon = ({ size = 22, className = '' }: { size?: number; className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function ContactPage() {
  const [cms, setCms] = useState<any>({});
  const contentRef = useRef<HTMLDivElement>(null);
  const contentInView = useInView(contentRef, { once: true, margin: '-60px' as `${number}px` });

  useEffect(() => {
    api.get('/cms/map').then(r => setCms(r.data)).catch(() => {});
  }, []);

  const rawWhatsApp = cms.footer_whatsapp || '+62 812 3456 7890';
  const cleanWhatsApp = rawWhatsApp.replace(/[^0-9]/g, '');
  const waLink = cleanWhatsApp.startsWith('0') ? `62${cleanWhatsApp.slice(1)}` : cleanWhatsApp;

  const contactItems = [
    { icon: Phone,        title: 'Telepon',          value: cms.footer_phone || '+62 21 1234 5678', sub: 'Senin–Sabtu, 08.00–17.00 WIB', link: `tel:${(cms.footer_phone || '+622112345678').replace(/\s+/g, '')}` },
    { icon: WhatsAppIcon, title: 'WhatsApp',          value: rawWhatsApp, sub: 'Senin–Minggu, Respon Cepat', link: `https://wa.me/${waLink}` },
    { icon: Mail,         title: 'Email',             value: cms.footer_email || 'info@masamas.co.id', sub: 'Balas dalam 1x24 jam', link: `mailto:${cms.footer_email || 'info@masamas.co.id'}` },
    { icon: MapPin,       title: 'Alamat',            value: cms.footer_address || 'Jl. Industri Raya No. 45, Jakarta Timur, 13920', sub: 'Lokasi Kantor Utama', link: null },
    { icon: Clock,        title: 'Jam Operasional',   value: 'Senin–Jumat: 08.00–17.00, Sabtu: 08.00–13.00', sub: 'WIB (Waktu Indonesia Barat)', link: null },
  ];

  return (
    <main className="min-h-screen flex flex-col overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="bg-charcoal text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
            className="text-5xl font-bold mb-4">Hubungi Kami</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto">
            Tim kami siap membantu Anda. Jangan ragu untuk menghubungi kami kapanpun Anda butuh bantuan.
          </motion.p>
        </div>
      </section>

      <section className="py-20 bg-gray-50 flex-grow">
        <div ref={contentRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

            {/* Contact Info */}
            <motion.div variants={fadeLeft} custom={0} initial="hidden" animate={contentInView ? 'visible' : 'hidden'} className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-charcoal mb-6">Informasi Kontak</h2>
                <p className="text-gray-600 leading-relaxed">Kami membuka layanan konsultasi dan pemesanan setiap hari kerja. Hubungi kami melalui salah satu saluran berikut.</p>
              </div>
              <motion.div className="space-y-6" variants={staggerContainer} initial="hidden" animate={contentInView ? 'visible' : 'hidden'}>
                {contactItems.map((item, i) => (
                  <motion.div key={i} variants={staggerItem} className="flex items-start gap-5"
                    whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <item.icon size={22} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-charcoal">{item.title}</p>
                      {item.link ? (
                        <a href={item.link} target={item.title === 'WhatsApp' ? '_blank' : undefined}
                          rel={item.title === 'WhatsApp' ? 'noopener noreferrer' : undefined}
                          className="text-gray-800 hover:text-primary transition-colors font-medium mt-0.5 block hover:underline">
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-gray-800 mt-0.5">{item.value}</p>
                      )}
                      <p className="text-gray-500 text-sm">{item.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Contact Form */}
            <motion.div variants={fadeRight} custom={0.1} initial="hidden" animate={contentInView ? 'visible' : 'hidden'}
              className="bg-white p-8 rounded-2xl shadow-sm">
              <h3 className="text-2xl font-bold text-charcoal mb-6">Kirim Pesan</h3>
              <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert('Pesan terkirim! Kami akan segera menghubungi Anda.'); }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">Nama Lengkap</label>
                    <input required type="text" placeholder="Nama Anda" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">Telepon</label>
                    <input type="tel" placeholder="+62 8xx xxxx xxxx" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 transition" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">Email</label>
                  <input required type="email" placeholder="email@anda.com" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">Subjek</label>
                  <input required type="text" placeholder="Topik pesan Anda" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">Pesan</label>
                  <textarea required rows={5} placeholder="Tulis pesan Anda di sini..." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none transition" />
                </div>
                <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition shadow-lg shadow-primary/30 flex items-center justify-center gap-2">
                  Kirim Pesan <ArrowRight size={18} />
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
