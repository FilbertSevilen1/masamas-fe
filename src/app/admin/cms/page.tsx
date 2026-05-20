'use client';

import { useEffect, useState } from 'react';

import api from '@/lib/api';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Save, RefreshCw } from 'lucide-react';

interface ContentItem {
  id: number; key: string; value: string; label: string; type: string; group: string;
}

const GROUP_LABELS: Record<string, string> = {
  hero: 'Bagian Hero (Banner Utama)',
  about: 'Bagian Tentang Kami',
  cta: 'Bagian Ajakan Bertindak (CTA)',
  footer: 'Footer & Kontak',
  payment: 'Informasi Pembayaran Bank',
  shipping: 'Informasi & Kebijakan Pengiriman',
};

export default function AdminCMSPage() {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [edits, setEdits] = useState<Record<string, string>>({});

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

  useEffect(() => { fetchContents(); }, []);

  const fetchContents = async () => {
    const res = await api.get('/cms');
    setContents(res.data);
    const map: Record<string, string> = {};
    res.data.forEach((c: ContentItem) => { map[c.key] = c.value; });
    setEdits(map);
    setLoading(false);
  };

  const handleSave = async (group: string) => {
    setSaving(true);
    try {
      const groupItems = contents.filter(c => c.group === group);
      const updates = groupItems.map(c => ({ key: c.key, value: edits[c.key] ?? c.value }));
      await api.put('/cms/bulk', updates);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      showAlert('Gagal', 'Gagal menyimpan konten', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const groups = [...new Set(contents.map(c => c.group))];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-charcoal">CMS Landing Page</h1>
            <p className="text-gray-500 mt-1">Edit konten halaman utama website</p>
          </div>
          <button onClick={fetchContents} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
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
            {groups.map(group => (
              <div key={group} className="bg-white rounded-2xl shadow-sm overflow-hidden">
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
                      <label className="block text-sm font-semibold text-charcoal mb-2">{item.label}</label>
                      {item.type === 'textarea' ? (
                        <textarea
                          rows={3}
                          value={edits[item.key] ?? item.value}
                          onChange={e => setEdits(prev => ({ ...prev, [item.key]: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm resize-none"
                        />
                      ) : item.type === 'image' ? (
                        <div className="space-y-2">
                          {edits[item.key] && <img src={edits[item.key]} alt="" className="h-24 object-contain rounded-lg border" />}
                          <input
                            type="url"
                            value={edits[item.key] ?? item.value}
                            onChange={e => setEdits(prev => ({ ...prev, [item.key]: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                            placeholder="URL gambar"
                          />
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={edits[item.key] ?? item.value}
                          onChange={e => setEdits(prev => ({ ...prev, [item.key]: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
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

