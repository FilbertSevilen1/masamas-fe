'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import api from '@/lib/api';
import { ShoppingCart, Plus, Minus, ArrowLeft, Package, Tag, CheckCircle, CheckCircle2, X } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

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

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart } = useCartStore();

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
    api.get(`/products/${slug}`)
      .then(res => setProduct(res.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product.id, qty);
    setAddedToCart(true);
    triggerSnackbar(`Berhasil menambahkan ${qty} unit "${product.name}" ke keranjang belanja Anda!`, 'success');
    setTimeout(() => setAddedToCart(false), 2500);
  };

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

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-primary">Beranda</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary">Produk</Link>
          <span>/</span>
          <Link href={`/products?category=${product.category.slug}`} className="hover:text-primary">{product.category.name}</Link>
          <span>/</span>
          <span className="text-charcoal font-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-sm mb-4">
              {allImages.length > 0 ? (
                <img src={allImages[activeImage]} alt={product.name} className="w-full h-full object-cover" />
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
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition ${i === activeImage ? 'border-primary' : 'border-transparent'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase">{product.category.name}</span>
              {product.stock > 0 ? (
                <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle size={12} /> Tersedia
                </span>
              ) : (
                <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">Stok Habis</span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-charcoal mb-4 leading-snug">{product.name}</h1>
            <p className="text-4xl font-bold text-primary mb-6">Rp {Number(product.price).toLocaleString('id-ID')}</p>

            <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
              <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                <Package size={16} className="text-primary" />
                <span>Stok tersedia: <strong className="text-charcoal">{product.stock} unit</strong></span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Tag size={16} className="text-primary" />
                <span>Kategori: <strong className="text-charcoal">{product.category.name}</strong></span>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed mb-8 whitespace-pre-line">{product.description}</p>

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 hover:bg-gray-100 transition">
                  <Minus size={16} />
                </button>
                <span className="px-5 font-bold text-charcoal text-lg">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-4 py-3 hover:bg-gray-100 transition">
                  <Plus size={16} />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-grow flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition shadow-lg ${addedToCart ? 'bg-green-500 text-white shadow-green-200' : 'bg-primary text-white hover:bg-primary-dark shadow-primary/30'} disabled:opacity-40`}
              >
                {addedToCart ? <><CheckCircle size={20} /> Ditambahkan!</> : <><ShoppingCart size={20} /> Tambah ke Keranjang</>}
              </button>
            </div>
            <Link
              href="/cart"
              className="w-full block text-center py-4 border-2 border-charcoal text-charcoal rounded-xl font-bold hover:bg-charcoal hover:text-white transition"
            >
              Lihat Keranjang
            </Link>
          </div>
        </div>
      </div>

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
