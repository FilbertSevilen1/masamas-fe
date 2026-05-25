'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import api from '@/lib/api';
import { Plus, Minus, Tag } from 'lucide-react';

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
  const [whatsapp, setWhatsapp] = useState('');

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
            </div>

            <h1 className="text-3xl font-bold text-charcoal mb-4 leading-snug">{product.name}</h1>
            <p className="text-4xl font-bold text-primary mb-6">Rp {Number(product.price).toLocaleString('id-ID')}</p>

            <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Tag size={16} className="text-primary" />
                <span>Kategori: <strong className="text-charcoal">{product.category.name}</strong></span>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed mb-8 whitespace-pre-line">{product.description}</p>

            {/* Order via WhatsApp */}
            <div className="flex items-center gap-4 mb-4">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-grow flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition shadow-lg bg-[#25D366] text-white hover:bg-[#20ba5a] shadow-emerald-100 hover:scale-[1.02] active:scale-95 duration-200"
              >
                <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" className="shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>Beli via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
