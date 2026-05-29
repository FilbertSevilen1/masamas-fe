'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface CmsMap {
  gallery_1_title?: string; gallery_1_image?: string;
  gallery_2_title?: string; gallery_2_image?: string;
  gallery_3_title?: string; gallery_3_image?: string;
  gallery_4_title?: string; gallery_4_image?: string;
  gallery_5_title?: string; gallery_5_image?: string;
  gallery_6_title?: string; gallery_6_image?: string;
  [key: string]: string | undefined;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: EASE } }
};

export default function GalleryPage() {
  const [cms, setCms] = useState<CmsMap>({});
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    api.get('/cms/map')
      .then(res => setCms(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const galleryItems = [
    { image: cms.gallery_1_image || 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=600', title: cms.gallery_1_title || 'Proyek Perumahan Elite' },
    { image: cms.gallery_2_image || 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?q=80&w=600', title: cms.gallery_2_title || 'Konstruksi Jembatan Baja' },
    { image: cms.gallery_3_image || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600', title: cms.gallery_3_title || 'Pabrik Industri Modern' },
    { image: cms.gallery_4_image || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600', title: cms.gallery_4_title || 'Pembangunan Ruko 3 Lantai' },
    { image: cms.gallery_5_image || 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=600', title: cms.gallery_5_title || 'Gudang Logistik Skala Besar' },
    { image: cms.gallery_6_image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600', title: cms.gallery_6_title || 'Renovasi Rumah Tinggal' },
  ];

  const nextImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % galleryItems.length);
    }
  };

  const prevImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + galleryItems.length) % galleryItems.length);
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex]);

  // Prevent scroll when lightbox is open
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [lightboxIndex]);

  return (
    <main className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden">
      <Navbar />

      {/* ── HERO / HEADER ── */}
      <section className="bg-charcoal text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=1600" alt="bg" className="w-full h-full object-cover" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
            className="text-primary font-bold uppercase tracking-widest text-sm mb-4">Galeri Proyek</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.22 }}
            className="text-5xl font-bold mb-6">Dokumentasi Portofolio Proyek</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.38 }}
            className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
            Dokumentasi proyek konstruksi residensial, komersial, dan industrial yang kokoh dibangun menggunakan material bangunan premium dari Masamas.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.5 }}
            className="flex justify-center items-center space-x-2 text-sm text-gray-400 mt-6 bg-white/5 backdrop-blur-md px-4 py-2.5 rounded-2xl w-fit mx-auto border border-white/10 shadow-lg">
            <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1.5 font-medium">Beranda</Link>
            <span>/</span>
            <span className="text-white font-medium">Galeri</span>
          </motion.div>
        </div>
      </section>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full flex-grow">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-video bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {galleryItems.map((item, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="group relative rounded-2xl overflow-hidden aspect-video shadow-md hover:shadow-2xl bg-charcoal cursor-pointer border border-gray-100/50"
                onClick={() => setLightboxIndex(i)}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85"
                />
                
                {/* Overlay details */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6" />
                
                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-[-10px] group-hover:translate-y-0">
                  <ZoomIn size={18} className="text-white" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-white font-bold text-lg drop-shadow-md">{item.title}</h3>
                  <p className="text-primary text-xs font-bold uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-350">
                    Klik untuk memperbesar
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-10"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Close Button */}
            <button
              className="absolute top-6 right-6 z-55 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors cursor-pointer border border-white/10"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(null); }}
            >
              <X size={24} />
            </button>

            {/* Left Nav */}
            <button
              className="absolute left-4 sm:left-8 z-55 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors cursor-pointer border border-white/10 hidden sm:block"
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
            >
              <ChevronLeft size={24} />
            </button>

            {/* Right Nav */}
            <button
              className="absolute right-4 sm:right-8 z-55 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors cursor-pointer border border-white/10 hidden sm:block"
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
            >
              <ChevronRight size={24} />
            </button>

            {/* Content container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-5xl max-h-[80vh] w-full flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={galleryItems[lightboxIndex].image}
                alt={galleryItems[lightboxIndex].title}
                className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl border border-white/10"
              />
              
              {/* Lightbox Text */}
              <div className="text-center mt-6 text-white max-w-xl">
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight">{galleryItems[lightboxIndex].title}</h3>
                <p className="text-gray-400 text-xs mt-2 uppercase tracking-widest">
                  Gambar {lightboxIndex + 1} dari {galleryItems.length}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
