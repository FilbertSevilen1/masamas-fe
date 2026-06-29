'use client';

import { useEffect, useState } from 'react';

import api from '@/lib/api';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Pagination from '@/components/common/Pagination';
import { Plus, Edit2, Trash2, X, Save, Image, Search, Filter, RotateCcw } from 'lucide-react';

interface Category { id: number; name: string; slug: string }
interface Product {
  id: number; name: string; slug: string; price: string; stock: number;
  thumbnail: string | null; category: { name: string };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ categoryId: '', name: '', description: '', price: '', stock: '0', thumbnail: '' });

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');

  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    type?: 'danger' | 'warning' | 'info' | 'success';
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'danger' | 'warning' | 'info' | 'success' = 'danger',
    confirmText = 'Hapus',
    cancelText = 'Batal'
  ) => {
    setDialog({
      isOpen: true,
      type,
      title,
      message,
      confirmText,
      cancelText,
      showCancel: true,
      onConfirm,
    });
  };

  const showAlert = (title: string, message: string, type: 'danger' | 'success' | 'info' = 'danger') => {
    setDialog({
      isOpen: true,
      type,
      title,
      message,
      confirmText: 'OK',
      showCancel: false,
    });
  };

  // Fetch categories once on mount
  useEffect(() => {
    api.get('/categories')
      .then(r => setCategories(r.data))
      .catch(() => {});
  }, []);

  // Fetch products when pagination or category filter changes
  useEffect(() => {
    fetchData();
  }, [page, limit, selectedCategory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const categoryParam = selectedCategory ? `&category=${selectedCategory}` : '';
      const searchParam = search ? `&search=${search}` : '';
      const res = await api.get(`/products?page=${page}&limit=${limit}${categoryParam}${searchParam}`);
      setProducts(res.data.products || []);
      setTotalProducts(res.data.total || 0);
      setTotalPages(res.data.totalPages || 0);
    } catch {
      showAlert('Gagal', 'Gagal mengambil data produk', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (page === 1) {
      fetchData();
    } else {
      setPage(1);
    }
  };

  const handleCategoryChange = (catSlug: string) => {
    setSelectedCategory(catSlug);
    setPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleReset = () => {
    setSearch('');
    setSelectedCategory('');
    if (page === 1 && selectedCategory === '') {
      setLoading(true);
      api.get(`/products?page=1&limit=${limit}`)
        .then(res => {
          setProducts(res.data.products || []);
          setTotalProducts(res.data.total || 0);
          setTotalPages(res.data.totalPages || 0);
        })
        .catch(() => showAlert('Gagal', 'Gagal mengambil data produk', 'danger'))
        .finally(() => setLoading(false));
    } else {
      setPage(1);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ categoryId: '', name: '', description: '', price: '', stock: '0', thumbnail: '' });
    setModal(true);
  };
  const openEdit = (p: any) => {
    setEditing(p);
    setForm({ categoryId: p.categoryId, name: p.name, description: p.description, price: p.price, stock: String(p.stock ?? 0), thumbnail: p.thumbnail || '' });
    setModal(true);
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm(f => ({ ...f, thumbnail: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showConfirm(
      editing ? 'Simpan Perubahan' : 'Tambah Produk',
      editing ? 'Apakah Anda yakin ingin menyimpan perubahan pada produk ini?' : 'Apakah Anda yakin ingin menambahkan produk baru ini?',
      async () => {
        try {
          if (editing) {
            await api.put(`/products/${editing.id}`, form);
          } else {
            await api.post('/products', form);
          }
          setModal(false);
          fetchData();
          showAlert('Sukses', 'Produk berhasil disimpan', 'success');
        } catch (err: any) {
          console.error('Failed to save product:', err);
          const msg = err.response?.data?.message || 'Gagal menyimpan produk';
          showAlert('Gagal', msg, 'danger');
        }
      },
      'warning',
      'Simpan'
    );
  };

  const handleDelete = (id: number) => {
    showConfirm('Hapus Produk', 'Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.', async () => {
      try {
        await api.delete(`/products/${id}`);
        fetchData();
        showAlert('Sukses', 'Produk berhasil dihapus', 'success');
      } catch {
        showAlert('Gagal', 'Gagal menghapus produk', 'danger');
      }
    });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-charcoal">Kelola Produk</h1>
            <p className="text-gray-500 mt-1">{totalProducts} produk terdaftar</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition shadow-lg shadow-primary/30">
            <Plus size={20} /> Tambah Produk
          </button>
        </div>

        {/* Unified Filter Card */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl mb-6 shadow-sm flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="flex items-center gap-2 text-charcoal font-bold text-sm shrink-0">
            <Filter size={18} className="text-primary" />
            <span>Pencarian & Filter</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-grow justify-end">
            {/* Search Input */}
            <div className="relative flex-grow max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleSearch()} 
                placeholder="Cari produk..." 
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm bg-slate-50/50 hover:bg-slate-50 transition" 
              />
            </div>
            
            {/* Category Dropdown */}
            <div className="w-full sm:w-56 shrink-0">
              <select
                value={selectedCategory}
                onChange={e => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 bg-slate-50/50 hover:bg-slate-50 text-sm font-semibold text-charcoal transition"
              >
                <option value="">Semua Kategori</option>
                {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            
            {/* Reset Button */}
            {(search || selectedCategory) && (
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-red-250 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition cursor-pointer shrink-0"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            )}
            
            <button 
              onClick={handleSearch} 
              className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition shadow-md shadow-primary/20 shrink-0 cursor-pointer"
            >
              Cari
            </button>
          </div>
        </div>

        <div className="bg-slate-100 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
           <table className="w-full text-left text-sm">
            <thead className="bg-slate-200/60 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold text-charcoal">Produk</th>
                <th className="p-4 font-semibold text-charcoal">Kategori</th>
                <th className="p-4 font-semibold text-charcoal">Harga</th>
                <th className="p-4 font-semibold text-charcoal">Stok</th>
                <th className="p-4 font-semibold text-charcoal">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-slate-200/50 hover:bg-slate-200/30 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                        {p.thumbnail ? <img src={p.thumbnail} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">📦</div>}
                      </div>
                      <span className="font-medium text-charcoal line-clamp-1">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-500">{p.category.name}</td>
                  <td className="p-4 font-bold text-charcoal">Rp {Number(p.price).toLocaleString('id-ID')}</td>
                  <td className={`p-4 font-bold ${p.stock <= 5 ? 'text-red-500' : 'text-gray-600'}`}>{p.stock} unit</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="p-2 border border-slate-300 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"><Edit2 size={15} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="text-center py-8 text-gray-400">Memuat...</div>}
          {!loading && products.length === 0 && <div className="text-center py-12 text-gray-400">Belum ada produk</div>}
          
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalProducts}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={handleLimitChange}
          />
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-100 border border-slate-200 rounded-2xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-charcoal">{editing ? 'Edit Produk' : 'Tambah Produk'}</h2>
              <button onClick={() => setModal(false)} className="p-1 hover:bg-slate-200 rounded-lg transition"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">Kategori</label>
                <select required value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-charcoal">
                  <option value="">Pilih Kategori</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">Nama Produk</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-charcoal" placeholder="Nama produk" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">Deskripsi</label>
                <textarea required rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none text-charcoal" placeholder="Deskripsi produk" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">Harga (Rp)</label>
                <input required type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-charcoal" placeholder="150000" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">Stok</label>
                <input required type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-charcoal" placeholder="100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">Foto Produk</label>
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl cursor-pointer hover:border-primary transition overflow-hidden">
                  {form.thumbnail ? <img src={form.thumbnail} alt="" className="w-full h-full object-cover" /> : <div className="text-center p-3"><Image size={24} className="mx-auto mb-1 text-gray-400" /><span className="text-xs text-gray-500">Pilih foto</span></div>}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
                </label>
                <input value={form.thumbnail.startsWith('data:') ? '' : form.thumbnail} onChange={e => setForm(f => ({ ...f, thumbnail: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl mt-2 text-sm focus:outline-none text-charcoal" placeholder="Atau masukkan URL gambar" />
              </div>
              <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition flex items-center justify-center gap-2">
                <Save size={18} /> Simpan Produk
              </button>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={dialog.isOpen}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
        showCancel={dialog.showCancel}
        onConfirm={dialog.onConfirm}
        onClose={() => setDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </main>
  );
}

