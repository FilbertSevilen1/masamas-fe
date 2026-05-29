'use client';

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, ArrowRight, Maximize2, X } from 'lucide-react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { fadeUp, fadeLeft, fadeRight, staggerContainer, staggerItem, EASE } from '@/lib/animations';

const WhatsAppIcon = ({ size = 22, className = '' }: { size?: number; className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function ContactPage() {
  const [cms, setCms] = useState<any>({});
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const contentInView = useInView(contentRef, { once: true, margin: '-60px' as `${number}px` });

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    api.get('/cms/map').then(r => setCms(r.data)).catch(() => {});
  }, []);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isMapModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMapModalOpen]);

  // Support pressing escape to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMapModalOpen(false);
      }
    };
    if (isMapModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMapModalOpen]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedText = `Halo Admin Masamas, saya ingin mengirimkan pesan baru:\n\n` +
      `*Nama*: ${formData.name}\n` +
      `*Telepon*: ${formData.phone || '-'}\n` +
      `*Email*: ${formData.email}\n` +
      `*Subjek*: ${formData.subject}\n` +
      `*Pesan*: ${formData.message}`;

    const waRedirect = `https://wa.me/${waNumber()}?text=${encodeURIComponent(formattedText)}`;
    window.open(waRedirect, '_blank', 'noopener,noreferrer');
  };

  const waNumber = () => {
    const cleanNum = rawWhatsApp.replace(/[^0-9]/g, '');
    return cleanNum.startsWith('0') ? `62${cleanNum.slice(1)}` : cleanNum;
  };

  return (
    <main className="min-h-screen flex flex-col overflow-x-hidden">
      <Navbar />

      {/* ── HERO / HEADER ── */}
      <section className="bg-charcoal text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600" alt="bg" className="w-full h-full object-cover" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
            className="text-primary font-bold uppercase tracking-widest text-sm mb-4">Kontak Kami</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.22 }}
            className="text-5xl font-bold mb-6">Hubungi Tim Ahli Kami</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.38 }}
            className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
            Tim kami siap membantu Anda menghitung kebutuhan material konstruksi Anda. Jangan ragu untuk menghubungi kami kapanpun Anda membutuhkan dukungan teknis atau pemesanan.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.5 }}
            className="flex justify-center items-center space-x-2 text-sm text-gray-400 mt-6 bg-white/5 backdrop-blur-md px-4 py-2.5 rounded-2xl w-fit mx-auto border border-white/10 shadow-lg">
            <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1.5 font-medium">Beranda</Link>
            <span>/</span>
            <span className="text-white font-medium">Kontak</span>
          </motion.div>
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
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold text-charcoal mb-6">Kirim Pesan</h3>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">Nama Lengkap</label>
                    <input required name="name" value={formData.name} onChange={handleChange} type="text" placeholder="Nama Anda" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">Telepon</label>
                    <input name="phone" value={formData.phone} onChange={handleChange} type="tel" placeholder="+62 8xx xxxx xxxx" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 transition" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">Email</label>
                  <input required name="email" value={formData.email} onChange={handleChange} type="email" placeholder="email@anda.com" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">Subjek</label>
                  <input required name="subject" value={formData.subject} onChange={handleChange} type="text" placeholder="Topik pesan Anda" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">Pesan</label>
                  <textarea required name="message" value={formData.message} onChange={handleChange} rows={5} placeholder="Tulis pesan Anda di sini..." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none transition" />
                </div>
                <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                  Kirim via WhatsApp <ArrowRight size={18} />
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Google Maps Location Section */}
      {cms.footer_gmaps && (
        <section 
          onClick={() => setIsMapModalOpen(true)}
          className="bg-white border-t border-gray-100 relative w-full h-[450px] overflow-hidden cursor-pointer group"
        >
          <iframe
            src={cms.footer_gmaps}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full grayscale opacity-80 group-hover:opacity-90 group-hover:scale-[1.01] transition-all duration-700 pointer-events-none"
          />
          {/* Glassmorphic Interactive Hover Overlay */}
          <div className="absolute inset-0 bg-charcoal/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              className="px-6 py-3 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 flex items-center gap-2 text-charcoal font-bold text-sm hover:bg-white transition-colors"
            >
              <Maximize2 size={16} className="text-primary animate-pulse" />
              <span>Klik untuk Perbesar Peta</span>
            </motion.div>
          </div>
          {/* Floating button always visible on mobile in corner */}
          <div className="absolute bottom-4 right-4 z-10 sm:hidden">
            <div className="p-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-gray-100 text-charcoal">
              <Maximize2 size={16} className="text-primary" />
            </div>
          </div>
        </section>
      )}

      {/* Google Maps Modal */}
      <AnimatePresence>
        {isMapModalOpen && cms.footer_gmaps && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
            onClick={() => setIsMapModalOpen(false)}
          >
            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-5xl h-[80vh] bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsMapModalOpen(false)}
                className="absolute top-4 right-4 z-10 p-3 bg-white/95 backdrop-blur-md text-charcoal hover:text-primary hover:bg-white rounded-2xl shadow-xl transition-all border border-gray-100 hover:scale-105 active:scale-95 duration-200"
              >
                <X size={20} />
              </button>

              {/* Interactive Iframe */}
              <iframe
                src={cms.footer_gmaps}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
