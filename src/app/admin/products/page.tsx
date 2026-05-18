'use client';

import { useEffect, useState } from 'react';

import api from '@/lib/api';
import { Plus, Edit2, Trash2, X, Save, Image, Search } from 'lucide-react';

interface Category { id: number; name: string }
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
  const [form, setForm] = useState({ categoryId: '', name: '', description: '', price: '', stock: '', thumbnail: '' });

  useEffect(() => {
    fetchData();
    api.get('/categories').then(r => setCategories(r.data));
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const res = await api.get(`/products?limit=50${search ? `&search=${search}` : ''}`);
    setProducts(res.data.products);
    setLoading(false);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ categoryId: '', name: '', description: '', price: '', stock: '', thumbnail: '' });
    setModal(true);
  };
  const openEdit = (p: any) => {
    setEditing(p);
    setForm({ categoryId: p.categoryId, name: p.name, description: p.description, price: p.price, stock: p.stock, thumbnail: p.thumbnail || '' });
    setModal(true);
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm(f => ({ ...f, thumbnail: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, form);
      } else {
        await api.post('/products', form);
      }
      setModal(false);
      fetchData();
    } catch { alert('Gagal menyimpan produk'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin hapus produk ini?')) return;
    await api.delete(`/products/${id}`);
    fetchData();
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-charcoal">Kelola Produk</h1>
            <p className="text-gray-500 mt-1">{products.length} produk terdaftar</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition shadow-lg shadow-primary/30">
            <Plus size={20} /> Tambah Produk
          </button>
        </div>

        {/* Search */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-grow max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchData()} placeholder="Cari produk..." className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm" />
          </div>
          <button onClick={fetchData} className="px-4 py-2.5 bg-charcoal text-white rounded-xl text-sm font-semibold hover:bg-charcoal-light transition">Cari</button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
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
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        {p.thumbnail ? <img src={p.thumbnail} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">📦</div>}
                      </div>
                      <span className="font-medium text-charcoal line-clamp-1">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-500">{p.category.name}</td>
                  <td className="p-4 font-bold text-charcoal">Rp {Number(p.price).toLocaleString('id-ID')}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.stock > 0 ? `${p.stock} unit` : 'Habis'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"><Edit2 size={15} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="text-center py-8 text-gray-400">Memuat...</div>}
          {!loading && products.length === 0 && <div className="text-center py-12 text-gray-400">Belum ada produk</div>}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-charcoal">{editing ? 'Edit Produk' : 'Tambah Produk'}</h2>
              <button onClick={() => setModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">Kategori</label>
                <select required value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40">
                  <option value="">Pilih Kategori</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">Nama Produk</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="Nama produk" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">Deskripsi</label>
                <textarea required rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" placeholder="Deskripsi produk" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">Harga (Rp)</label>
                  <input required type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="150000" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">Stok</label>
                  <input required type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="100" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">Foto Produk</label>
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary transition overflow-hidden">
                  {form.thumbnail ? <img src={form.thumbnail} alt="" className="w-full h-full object-cover" /> : <div className="text-center p-3"><Image size={24} className="mx-auto mb-1 text-gray-400" /><span className="text-xs text-gray-500">Pilih foto</span></div>}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
                </label>
                <input value={form.thumbnail.startsWith('data:') ? '' : form.thumbnail} onChange={e => setForm(f => ({ ...f, thumbnail: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl mt-2 text-sm focus:outline-none" placeholder="Atau masukkan URL gambar" />
              </div>
              <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition flex items-center justify-center gap-2">
                <Save size={18} /> Simpan Produk
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

