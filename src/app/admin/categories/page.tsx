'use client';

import { useEffect, useState } from 'react';

import api from '@/lib/api';
import { Plus, Edit2, Trash2, X, Save, Image } from 'lucide-react';

interface Category { id: number; name: string; slug: string; image: string | null; _count: { products: number } }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', image: '' });

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    const res = await api.get('/categories');
    setCategories(res.data);
    setLoading(false);
  };

  const openCreate = () => { setEditing(null); setForm({ name: '', image: '' }); setModal(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm({ name: c.name, image: c.image || '' }); setModal(true); };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm(f => ({ ...f, image: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/categories/${editing.id}`, form);
      } else {
        await api.post('/categories', form);
      }
      setModal(false);
      fetchCategories();
    } catch { alert('Gagal menyimpan kategori'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin hapus kategori ini?')) return;
    await api.delete(`/categories/${id}`);
    fetchCategories();
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-charcoal">Kelola Kategori</h1>
            <p className="text-gray-500 mt-1">{categories.length} kategori tersedia</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition shadow-lg shadow-primary/30">
            <Plus size={20} /> Tambah Kategori
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
              <div className="aspect-video bg-gray-100 overflow-hidden">
                {cat.image ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">🏗️</div>}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-charcoal">{cat.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{cat._count.products} produk</p>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => openEdit(cat)} className="flex-1 flex items-center justify-center gap-1 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
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
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-charcoal">{editing ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
              <button onClick={() => setModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">Nama Kategori</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="Contoh: Semen & Beton" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">Gambar</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary transition overflow-hidden">
                  {form.image ? <img src={form.image} alt="" className="w-full h-full object-cover" /> : <div className="text-center p-4"><Image size={28} className="mx-auto mb-2 text-gray-400" /><span className="text-sm text-gray-500">Pilih gambar</span></div>}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
                </label>
                <input value={form.image.startsWith('data:') ? '' : form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl mt-2 text-sm focus:outline-none" placeholder="Atau masukkan URL gambar" />
              </div>
              <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition flex items-center justify-center gap-2">
                <Save size={18} /> Simpan
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

