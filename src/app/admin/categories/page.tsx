'use client';

import { useEffect, useState } from 'react';

import api from '@/lib/api';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Pagination from '@/components/common/Pagination';
import { Plus, Edit2, Trash2, X, Save, Image, Search, Filter, RotateCcw } from 'lucide-react';

interface Category { id: number; name: string; slug: string; image: string | null; _count: { products: number } }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', image: '' });

  // Search & Pagination states
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

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

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    const res = await api.get('/categories');
    setCategories(res.data);
    setLoading(false);
  };

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / limit);
  const startIndex = (page - 1) * limit;
  const paginatedCategories = filtered.slice(startIndex, startIndex + limit);

  const openCreate = () => { setEditing(null); setForm({ name: '', image: '' }); setModal(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm({ name: c.name, image: c.image || '' }); setModal(true); };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm(f => ({ ...f, image: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showConfirm(
      editing ? 'Simpan Kategori' : 'Tambah Kategori',
      editing ? 'Apakah Anda yakin ingin menyimpan perubahan pada kategori ini?' : 'Apakah Anda yakin ingin menambahkan kategori baru ini?',
      async () => {
        try {
          if (editing) {
            await api.put(`/categories/${editing.id}`, form);
          } else {
            await api.post('/categories', form);
          }
          setModal(false);
          fetchCategories();
          showAlert('Sukses', 'Kategori berhasil disimpan', 'success');
        } catch {
          showAlert('Gagal', 'Gagal menyimpan kategori', 'danger');
        }
      },
      'warning',
      'Simpan'
    );
  };

  const handleDelete = (id: number) => {
    showConfirm('Hapus Kategori', 'Apakah Anda yakin ingin menghapus kategori ini? Semua produk dalam kategori ini mungkin akan terpengaruh.', async () => {
      try {
        await api.delete(`/categories/${id}`);
        fetchCategories();
        showAlert('Sukses', 'Kategori berhasil dihapus', 'success');
      } catch {
        showAlert('Gagal', 'Gagal menghapus kategori', 'danger');
      }
    });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-charcoal">Kelola Kategori</h1>
            <p className="text-gray-500 mt-1">{filtered.length} kategori ditemukan</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition shadow-lg shadow-primary/30">
            <Plus size={20} /> Tambah Kategori
          </button>
        </div>

        {/* Unified Filter Card */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl mb-6 shadow-sm flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="flex items-center gap-2 text-charcoal font-bold text-sm shrink-0">
            <Filter size={18} className="text-primary" />
            <span>Pencarian & Filter</span>
          </div>
          
          <div className="flex items-center gap-3 flex-grow max-w-md justify-end">
            <div className="relative flex-grow">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama kategori..."
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm bg-slate-50/50 hover:bg-slate-50 transition"
              />
            </div>
            
            {search && (
              <button
                onClick={() => setSearch('')}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-red-250 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition cursor-pointer shrink-0"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {paginatedCategories.length === 0 ? (
          <div className="text-center py-16 bg-slate-100 border border-slate-200 rounded-2xl text-gray-400 font-medium">
            Tidak ada kategori ditemukan
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedCategories.map(cat => (
                <div key={cat.id} className="bg-slate-100 rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition">
                  <div className="aspect-video bg-slate-200 overflow-hidden">
                    {cat.image ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl">🏗️</div>}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-charcoal">{cat.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{cat._count.products} produk</p>
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => openEdit(cat)} className="flex-1 flex items-center justify-center gap-1 py-2 border border-slate-300 bg-slate-200/50 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition">
                        <Edit2 size={14} /> Edit
                      </button>
                      <button onClick={() => handleDelete(cat.id)} className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition">
                        <Trash2 size={14} /> Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={filtered.length}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={setLimit}
              />
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-100 border border-slate-200 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-charcoal">{editing ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
              <button onClick={() => setModal(false)} className="p-1 hover:bg-slate-200 rounded-lg transition"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">Nama Kategori</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-charcoal" placeholder="Contoh: Semen & Beton" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">Gambar</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl cursor-pointer hover:border-primary transition overflow-hidden">
                  {form.image ? <img src={form.image} alt="" className="w-full h-full object-cover" /> : <div className="text-center p-4"><Image size={28} className="mx-auto mb-2 text-gray-400" /><span className="text-sm text-gray-500">Pilih gambar</span></div>}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
                </label>
                <input value={form.image.startsWith('data:') ? '' : form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl mt-2 text-sm focus:outline-none text-charcoal" placeholder="Atau masukkan URL gambar" />
              </div>
              <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition flex items-center justify-center gap-2">
                <Save size={18} /> Simpan
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

