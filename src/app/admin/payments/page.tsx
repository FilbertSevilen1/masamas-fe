'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Pagination from '@/components/common/Pagination';
import { 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Eye, 
  Search, 
  X, 
  AlertTriangle,
  User,
  DollarSign,
  Clock,
  Calendar,
  AlertCircle,
  Filter
} from 'lucide-react';

interface Payment {
  id: number;
  status: string;
  imageUrl: string;
  adminNote: string | null;
  createdAt: string;
  order: { 
    id: number; 
    orderNumber?: string | null;
    totalPrice: string; 
    user: { name: string; email: string }; 
    items: { product: { name: string }; quantity: number }[] 
  };
}

interface SnackbarState {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  visible: boolean;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  WAITING_VERIFICATION: { label: 'Menunggu Verifikasi', color: 'bg-yellow-50 text-yellow-700 border-yellow-250' },
  APPROVED: { label: 'Pembayaran Disetujui', color: 'bg-green-50 text-green-700 border-green-250' },
  RETURNED: { label: 'Dikembalikan ke User', color: 'bg-orange-50 text-orange-700 border-orange-250' },
  REJECTED: { label: 'Pembayaran Ditolak', color: 'bg-red-50 text-red-700 border-red-250' },
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Payment | null>(null);
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Dialog State
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
    confirmText = 'Ya',
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

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Snackbar State
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    message: '',
    type: 'success',
    visible: false,
  });

  useEffect(() => { 
    fetchPayments(); 
  }, []);

  const triggerSnackbar = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setSnackbar({ message, type, visible: true });
    setTimeout(() => {
      setSnackbar(prev => ({ ...prev, visible: false }));
    }, 4000);
  };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payments');
      setPayments(res.data);
    } catch {
      triggerSnackbar('Gagal mengambil data verifikasi pembayaran', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (payment: Payment) => {
    setSelected(payment);
    setNote(payment.adminNote || '');
  };

  const handleUpdate = (status: string) => {
    if (!selected) return;
    
    let title = '';
    let message = '';
    let confirmText = '';
    let type: 'danger' | 'warning' | 'info' | 'success' = 'warning';
    
    if (status === 'APPROVED') {
      title = 'Setujui Pembayaran';
      message = `Apakah Anda yakin ingin menyetujui pembayaran untuk pesanan #${selected.order.orderNumber || selected.order.id} sebesar Rp ${Number(selected.order.totalPrice).toLocaleString('id-ID')}?`;
      confirmText = 'Ya, Setujui';
      type = 'success';
    } else if (status === 'RETURNED') {
      title = 'Minta Upload Ulang';
      message = `Apakah Anda yakin ingin meminta pelanggan pesanan #${selected.order.orderNumber || selected.order.id} untuk mengunggah ulang bukti transfer?`;
      confirmText = 'Ya, Minta';
      type = 'warning';
    } else if (status === 'REJECTED') {
      title = 'Tolak Pembayaran';
      message = `Apakah Anda yakin ingin menolak pembayaran untuk pesanan #${selected.order.orderNumber || selected.order.id}? Tindakan ini akan membatalkan status pembayaran.`;
      confirmText = 'Ya, Tolak';
      type = 'danger';
    } else {
      title = 'Konfirmasi Perubahan';
      message = 'Apakah Anda yakin ingin memperbarui status pembayaran ini?';
      confirmText = 'Ya, Ubah';
    }
    
    showConfirm(
      title,
      message,
      async () => {
        setUpdating(true);
        try {
          await api.patch(`/payments/${selected.id}/status`, { status, adminNote: note });
          
          const successMessages: Record<string, string> = {
            APPROVED: `Pembayaran pesanan #${selected.order.orderNumber || selected.order.id} berhasil disetujui!`,
            RETURNED: `Pembayaran pesanan #${selected.order.orderNumber || selected.order.id} dikembalikan untuk diupload ulang.`,
            REJECTED: `Pembayaran pesanan #${selected.order.orderNumber || selected.order.id} ditolak.`,
          };
          
          triggerSnackbar(successMessages[status] || 'Status berhasil diperbarui', 'success');
          setSelected(null);
          fetchPayments();
        } catch { 
          triggerSnackbar('Gagal memperbarui status verifikasi pembayaran', 'error'); 
        } finally { 
          setUpdating(false); 
        }
      },
      type,
      confirmText
    );
  };

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const filtered = payments.filter(p => {
    const matchSearch = !search || 
      p.order.user.name.toLowerCase().includes(search.toLowerCase()) || 
      String(p.order.id).includes(search) || 
      (p.order.orderNumber && p.order.orderNumber.toLowerCase().includes(search.toLowerCase())) ||
      p.order.user.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / limit);
  const startIndex = (page - 1) * limit;
  const paginatedPayments = filtered.slice(startIndex, startIndex + limit);

  return (
    <main className="min-h-screen bg-gray-50 relative">
      
      {/* Toast / Snackbar Notification Container */}
      {snackbar.visible && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in pointer-events-auto">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border backdrop-blur-md max-w-md ${
            snackbar.type === 'success' ? 'bg-green-500/90 text-white border-green-600' :
            snackbar.type === 'error' ? 'bg-red-500/90 text-white border-red-600' :
            snackbar.type === 'warning' ? 'bg-orange-500/90 text-white border-orange-600' :
            'bg-blue-500/90 text-white border-blue-600'
          }`}>
            {snackbar.type === 'success' && <CheckCircle size={20} className="shrink-0" />}
            {snackbar.type === 'error' && <AlertCircle size={20} className="shrink-0" />}
            {snackbar.type === 'warning' && <AlertTriangle size={20} className="shrink-0" />}
            {snackbar.type === 'info' && <AlertCircle size={20} className="shrink-0" />}
            <span className="text-xs font-bold leading-snug">{snackbar.message}</span>
            <button 
              onClick={() => setSnackbar(prev => ({ ...prev, visible: false }))}
              className="p-1 hover:bg-white/20 rounded-full transition ml-auto"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="px-6 py-10">
        
        {/* Page Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-charcoal">Verifikasi Pembayaran</h1>
            <p className="text-gray-500 mt-1">
              {payments.filter(p => p.status === 'WAITING_VERIFICATION').length} pembayaran perlu ditinjau segera
            </p>
          </div>
          <button 
            onClick={fetchPayments}
            className="px-4 py-2 bg-charcoal text-white rounded-xl text-sm font-semibold hover:bg-charcoal-light transition shadow-sm"
          >
            Refresh Data
          </button>
        </div>

        {/* Unified Filter Card */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl mb-8 shadow-sm flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="flex items-center gap-2 text-charcoal font-bold text-sm shrink-0">
            <Filter size={18} className="text-primary" />
            <span>Pencarian & Filter Pembayaran</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-grow justify-end">
            {/* Search Input */}
            <div className="relative flex-grow max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Cari ID pesanan, nama pembeli, atau email..." 
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm bg-slate-50/50 hover:bg-slate-50 transition" 
              />
            </div>
            
            {/* Status Filter */}
            <div className="w-full sm:w-56 shrink-0">
              <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)} 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 bg-slate-50/50 hover:bg-slate-50 text-sm font-semibold text-charcoal transition"
              >
                <option value="">Semua Status Pembayaran</option>
                <option value="WAITING_VERIFICATION">Menunggu Verifikasi</option>
                <option value="APPROVED">Disetujui</option>
                <option value="RETURNED">Dikembalikan</option>
                <option value="REJECTED">Ditolak</option>
              </select>
            </div>
            
            {/* Reset Button */}
            {(search || statusFilter) && (
              <button
                onClick={() => {
                  setSearch('');
                  setStatusFilter('');
                }}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-red-250 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition cursor-pointer shrink-0"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Metrics Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-charcoal">{payments.filter(p => p.status === 'WAITING_VERIFICATION').length}</p>
              <p className="text-xs text-gray-500 font-medium">Perlu Tinjau</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-charcoal">{payments.filter(p => p.status === 'APPROVED').length}</p>
              <p className="text-xs text-gray-500 font-medium">Telah Lunas</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
              <RotateCcw size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-charcoal">{payments.filter(p => p.status === 'RETURNED').length}</p>
              <p className="text-xs text-gray-500 font-medium">Dikembalikan</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <XCircle size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-charcoal">{payments.filter(p => p.status === 'REJECTED').length}</p>
              <p className="text-xs text-gray-500 font-medium">Ditolak</p>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-100 text-charcoal font-semibold">
                <tr>
                  <th className="p-4">Pesanan</th>
                  <th className="p-4">Pelanggan</th>
                  <th className="p-4">Tanggal Upload</th>
                  <th className="p-4">Daftar Barang</th>
                  <th className="p-4">Nominal</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Tinjauan</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayments.map(p => {
                  const labelCfg = STATUS_LABELS[p.status] || { label: p.status, color: 'bg-gray-100 text-gray-600' };
                  return (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                      <td className="p-4 font-bold text-charcoal">#{p.order.orderNumber || p.order.id}</td>
                      <td className="p-4">
                        <p className="font-semibold text-charcoal">{p.order.user.name}</p>
                        <p className="text-xs text-gray-400">{p.order.user.email}</p>
                      </td>
                      <td className="p-4 text-gray-500 flex items-center gap-1.5 mt-2 border-0">
                        <Calendar size={13} />
                        {new Date(p.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-4 max-w-xs truncate text-gray-500 text-xs">
                        {p.order.items.map(i => `${i.product.name} (x${i.quantity})`).join(', ')}
                      </td>
                      <td className="p-4 font-black text-charcoal">
                        Rp {Number(p.order.totalPrice).toLocaleString('id-ID')}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${labelCfg.color}`}>
                          {labelCfg.label}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleOpenReview(p)}
                          className="px-3.5 py-1.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark text-xs transition flex items-center justify-center gap-1.5 mx-auto shadow-sm shadow-primary/20"
                        >
                          <Eye size={13} /> Tinjau Pembayaran
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {loading && <div className="text-center py-12 text-gray-400 font-medium">Memuat data verifikasi...</div>}
          {!loading && filtered.length === 0 && <div className="text-center py-16 text-gray-400">Tidak ada bukti pembayaran ditemukan</div>}
          
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        </div>

      </div>

      {/* Premium Tinjau Payment Popup Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="bg-charcoal text-white p-6 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-lg font-bold">Verifikasi Pembayaran Pesanan #{selected.order.orderNumber || selected.order.id}</h2>
                <p className="text-xs text-gray-300 mt-1">Ditinjau oleh Admin Masamas</p>
              </div>
              <button 
                onClick={() => setSelected(null)}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-grow">
              
              {/* Payment Proof Preview - Maximum Screen Visibility */}
              <div className="space-y-2">
                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Bukti Transfer Fisik</span>
                <div className="aspect-video bg-gray-150 rounded-2xl border overflow-hidden relative group shadow-inner">
                  <img 
                    src={selected.imageUrl} 
                    alt="Bukti Transfer Fisik" 
                    className="w-full h-full object-contain" 
                  />
                  <button 
                    type="button"
                    onClick={() => setPreviewImage(selected.imageUrl)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-xs transition cursor-pointer w-full h-full border-0"
                  >
                    Buka Ukuran Asli
                  </button>
                </div>
              </div>

              {/* Order and Customer details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 mb-1">
                    <User size={13} /> DATA PEMBELI
                  </div>
                  <p className="text-sm font-semibold text-charcoal">{selected.order.user.name}</p>
                  <p className="text-xs text-gray-500">{selected.order.user.email}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 mb-1">
                    <DollarSign size={13} /> DATA TAGIHAN
                  </div>
                  <p className="text-sm font-extrabold text-primary">Rp {Number(selected.order.totalPrice).toLocaleString('id-ID')}</p>
                  <p className="text-xs text-gray-500">{selected.order.items.map(i => `${i.product.name} (x${i.quantity})`).join(', ')}</p>
                </div>
              </div>

              {/* Admin note for customer */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Catatan Verifikasi Admin (Dapat dilihat pelanggan)
                </label>
                <textarea
                  rows={3}
                  value={note}
                  disabled={selected.status === 'APPROVED'}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Contoh: Bukti transfer lunas / Nominal kurang Rp 10.000 / Gambar tidak terbaca."
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none shadow-sm disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>

            </div>

            <div className="bg-gray-50 p-4 border-t border-gray-100 flex flex-wrap gap-2 justify-end items-center shrink-0">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2.5 border border-gray-300 text-charcoal font-semibold rounded-xl text-sm hover:bg-gray-100 transition mr-auto"
              >
                Kembali
              </button>

              {selected.status === 'APPROVED' && (
                <span className="text-xs text-green-600 font-bold bg-green-50 border border-green-200 px-4 py-2.5 rounded-xl flex items-center gap-1.5">
                  <CheckCircle size={16} /> Pembayaran Telah Disetujui
                </span>
              )}
              {selected.status === 'REJECTED' && (
                <span className="text-xs text-red-600 font-bold bg-red-50 border border-red-200 px-4 py-2.5 rounded-xl flex items-center gap-1.5 font-bold">
                  <XCircle size={16} /> Pembayaran Telah Ditolak & Terkunci
                </span>
              )}
              
              {selected.status !== 'APPROVED' && selected.status !== 'REJECTED' && (
                <>
                  <button
                    onClick={() => handleUpdate('RETURNED')}
                    disabled={updating}
                    className="px-4 py-2.5 bg-orange-500 text-white font-bold rounded-xl text-sm hover:bg-orange-600 transition flex items-center gap-1.5 shadow-md shadow-orange-500/20 disabled:opacity-50"
                  >
                    <RotateCcw size={16} /> Minta Upload Ulang
                  </button>

                  <button
                    onClick={() => handleUpdate('REJECTED')}
                    disabled={updating}
                    className="px-4 py-2.5 bg-red-500 text-white font-bold rounded-xl text-sm hover:bg-red-600 transition flex items-center gap-1.5 shadow-md shadow-red-500/20 disabled:opacity-50"
                  >
                    <XCircle size={16} /> Tolak Bayar
                  </button>

                  <button
                    onClick={() => handleUpdate('APPROVED')}
                    disabled={updating}
                    className="px-5 py-2.5 bg-green-600 text-white font-bold rounded-xl text-sm hover:bg-green-700 transition flex items-center gap-1.5 shadow-md shadow-green-600/20 disabled:opacity-50"
                  >
                    <CheckCircle size={16} /> Lunas & Setujui
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}
      
      {/* Premium Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center">
            {/* Close button */}
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition shadow-lg border-0 cursor-pointer"
              title="Tutup"
            >
              <X size={24} />
            </button>
            
            {/* Image container */}
            <div 
              className="bg-white rounded-2xl overflow-hidden p-3 shadow-2xl max-w-full max-h-[80vh] flex items-center justify-center border border-white/20 cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={previewImage} 
                alt="Pratinjau Gambar" 
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
              />
            </div>
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
