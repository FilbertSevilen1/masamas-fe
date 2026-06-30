'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import api from '@/lib/api';
import { Plus, Minus, Tag, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { motion } from 'framer-motion';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  stock: number;
  thumbnail: string | null;
  images: { id: number; url: string }[];
  category: { name: string; slug: string };
}

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.65, ease: EASE, delay },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.65, ease: EASE } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [whatsapp, setWhatsapp] = useState('');

  const { addToCart } = useCartStore();
  const { isLoggedIn, isAdmin } = useAuthStore();
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [modalAlert, setModalAlert] = useState<{ open: boolean; type: 'info' | 'success' | 'danger'; title: string; message: string }>({ open: false, type: 'info', title: '', message: '' });

  const handleAddToCart = async (redirectToCheck = false) => {
    if (!isLoggedIn) {
      setModalAlert({ open: true, type: 'info', title: 'Informasi', message: 'Silakan login terlebih dahulu untuk berbelanja.' });
      return;
    }
    if (isAdmin) {
      setModalAlert({ open: true, type: 'info', title: 'Informasi', message: 'Akun Admin tidak diperbolehkan berbelanja. Silakan masuk dengan akun customer untuk melakukan pemesanan.' });
      return;
    }
    if (!product || product.stock === 0) return;
    setAdding(true);
    const res = await addToCart(product.id, qty);
    setAdding(false);
    if (res.success) {
      if (redirectToCheck) {
        router.push('/cart');
      } else {
        setModalAlert({ open: true, type: 'success', title: 'Berhasil', message: 'Produk berhasil ditambahkan ke keranjang!' });
      }
    } else {
      setModalAlert({ open: true, type: 'danger', title: 'Gagal', message: res.message || 'Gagal menambahkan produk ke keranjang.' });
    }
  };

  useEffect(() => {
    api.get(`/products/${slug}`)
      .then(res => setProduct(res.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));

    api.get('/cms/map')
      .then(res => setWhatsapp(res.data.footer_whatsapp || '+62 812 3456 7890'))
      .catch(() => setWhatsapp('+62 812 3456 7890'));
  }, [slug]);

  const allImages = product ? [
    ...(product.thumbnail ? [product.thumbnail] : []),
    ...product.images.map(i => i.url)
  ] : [];

  if (loading) return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
      <Footer />
    </main>
  );

  if (!product) return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col items-center justify-center text-center px-4">
        <p className="text-6xl mb-4">📦</p>
        <h1 className="text-3xl font-bold text-charcoal mb-2">Produk Tidak Ditemukan</h1>
        <p className="text-gray-500 mb-8">Produk yang Anda cari tidak tersedia atau telah dihapus.</p>
        <Link href="/products" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-dark transition">
          Kembali ke Katalog
        </Link>
      </div>
      <Footer />
    </main>
  );

  const cleanNum = whatsapp.replace(/[^0-9]/g, '');
  const waNumber = cleanNum.startsWith('0') ? `62${cleanNum.slice(1)}` : cleanNum;
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Halo Admin Masamas, saya tertarik untuk memesan produk:\n\n*Nama Produk*: ${product.name}\n*Harga*: Rp ${Number(product.price).toLocaleString('id-ID')}\n\nApakah barang tersebut tersedia? Mohon informasinya.`)}`;

  return (
    <main className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center space-x-2 text-sm text-gray-500 mb-8"
        >
          <Link href="/" className="hover:text-primary transition-colors">Beranda</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary transition-colors">Produk</Link>
          <span>/</span>
          <Link href={`/products?category=${product.category.slug}`} className="hover:text-primary transition-colors">{product.category.name}</Link>
          <span>/</span>
          <span className="text-charcoal font-medium">{product.name}</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images Column */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="w-full"
          >
            <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-sm mb-4 border border-gray-100 relative group">
              {allImages.length > 0 ? (
                <img src={allImages[activeImage]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-8xl">📦</div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer ${i === activeImage ? 'border-primary scale-102 shadow-sm' : 'border-transparent opacity-80 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info Column */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col justify-start"
          >
            {/* Category Badge */}
            <motion.div variants={staggerItem} className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">{product.category.name}</span>
            </motion.div>

            {/* Title */}
            <motion.h1 variants={staggerItem} className="text-3xl sm:text-4xl font-extrabold text-charcoal mb-4 leading-tight">
              {product.name}
            </motion.h1>

            {/* Price */}
            <motion.p variants={staggerItem} className="text-3xl sm:text-4xl font-black text-primary mb-6">
              Rp {Number(product.price).toLocaleString('id-ID')}
            </motion.p>

            {/* Attributes Card */}
            <motion.div variants={staggerItem} className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100/60">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Tag size={18} className="text-primary" />
                <span>Kategori: <strong className="text-charcoal font-semibold">{product.category.name}</strong></span>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div variants={staggerItem} className="prose max-w-none mb-8">
              <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
                {product.description}
              </p>
            </motion.div>

            {/* Quantity Selector */}
            {!isAdmin && (
              <motion.div variants={staggerItem} className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100/60 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-charcoal">Jumlah Pembelian</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {product.stock > 0 ? `Sisa stok: ${product.stock} unit` : 'Stok Habis'}
                  </p>
                </div>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                  <button
                    type="button"
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    disabled={qty <= 1 || product.stock === 0}
                    className="px-3 py-2 hover:bg-gray-200 transition text-charcoal disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 font-bold text-charcoal w-10 text-center">{product.stock > 0 ? qty : 0}</span>
                  <button
                    type="button"
                    onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                    disabled={qty >= product.stock || product.stock === 0}
                    className="px-3 py-2 hover:bg-gray-200 transition text-charcoal disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div variants={staggerItem} className="flex flex-col sm:flex-row gap-4">
              {!isAdmin && (
                product.stock > 0 ? (
                  <>
                    <button
                      onClick={() => handleAddToCart(false)}
                      disabled={adding}
                      className="flex-grow flex items-center justify-center gap-2 px-4 py-4 rounded-xl font-bold bg-white border border-primary text-primary hover:bg-emerald-50 transition-all shadow-sm hover:scale-[1.02] active:scale-95 duration-200 cursor-pointer disabled:opacity-50"
                    >
                      <ShoppingCart size={20} />
                      <span>Tambah ke Keranjang</span>
                    </button>
                    <button
                      onClick={() => handleAddToCart(true)}
                      disabled={adding}
                      className="flex-grow flex items-center justify-center gap-2 px-4 py-4 rounded-xl font-bold bg-primary text-white hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 duration-200 cursor-pointer disabled:opacity-50"
                    >
                      <span>Beli Sekarang</span>
                    </button>
                  </>
                ) : (
                  <button
                    disabled
                    className="flex-grow flex items-center justify-center gap-2 py-4 rounded-xl font-bold bg-gray-200 text-gray-400 cursor-not-allowed text-center animate-pulse"
                  >
                    Stok Habis
                  </button>
                )
              )}
              <Link
                href="/products"
                className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold bg-white border border-gray-200 text-charcoal hover:bg-gray-100 hover:scale-[1.01] transition-all duration-200 text-center"
              >
                Kembali ke Katalog
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

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
