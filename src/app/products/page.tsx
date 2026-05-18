'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import api from '@/lib/api';
import { Search, Filter, ChevronLeft, ChevronRight, ShoppingCart, CheckCircle2, X } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { addToCart } = useCartStore();

  const [quantities, setQuantities] = useState<Record<number, number>>({});
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
    fetchCategories();
  }, []);

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

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-charcoal text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Katalog Produk</h1>
          <p className="text-gray-400">Temukan material bangunan berkualitas untuk proyek Anda</p>
          <div className="flex items-center space-x-2 text-sm text-gray-500 mt-3">
            <Link href="/" className="hover:text-primary">Beranda</Link>
            <span>/</span>
            <span className="text-white">Produk</span>
          </div>
        </div>
      </div>

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
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <button type="submit" className="px-5 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition">
              Cari
            </button>
          </form>
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"
          >
            <option value="">Semua Kategori</option>
            {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product.id} className="card-premium group">
                <Link href={`/products/${product.slug}`}>
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    {product.thumbnail ? (
                      <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <span className="text-5xl">📦</span>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">{product.category.name}</p>
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="font-bold text-charcoal text-sm mb-3 line-clamp-2 hover:text-primary transition">{product.name}</h3>
                  </Link>
                  <div className="space-y-3 mt-3">
                    {/* Price display */}
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-gray-400">Harga Satuan:</span>
                      <span className="font-extrabold text-charcoal">Rp {Number(product.price).toLocaleString('id-ID')}</span>
                    </div>

                    {/* Compact Qty Selector + Add Button */}
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden shrink-0">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setQuantities(prev => ({
                              ...prev,
                              [product.id]: Math.max(1, (prev[product.id] || 1) - 1)
                            }));
                          }}
                          disabled={product.stock === 0}
                          className="px-2.5 py-1.5 hover:bg-gray-200 transition text-gray-500 font-bold text-xs disabled:opacity-30"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-bold text-charcoal min-w-[20px] text-center bg-white py-1">
                          {quantities[product.id] || 1}
                        </span>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setQuantities(prev => ({
                              ...prev,
                              [product.id]: Math.min(product.stock, (prev[product.id] || 1) + 1)
                            }));
                          }}
                          disabled={product.stock === 0}
                          className="px-2.5 py-1.5 hover:bg-gray-200 transition text-gray-500 font-bold text-xs disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>
                      
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.preventDefault();
                          const qty = quantities[product.id] || 1;
                          await addToCart(product.id, qty);
                          triggerSnackbar(`Berhasil menambahkan ${qty} unit "${product.name}" ke keranjang belanja Anda!`, 'success');
                          // Reset qty to 1
                          setQuantities(prev => ({ ...prev, [product.id]: 1 }));
                        }}
                        disabled={product.stock === 0}
                        className="flex-grow flex items-center justify-center gap-1 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-black transition shadow-sm disabled:opacity-40 shrink-0"
                      >
                        <ShoppingCart size={13} /> Beli
                      </button>
                    </div>
                  </div>
                  {product.stock === 0 && <p className="text-[10px] font-bold text-red-500 mt-2 text-center bg-red-50 py-1 rounded">Stok habis</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-12">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 border rounded-lg disabled:opacity-40 hover:bg-gray-100"
            >
              <ChevronLeft size={20} />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-10 h-10 rounded-lg font-semibold text-sm transition ${page === i + 1 ? 'bg-primary text-white' : 'border hover:bg-gray-100 text-charcoal'}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-2 border rounded-lg disabled:opacity-40 hover:bg-gray-100"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
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
