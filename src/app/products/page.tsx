'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import api from '@/lib/api';
import { Search, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { motion } from 'framer-motion';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  stock: number;
  thumbnail: string | null;
  category: { name: string; slug: string };
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

function ProductsContent() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get('category') || '';
  const searchParamVal = searchParams.get('search') || '';

  const { addToCart } = useCartStore();
  const { isLoggedIn, isAdmin } = useAuthStore();
  const router = useRouter();
  const [modalAlert, setModalAlert] = useState<{ open: boolean; type: 'info' | 'success' | 'danger'; title: string; message: string }>({ open: false, type: 'info', title: '', message: '' });

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

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParamVal);
  const [selectedCategory, setSelectedCategory] = useState(catParam);
  const [sort, setSort] = useState('createdAt');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [whatsapp, setWhatsapp] = useState('');

  useEffect(() => {
    fetchCategories();
    api.get('/cms/map')
      .then(res => setWhatsapp(res.data.footer_whatsapp || '+62 812 3456 7890'))
      .catch(() => setWhatsapp('+62 812 3456 7890'));
  }, []);

  // Update selectedCategory and search when query parameters change
  useEffect(() => {
    setSelectedCategory(catParam);
    setSearch(searchParamVal);
    setPage(1);
  }, [catParam, searchParamVal]);

  useEffect(() => {
    fetchProducts();
  }, [page, selectedCategory, sort]);

  const fetchCategories = async () => {
    const res = await api.get('/categories');
    setCategories(res.data);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '12',
        sort,
        ...(selectedCategory && { category: selectedCategory }),
        ...(search && { search }),
      });
      const res = await api.get(`/products?${params}`);
      setProducts(res.data.products);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const cleanNum = whatsapp.replace(/[^0-9]/g, '');
  const waNumber = cleanNum.startsWith('0') ? `62${cleanNum.slice(1)}` : cleanNum;

  return (
    <main className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden">
      <Navbar />

      {/* ── HERO / HEADER ── */}
      <section className="bg-charcoal text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1600" alt="bg" className="w-full h-full object-cover" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
            className="text-primary font-bold uppercase tracking-widest text-sm mb-4">Katalog Produk</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.22 }}
            className="text-5xl font-bold mb-6">Pilihan Material Terbaik</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.38 }}
            className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
            Temukan material bangunan berkualitas tinggi langsung dari produsen terpercaya. Kami menjamin ketahanan, keaslian, dan pengiriman tepat waktu ke lokasi proyek Anda.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.5 }}
            className="flex justify-center items-center space-x-2 text-sm text-gray-400 mt-6 bg-white/5 backdrop-blur-md px-4 py-2.5 rounded-2xl w-fit mx-auto border border-white/10 shadow-lg">
            <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1.5 font-medium">Beranda</Link>
            <span>/</span>
            <span className="text-white font-medium">Produk</span>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex-grow flex gap-2">
            <div className="relative flex-grow">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari produk..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"
              />
            </div>
            <button type="submit" className="px-5 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition shadow-lg shadow-primary/10">
              Cari
            </button>
          </form>
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white cursor-pointer"
          >
            <option value="">Semua Kategori</option>
            {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white cursor-pointer"
          >
            <option value="createdAt">Terbaru</option>
            <option value="price_asc">Harga Terendah</option>
            <option value="price_desc">Harga Tertinggi</option>
          </select>
        </div>

        <p className="text-sm text-gray-500 mb-6">Menampilkan {products.length} dari {total} produk</p>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-2xl font-bold text-gray-400">Produk tidak ditemukan</p>
            <p className="text-gray-500 mt-2">Coba ubah filter atau kata kunci pencarian</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            key={`${selectedCategory}-${page}-${sort}`} // Force grid animations on dependency changes
          >
            {products.map(product => {
              const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Halo Admin Masamas, saya tertarik untuk memesan produk:\n\n*Nama Produk*: ${product.name}\n*Jumlah*: 1 unit\n*Harga*: Rp ${Number(product.price).toLocaleString('id-ID')}\n\nApakah barang tersebut tersedia? Mohon informasinya.`)}`;

              return (
                <motion.div
                  key={product.id}
                  variants={staggerItem}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="card-premium group flex flex-col justify-between h-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300"
                >
                  <div>
                    <Link href={`/products/${product.slug}`}>
                      <div className="aspect-square bg-gray-100 overflow-hidden relative">
                        {product.thumbnail ? (
                          <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <span className="text-5xl">📦</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </Link>
                    <div className="p-4">
                      <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">{product.category.name}</p>
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="font-bold text-charcoal text-sm mb-3 line-clamp-2 hover:text-primary transition">{product.name}</h3>
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
                          className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition shadow-sm hover:scale-[1.02] active:scale-95 duration-200 cursor-pointer"
                        >
                          <ShoppingCart size={14} />
                          <span>Tambah ke Keranjang</span>
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-gray-250 text-gray-400 rounded-xl text-xs font-bold cursor-not-allowed"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-12">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 border rounded-lg disabled:opacity-40 hover:bg-gray-100 transition duration-150 cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all duration-150 cursor-pointer ${page === i + 1 ? 'bg-primary text-white shadow-md shadow-primary/20' : 'border hover:bg-gray-100 text-charcoal bg-white'}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-2 border rounded-lg disabled:opacity-40 hover:bg-gray-100 transition duration-150 cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
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

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="bg-charcoal text-white py-24 relative overflow-hidden text-center">
          <div className="absolute inset-0 opacity-20">
            <img src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1600" alt="bg" className="w-full h-full object-cover" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <p className="text-primary font-bold uppercase tracking-widest text-sm mb-4">Katalog Produk</p>
            <h1 className="text-5xl font-bold mb-6">Pilihan Material Terbaik</h1>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Temukan material bangunan berkualitas tinggi langsung dari produsen terpercaya.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex-grow w-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
        <Footer />
      </main>
    }>
      <ProductsContent />
    </Suspense>
  );
}
