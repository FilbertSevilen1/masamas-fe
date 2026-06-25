'use client';

import { useEffect, useState } from 'react';

import api from '@/lib/api';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Save, RefreshCw, Plus, Trash2, ChevronUp, ChevronDown, Pencil, X, GripVertical, Image as ImageIcon } from 'lucide-react';

interface ContentItem {
  id: number; key: string; value: string; label: string; type: string; group: string;
}

interface BannerItem {
  id: number; title: string; desc: string; image: string; position: number;
}

interface GalleryItem {
  id: number; title: string; image: string; position: number;
}

const GROUP_LABELS: Record<string, string> = {
  about: 'Bagian Tentang Kami',
  cta: 'Bagian Ajakan Bertindak (CTA)',
  footer: 'Footer & Kontak',
  payment: 'Informasi Pembayaran Bank',
  shipping: 'Informasi & Kebijakan Pengiriman',
};

// Groups that are now handled by dedicated tables or merged sections (excluded from SiteContent rendering)
const EXCLUDED_GROUPS = ['carousel', 'gallery', 'hero'];

export default function AdminCMSPage() {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [edits, setEdits] = useState<Record<string, string>>({});

  // Banners state
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [bannerForm, setBannerForm] = useState<{ title: string; desc: string; image: string }>({ title: '', desc: '', image: '' });
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [showBannerForm, setShowBannerForm] = useState(false);

  // Gallery state
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [galleryForm, setGalleryForm] = useState<{ title: string; image: string }>({ title: '', image: '' });
  const [editingGallery, setEditingGallery] = useState<GalleryItem | null>(null);
  const [showGalleryForm, setShowGalleryForm] = useState(false);

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

  const showSuccess = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [cmsRes, bannersRes, galleryRes] = await Promise.all([
        api.get('/cms'),
        api.get('/cms/banners'),
        api.get('/cms/gallery'),
      ]);
      setContents(cmsRes.data);
      const map: Record<string, string> = {};
      cmsRes.data.forEach((c: ContentItem) => { map[c.key] = c.value; });
      setEdits(map);
      setBanners(bannersRes.data);
      setGallery(galleryRes.data);
    } catch {
      showAlert('Gagal', 'Gagal memuat konten', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // ── SiteContent save ────────────────────────────────────────────────────────
  const handleSave = async (group: string) => {
    setSaving(true);
    try {
      const groupItems = contents.filter(c => c.group === group);
      const updates = groupItems.map(c => ({ key: c.key, value: edits[c.key] ?? c.value }));
      await api.put('/cms/bulk', updates);
      showSuccess();
    } catch {
      showAlert('Gagal', 'Gagal menyimpan konten', 'danger');
    } finally {
      setSaving(false);
    }
  };

  // ── Banner CRUD ─────────────────────────────────────────────────────────────
  const handleCreateBanner = async () => {
    if (!bannerForm.title.trim()) { showAlert('Peringatan', 'Judul banner harus diisi', 'info'); return; }
    setSaving(true);
    try {
      await api.post('/cms/banners', bannerForm);
      setShowBannerForm(false);
      setBannerForm({ title: '', desc: '', image: '' });
      const res = await api.get('/cms/banners');
      setBanners(res.data);
      showSuccess();
    } catch {
      showAlert('Gagal', 'Gagal menambah banner', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateBanner = async () => {
    if (!editingBanner) return;
    setSaving(true);
    try {
      await api.put(`/cms/banners/${editingBanner.id}`, {
        title: bannerForm.title,
        desc: bannerForm.desc,
        image: bannerForm.image,
      });
      setEditingBanner(null);
      setShowBannerForm(false);
      setBannerForm({ title: '', desc: '', image: '' });
      const res = await api.get('/cms/banners');
      setBanners(res.data);
      showSuccess();
    } catch {
      showAlert('Gagal', 'Gagal memperbarui banner', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBanner = (banner: BannerItem) => {
    setDialog({
      isOpen: true,
      type: 'danger',
      title: 'Hapus Banner',
      message: `Apakah Anda yakin ingin menghapus banner "${banner.title}"? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      showCancel: true,
      onConfirm: async () => {
        try {
          await api.delete(`/cms/banners/${banner.id}`);
          const res = await api.get('/cms/banners');
          setBanners(res.data);
          showSuccess();
        } catch {
          showAlert('Gagal', 'Gagal menghapus banner', 'danger');
        }
      },
    });
  };

  const handleMoveBanner = async (index: number, direction: 'up' | 'down') => {
    const newBanners = [...banners];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newBanners.length) return;

    // Swap positions
    const tempPos = newBanners[index].position;
    newBanners[index].position = newBanners[swapIndex].position;
    newBanners[swapIndex].position = tempPos;

    // Swap in array
    [newBanners[index], newBanners[swapIndex]] = [newBanners[swapIndex], newBanners[index]];
    setBanners(newBanners);

    try {
      await api.put('/cms/banners/reorder', newBanners.map(b => ({ id: b.id, position: b.position })));
    } catch {
      showAlert('Gagal', 'Gagal mengubah urutan banner', 'danger');
      const res = await api.get('/cms/banners');
      setBanners(res.data);
    }
  };

  // ── Gallery CRUD ────────────────────────────────────────────────────────────
  const handleCreateGallery = async () => {
    if (!galleryForm.title.trim()) { showAlert('Peringatan', 'Judul foto harus diisi', 'info'); return; }
    setSaving(true);
    try {
      await api.post('/cms/gallery', galleryForm);
      setShowGalleryForm(false);
      setGalleryForm({ title: '', image: '' });
      const res = await api.get('/cms/gallery');
      setGallery(res.data);
      showSuccess();
    } catch {
      showAlert('Gagal', 'Gagal menambah foto galeri', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateGallery = async () => {
    if (!editingGallery) return;
    setSaving(true);
    try {
      await api.put(`/cms/gallery/${editingGallery.id}`, {
        title: galleryForm.title,
        image: galleryForm.image,
      });
      setEditingGallery(null);
      setShowGalleryForm(false);
      setGalleryForm({ title: '', image: '' });
      const res = await api.get('/cms/gallery');
      setGallery(res.data);
      showSuccess();
    } catch {
      showAlert('Gagal', 'Gagal memperbarui foto galeri', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGallery = (photo: GalleryItem) => {
    setDialog({
      isOpen: true,
      type: 'danger',
      title: 'Hapus Foto Galeri',
      message: `Apakah Anda yakin ingin menghapus foto "${photo.title}"? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      showCancel: true,
      onConfirm: async () => {
        try {
          await api.delete(`/cms/gallery/${photo.id}`);
          const res = await api.get('/cms/gallery');
          setGallery(res.data);
          showSuccess();
        } catch {
          showAlert('Gagal', 'Gagal menghapus foto galeri', 'danger');
        }
      },
    });
  };

  const handleMoveGallery = async (index: number, direction: 'up' | 'down') => {
    const newGallery = [...gallery];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newGallery.length) return;

    const tempPos = newGallery[index].position;
    newGallery[index].position = newGallery[swapIndex].position;
    newGallery[swapIndex].position = tempPos;

    [newGallery[index], newGallery[swapIndex]] = [newGallery[swapIndex], newGallery[index]];
    setGallery(newGallery);

    try {
      await api.put('/cms/gallery/reorder', newGallery.map(g => ({ id: g.id, position: g.position })));
    } catch {
      showAlert('Gagal', 'Gagal mengubah urutan galeri', 'danger');
      const res = await api.get('/cms/gallery');
      setGallery(res.data);
    }
  };

  const openEditBanner = (banner: BannerItem) => {
    setEditingBanner(banner);
    setBannerForm({ title: banner.title, desc: banner.desc, image: banner.image });
    setShowBannerForm(true);
  };

  const openEditGallery = (photo: GalleryItem) => {
    setEditingGallery(photo);
    setGalleryForm({ title: photo.title, image: photo.image });
    setShowGalleryForm(true);
  };

  const cancelBannerForm = () => {
    setShowBannerForm(false);
    setEditingBanner(null);
    setBannerForm({ title: '', desc: '', image: '' });
  };

  const cancelGalleryForm = () => {
    setShowGalleryForm(false);
    setEditingGallery(null);
    setGalleryForm({ title: '', image: '' });
  };

  const groups = [...new Set(contents.map(c => c.group))].filter(g => !EXCLUDED_GROUPS.includes(g));

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-charcoal">CMS Landing Page</h1>
            <p className="text-gray-500 mt-1">Edit konten halaman utama website</p>
          </div>
          <button onClick={fetchAll} className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition shadow-sm">
            <RefreshCw size={16} /> Muat Ulang
          </button>
        </div>

        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-5 py-3 rounded-xl mb-6 font-medium text-sm">
            ✅ Konten berhasil disimpan!
          </div>
        )}

        {loading ? <div className="text-center py-16 text-gray-400">Memuat konten...</div> : (
          <div className="space-y-8">

            {/* ══════════════════════════════════════════════════════════════════
                CAROUSEL BANNER MANAGEMENT
            ══════════════════════════════════════════════════════════════════ */}
            <div className="bg-slate-100 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-charcoal text-white px-6 py-4 flex justify-between items-center">
                <h2 className="font-bold text-lg">🎠 Carousel Banner (Landing Page Atas)</h2>
                <button
                  onClick={() => { cancelBannerForm(); setShowBannerForm(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-primary rounded-lg text-sm font-bold hover:bg-primary-dark transition cursor-pointer"
                >
                  <Plus size={15} /> Tambah Banner
                </button>
              </div>
              <div className="p-6 space-y-4">
                {/* Banner Form (Add / Edit) */}
                {showBannerForm && (
                  <div className="bg-white rounded-xl border border-primary/30 p-5 space-y-4 shadow-sm">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-charcoal text-sm">
                        {editingBanner ? '✏️ Edit Banner' : '➕ Tambah Banner Baru'}
                      </h3>
                      <button onClick={cancelBannerForm} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                        <X size={18} />
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1">Judul</label>
                      <input
                        type="text"
                        value={bannerForm.title}
                        onChange={e => setBannerForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm text-charcoal"
                        placeholder="Judul slide banner"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1">Deskripsi</label>
                      <textarea
                        rows={2}
                        value={bannerForm.desc}
                        onChange={e => setBannerForm(prev => ({ ...prev, desc: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm resize-none text-charcoal"
                        placeholder="Deskripsi singkat banner"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1">URL Gambar</label>
                      <input
                        type="url"
                        value={bannerForm.image}
                        onChange={e => setBannerForm(prev => ({ ...prev, image: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm text-charcoal"
                        placeholder="https://example.com/image.jpg"
                      />
                      {bannerForm.image && (
                        <img src={bannerForm.image} alt="Preview" className="mt-2 h-20 object-contain rounded-lg border" />
                      )}
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                      <button onClick={cancelBannerForm} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer border border-gray-200">
                        Batal
                      </button>
                      <button
                        onClick={editingBanner ? handleUpdateBanner : handleCreateBanner}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition disabled:opacity-50 cursor-pointer shadow-md"
                      >
                        <Save size={14} /> {editingBanner ? 'Simpan Perubahan' : 'Tambah Banner'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Banner List */}
                {banners.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 text-sm">
                    <ImageIcon size={40} className="mx-auto mb-3 opacity-30" />
                    Belum ada banner. Klik &quot;Tambah Banner&quot; untuk membuat slide pertama.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {banners.map((banner, index) => (
                      <div
                        key={banner.id}
                        className="flex items-center gap-4 bg-white rounded-xl border border-slate-200 p-4 hover:border-primary/30 hover:shadow-sm transition group"
                      >
                        {/* Reorder Controls */}
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleMoveBanner(index, 'up')}
                            disabled={index === 0}
                            className="p-1 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 disabled:opacity-20 disabled:cursor-not-allowed transition cursor-pointer"
                            title="Pindah ke atas"
                          >
                            <ChevronUp size={16} />
                          </button>
                          <span className="text-[10px] font-bold text-gray-300 select-none">{index + 1}</span>
                          <button
                            onClick={() => handleMoveBanner(index, 'down')}
                            disabled={index === banners.length - 1}
                            className="p-1 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 disabled:opacity-20 disabled:cursor-not-allowed transition cursor-pointer"
                            title="Pindah ke bawah"
                          >
                            <ChevronDown size={16} />
                          </button>
                        </div>

                        {/* Image Preview */}
                        <div className="w-24 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100 border">
                          {banner.image ? (
                            <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ImageIcon size={20} />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-charcoal truncate">{banner.title}</h4>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{banner.desc || '(tidak ada deskripsi)'}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 opacity-60 group-hover:opacity-100 transition">
                          <button
                            onClick={() => openEditBanner(banner)}
                            className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition cursor-pointer"
                            title="Edit banner"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteBanner(banner)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition cursor-pointer"
                            title="Hapus banner"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                GALLERY PHOTO MANAGEMENT
            ══════════════════════════════════════════════════════════════════ */}
            <div className="bg-slate-100 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-charcoal text-white px-6 py-4 flex justify-between items-center">
                <h2 className="font-bold text-lg">🖼️ Galeri Foto (Landing Page Bawah)</h2>
                <button
                  onClick={() => { cancelGalleryForm(); setShowGalleryForm(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-primary rounded-lg text-sm font-bold hover:bg-primary-dark transition cursor-pointer"
                >
                  <Plus size={15} /> Tambah Foto
                </button>
              </div>
              <div className="p-6 space-y-4">
                {/* Gallery Form (Add / Edit) */}
                {showGalleryForm && (
                  <div className="bg-white rounded-xl border border-primary/30 p-5 space-y-4 shadow-sm">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-charcoal text-sm">
                        {editingGallery ? '✏️ Edit Foto Galeri' : '➕ Tambah Foto Galeri Baru'}
                      </h3>
                      <button onClick={cancelGalleryForm} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                        <X size={18} />
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1">Judul</label>
                      <input
                        type="text"
                        value={galleryForm.title}
                        onChange={e => setGalleryForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm text-charcoal"
                        placeholder="Judul foto galeri"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1">URL Gambar</label>
                      <input
                        type="url"
                        value={galleryForm.image}
                        onChange={e => setGalleryForm(prev => ({ ...prev, image: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm text-charcoal"
                        placeholder="https://example.com/photo.jpg"
                      />
                      {galleryForm.image && (
                        <img src={galleryForm.image} alt="Preview" className="mt-2 h-20 object-contain rounded-lg border" />
                      )}
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                      <button onClick={cancelGalleryForm} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer border border-gray-200">
                        Batal
                      </button>
                      <button
                        onClick={editingGallery ? handleUpdateGallery : handleCreateGallery}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition disabled:opacity-50 cursor-pointer shadow-md"
                      >
                        <Save size={14} /> {editingGallery ? 'Simpan Perubahan' : 'Tambah Foto'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Gallery Grid List */}
                {gallery.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 text-sm">
                    <ImageIcon size={40} className="mx-auto mb-3 opacity-30" />
                    Belum ada foto galeri. Klik &quot;Tambah Foto&quot; untuk menambahkan.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gallery.map((photo, index) => (
                      <div
                        key={photo.id}
                        className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-primary/30 hover:shadow-sm transition group"
                      >
                        {/* Image */}
                        <div className="aspect-video bg-gray-100 relative overflow-hidden">
                          {photo.image ? (
                            <img src={photo.image} alt={photo.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ImageIcon size={32} />
                            </div>
                          )}
                          {/* Position badge */}
                          <span className="absolute top-2 left-2 bg-charcoal/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                            #{index + 1}
                          </span>
                        </div>
                        {/* Info & Controls */}
                        <div className="p-3">
                          <h4 className="font-bold text-sm text-charcoal truncate mb-2">{photo.title}</h4>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleMoveGallery(index, 'up')}
                                disabled={index === 0}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 disabled:opacity-20 disabled:cursor-not-allowed transition cursor-pointer"
                                title="Pindah ke atas"
                              >
                                <ChevronUp size={14} />
                              </button>
                              <button
                                onClick={() => handleMoveGallery(index, 'down')}
                                disabled={index === gallery.length - 1}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 disabled:opacity-20 disabled:cursor-not-allowed transition cursor-pointer"
                                title="Pindah ke bawah"
                              >
                                <ChevronDown size={14} />
                              </button>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditGallery(photo)}
                                className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition cursor-pointer"
                                title="Edit foto"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteGallery(photo)}
                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition cursor-pointer"
                                title="Hapus foto"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                EXISTING SITECONTENT GROUPS (exclude carousel & gallery)
            ══════════════════════════════════════════════════════════════════ */}
            {groups.map(group => (
              <div key={group} className="bg-slate-100 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-charcoal text-white px-6 py-4 flex justify-between items-center">
                  <h2 className="font-bold text-lg">{GROUP_LABELS[group] || group}</h2>
                  <button
                    onClick={() => handleSave(group)}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-primary rounded-lg text-sm font-bold hover:bg-primary-dark transition disabled:opacity-50"
                  >
                    <Save size={15} /> Simpan Bagian Ini
                  </button>
                </div>
                <div className="p-6 space-y-5">
                  {contents.filter(c => c.group === group).map(item => (
                    <div key={item.key}>
                      <label className="block text-sm font-semibold text-charcoal mb-2">
                        {item.label}
                        {item.key === 'footer_whatsapp' && (
                          <span className="ml-2 text-xs text-[#25D366] font-bold bg-[#25D366]/10 px-2 py-0.5 rounded-full">WhatsApp</span>
                        )}
                      </label>
                      {item.key === 'footer_whatsapp' ? (
                        <div className="space-y-2">
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-mono">+</span>
                            <input
                              type="tel"
                              value={edits[item.key] ?? item.value}
                              onChange={e => setEdits(prev => ({ ...prev, [item.key]: e.target.value }))}
                              className="w-full pl-8 pr-4 py-3 border border-[#25D366]/40 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25D366]/40 text-sm font-mono text-charcoal"
                              placeholder="+62 812 3456 7890"
                            />
                          </div>
                          {edits[item.key] && (() => {
                            const clean = (edits[item.key] ?? '').replace(/[^0-9]/g, '');
                            const waNum = clean.startsWith('0') ? `62${clean.slice(1)}` : clean;
                            return waNum.length > 4 ? (
                              <a
                                href={`https://wa.me/${waNum}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-[#25D366] hover:underline font-semibold"
                              >
                                <svg viewBox="0 0 24 24" width={13} height={13} fill="currentColor">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                Test link: wa.me/{waNum}
                              </a>
                            ) : null;
                          })()}
                          <p className="text-xs text-gray-400">Format: 62812xxxxxxx atau +62 812 xxxx xxxx. Nomor ini digunakan untuk tombol &quot;Beli via WhatsApp&quot; di seluruh website.</p>
                        </div>
                      ) : item.type === 'textarea' ? (
                        <textarea
                          rows={3}
                          value={edits[item.key] ?? item.value}
                          onChange={e => setEdits(prev => ({ ...prev, [item.key]: e.target.value }))}
                          className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm resize-none text-charcoal"
                        />
                      ) : item.type === 'image' ? (
                        <div className="space-y-2">
                          {edits[item.key] && <img src={edits[item.key]} alt="" className="h-24 object-contain rounded-lg border" />}
                          <input
                            type="url"
                            value={edits[item.key] ?? item.value}
                            onChange={e => setEdits(prev => ({ ...prev, [item.key]: e.target.value }))}
                            className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm text-charcoal"
                            placeholder="URL gambar"
                          />
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={edits[item.key] ?? item.value}
                          onChange={e => setEdits(prev => ({ ...prev, [item.key]: e.target.value }))}
                          className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm text-charcoal"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
