'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Link from 'next/link';
import Pagination from '@/components/common/Pagination';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Eye, 
  Search, 
  X, 
  FileText, 
  Image as ImageIcon, 
  Save, 
  AlertTriangle,
  AlertCircle,
  RotateCcw,
  User,
  MapPin,
  DollarSign,
  Phone,
  Filter,
  Lock,
  Info
} from 'lucide-react';

interface Order {
  id: number;
  orderNumber?: string | null;
  status: string;
  paymentStatus: string;
  shippingStatus: string;
  deliveryProof: string | null;
  deliveryNote: string | null;
  totalPrice: string;
  shippingAddr: string;
  createdAt: string;
  user: { name: string; email: string; whatsapp?: string | null };
  items: { product: { name: string }; quantity: number; price: string }[];
  paymentConfirm?: { imageUrl: string; status: string; adminNote?: string | null };
}

const PAYMENT_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Menunggu Pembayaran', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'WAITING_VERIFICATION', label: 'Menunggu Verifikasi', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'APPROVED', label: 'Pembayaran Disetujui', color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'REJECTED', label: 'Pembayaran Ditolak', color: 'bg-red-100 text-red-700 border-red-300' },
];

const SHIPPING_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Menunggu Pengiriman', color: 'bg-gray-100 text-gray-600 border-gray-300' },
  { value: 'PREPARING', label: 'Sedang Dipersiapkan', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  { value: 'IN_DELIVERY', label: 'Dalam Pengiriman', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
  { value: 'DELIVERED', label: 'Terkirim', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { value: 'RETURNED', label: 'Dikembalikan', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { value: 'CANCELLED', label: 'Dibatalkan', color: 'bg-red-100 text-red-600 border-red-300' },
];

const getPaymentStatusConfig = (status: string) => 
  PAYMENT_STATUS_OPTIONS.find(s => s.value === status) || { label: status, color: 'bg-gray-100 text-gray-600 border-gray-300' };

const getShippingStatusConfig = (status: string) => 
  SHIPPING_STATUS_OPTIONS.find(s => s.value === status) || { label: status, color: 'bg-gray-100 text-gray-600 border-gray-300' };

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [shippingFilter, setShippingFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  // Modal forms
  const [modalPaymentStatus, setModalPaymentStatus] = useState('');
  const [modalShippingStatus, setModalShippingStatus] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [deliveryProof, setDeliveryProof] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    message: '',
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    visible: false
  });

  useEffect(() => { 
    fetchOrders(); 
  }, []);

  const triggerSnackbar = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setSnackbar({ message, type, visible: true });
    setTimeout(() => {
      setSnackbar(prev => ({ ...prev, visible: false }));
    }, 4000);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch {
      triggerSnackbar('Gagal mengambil daftar pesanan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setModalPaymentStatus(order.paymentStatus || 'PENDING');
    setModalShippingStatus(order.shippingStatus || 'PENDING');
    setDeliveryNote(order.deliveryNote || '');
    setDeliveryProof(order.deliveryProof || '');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setDeliveryProof(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDetail = () => {
    if (!selectedOrder) return;
    showConfirm(
      'Simpan Perubahan Pesanan',
      `Apakah Anda yakin ingin menyimpan semua perubahan detail dan pengiriman untuk pesanan #${selectedOrder.orderNumber || selectedOrder.id}?`,
      async () => {
        setIsSaving(true);
        try {
          await api.patch(`/orders/${selectedOrder.id}/status`, {
            shippingStatus: modalShippingStatus,
            deliveryProof: deliveryProof,
            deliveryNote: deliveryNote
          });
    
          // Update local state
          setOrders(prev => prev.map(o => o.id === selectedOrder.id ? {
            ...o,
            shippingStatus: modalShippingStatus,
            deliveryProof: deliveryProof,
            deliveryNote: deliveryNote
          } : o));
    
          triggerSnackbar(`Pesanan #${selectedOrder.orderNumber || selectedOrder.id} berhasil diperbarui!`, 'success');
          setSelectedOrder(null);
        } catch {
          triggerSnackbar('Gagal menyimpan pembaruan pesanan', 'error');
        } finally {
          setIsSaving(false);
        }
      },
      'warning',
      'Simpan'
    );
  };

  const handleSelesaikanPesanan = () => {
    if (!selectedOrder) return;
    showConfirm(
      'Selesaikan Pesanan',
      `Apakah Anda yakin ingin menyelesaikan pesanan #${selectedOrder.orderNumber || selectedOrder.id}? Tindakan ini akan menandai pengiriman sukses/terkirim dan pesanan akan dikunci secara permanen.`,
      async () => {
        setIsSaving(true);
        try {
          await api.patch(`/orders/${selectedOrder.id}/status`, {
            shippingStatus: 'DELIVERED',
            deliveryProof: deliveryProof,
            deliveryNote: deliveryNote
          });
    
          // Update local state
          setOrders(prev => prev.map(o => o.id === selectedOrder.id ? {
            ...o,
            shippingStatus: 'DELIVERED',
            deliveryProof: deliveryProof,
            deliveryNote: deliveryNote
          } : o));
    
          triggerSnackbar(`Pesanan #${selectedOrder.orderNumber || selectedOrder.id} berhasil diselesaikan & dikunci secara permanen!`, 'success');
          setSelectedOrder(null);
        } catch {
          triggerSnackbar('Gagal menyelesaikan pesanan', 'error');
        } finally {
          setIsSaving(false);
        }
      },
      'success',
      'Ya, Selesaikan'
    );
  };

  // Reset to page 1 when any filter changes
  useEffect(() => {
    setPage(1);
  }, [search, paymentFilter, shippingFilter]);

  const filtered = orders.filter(o => {
    const matchSearch = !search || 
      o.user.name.toLowerCase().includes(search.toLowerCase()) || 
      String(o.id).includes(search) ||
      (o.orderNumber && o.orderNumber.toLowerCase().includes(search.toLowerCase())) ||
      o.shippingAddr.toLowerCase().includes(search.toLowerCase());
    const matchPayment = !paymentFilter || o.paymentStatus === paymentFilter;
    const matchShipping = !shippingFilter || o.shippingStatus === shippingFilter;
    return matchSearch && matchPayment && matchShipping;
  });

  const totalPages = Math.ceil(filtered.length / limit);
  const startIndex = (page - 1) * limit;
  const paginatedOrders = filtered.slice(startIndex, startIndex + limit);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-charcoal">Kelola Pesanan</h1>
            <p className="text-gray-500 mt-1">{orders.length} total transaksi terdaftar</p>
          </div>
          <button 
            onClick={fetchOrders}
            className="px-4 py-2 bg-charcoal text-white rounded-xl text-sm font-semibold hover:bg-charcoal-light transition"
          >
            Muat Ulang Data
          </button>
        </div>

        {/* Unified Filter Card */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl mb-8 shadow-sm flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
          <div className="flex items-center gap-2 text-charcoal font-bold text-sm shrink-0">
            <Filter size={18} className="text-primary" />
            <span>Pencarian & Filter Pesanan</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-grow justify-end">
            {/* Search Input */}
            <div className="relative flex-grow max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Cari ID, pembeli, atau alamat..." 
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm bg-slate-50/50 hover:bg-slate-50 transition" 
              />
            </div>
            
            {/* Payment Filter */}
            <div className="w-full sm:w-52 shrink-0">
              <select 
                value={paymentFilter} 
                onChange={e => setPaymentFilter(e.target.value)} 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 bg-slate-50/50 hover:bg-slate-50 text-sm font-semibold text-charcoal transition"
              >
                <option value="">Semua Pembayaran</option>
                {PAYMENT_STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            
            {/* Shipping Filter */}
            <div className="w-full sm:w-52 shrink-0">
              <select 
                value={shippingFilter} 
                onChange={e => setShippingFilter(e.target.value)} 
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 bg-slate-50/50 hover:bg-slate-50 text-sm font-semibold text-charcoal transition"
              >
                <option value="">Semua Pengiriman</option>
                {SHIPPING_STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            
            {/* Reset Button */}
            {(search || paymentFilter || shippingFilter) && (
              <button
                onClick={() => {
                  setSearch('');
                  setPaymentFilter('');
                  setShippingFilter('');
                }}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-red-250 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition cursor-pointer shrink-0"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-charcoal">{orders.filter(o => o.paymentStatus === 'PENDING').length}</p>
              <p className="text-xs text-gray-500 font-medium">Belum Bayar</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-charcoal">{orders.filter(o => o.paymentStatus === 'WAITING_VERIFICATION').length}</p>
              <p className="text-xs text-gray-500 font-medium">Perlu Verifikasi</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Package size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-charcoal">{orders.filter(o => o.shippingStatus === 'PREPARING').length}</p>
              <p className="text-xs text-gray-500 font-medium">Dipacking</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Truck size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-charcoal">{orders.filter(o => o.shippingStatus === 'IN_DELIVERY').length}</p>
              <p className="text-xs text-gray-500 font-medium">Dalam Pengiriman</p>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-100 text-charcoal font-semibold">
                <tr>
                  <th className="p-4">No. Pesanan</th>
                  <th className="p-4">Pelanggan</th>
                  <th className="p-4">Tanggal</th>
                  <th className="p-4">Detail Belanja</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status Pembayaran</th>
                  <th className="p-4">Status Pengiriman</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map(order => {
                  const payCfg = getPaymentStatusConfig(order.paymentStatus);
                  const shipCfg = getShippingStatusConfig(order.shippingStatus);
                  return (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                      <td className="p-4 font-bold text-charcoal">#{order.orderNumber || order.id}</td>
                      <td className="p-4">
                        <p className="font-semibold text-charcoal">{order.user.name}</p>
                        <p className="text-xs text-gray-400">{order.user.email}</p>
                        {order.user.whatsapp && (
                          <p className="text-xs text-green-600 font-medium flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            WA: {order.user.whatsapp}
                          </p>
                        )}
                      </td>
                      <td className="p-4 text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-4 max-w-xs truncate text-gray-500 text-xs">
                        {order.items.slice(0, 2).map(i => `${i.product.name} (x${i.quantity})`).join(', ')}
                        {order.items.length > 2 && ` +${order.items.length - 2} barang lainnya`}
                      </td>
                      <td className="p-4 font-extrabold text-charcoal">
                        Rp {Number(order.totalPrice).toLocaleString('id-ID')}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${payCfg.color}`}>
                          {payCfg.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${shipCfg.color}`}>
                          {shipCfg.label}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleOpenDetail(order)}
                          className="px-3.5 py-1.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark text-xs transition flex items-center justify-center gap-1.5 mx-auto shadow-sm shadow-primary/20"
                        >
                          <Eye size={13} /> Detail & Kelola
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {loading && <div className="text-center py-12 text-gray-400 font-medium">Memuat data pesanan...</div>}
          {!loading && filtered.length === 0 && <div className="text-center py-16 text-gray-400">Tidak ada pesanan ditemukan</div>}
          
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

      {/* Modern Detail & Manage Popup Modal */}
      {selectedOrder && (() => {
        const isOrderLocked = 
          selectedOrder.shippingStatus === 'DELIVERED' || 
          selectedOrder.shippingStatus === 'CANCELLED' || 
          selectedOrder.paymentStatus === 'REJECTED' || 
          selectedOrder.paymentStatus === 'RETURNED';
        const isPaymentLocked = 
          selectedOrder.paymentStatus === 'APPROVED' || 
          selectedOrder.paymentStatus === 'REJECTED' || 
          selectedOrder.paymentStatus === 'RETURNED';
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-charcoal text-white p-6 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold">Kelola Pesanan #{selectedOrder.orderNumber || selectedOrder.id}</h2>
                <p className="text-xs text-gray-300 mt-1">Dibuat pada {new Date(selectedOrder.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content Scrollable */}
            <div className="p-6 overflow-y-auto space-y-6 flex-grow">
              {isOrderLocked && (
                <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  selectedOrder.shippingStatus === 'DELIVERED' ? 'bg-green-50 text-green-800 border-green-200' :
                  selectedOrder.shippingStatus === 'CANCELLED' ? 'bg-gray-50 text-gray-800 border-gray-200' :
                  'bg-red-50 text-red-800 border-red-200'
                }`}>
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm flex items-center gap-1.5">
                      <Lock size={16} className="shrink-0" />
                      <span>Detail Pesanan Terkunci</span>
                    </h4>
                    <p className="text-xs mt-1 leading-relaxed">
                      {selectedOrder.shippingStatus === 'DELIVERED' && 'Pesanan ini telah sukses terkirim dan diselesaikan secara permanen. Status tidak dapat diubah lagi.'}
                      {selectedOrder.shippingStatus === 'CANCELLED' && 'Pesanan ini telah dibatalkan. Tindakan lebih lanjut telah dinonaktifkan.'}
                      {(selectedOrder.paymentStatus === 'REJECTED' || selectedOrder.paymentStatus === 'RETURNED') && 'Pesanan ini terkunci karena verifikasi pembayaran ditolak atau dikembalikan ke user (Gagal).'}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Customer & Shipping Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-2 text-charcoal font-bold text-sm">
                    <User size={16} /> Informasi Pelanggan
                  </div>
                  <p className="text-sm font-semibold text-charcoal">{selectedOrder.user.name}</p>
                  <p className="text-xs text-gray-500">{selectedOrder.user.email}</p>
                  {selectedOrder.user.whatsapp && (
                    <div className="mt-3">
                      <a
                        href={`https://wa.me/${selectedOrder.user.whatsapp.replace(/^0/, '62').replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-xl text-xs font-bold transition shadow-sm"
                      >
                        <Phone size={12} className="text-green-600" /> Hubungi WA: {selectedOrder.user.whatsapp}
                      </a>
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-2 text-charcoal font-bold text-sm">
                    <MapPin size={16} /> Alamat Pengiriman
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{selectedOrder.shippingAddr}</p>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="border border-gray-150 rounded-2xl overflow-hidden bg-white">
                <div className="p-3 bg-gray-50 border-b border-gray-150 text-xs font-bold text-charcoal">
                  Daftar Barang Belanjaan
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/50 text-gray-500 font-semibold border-b border-gray-150">
                    <tr>
                      <th className="p-3">Nama Produk</th>
                      <th className="p-3 text-center">Jumlah (Qty)</th>
                      <th className="p-3 text-right">Harga Satuan</th>
                      <th className="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-100 last:border-b-0">
                        <td className="p-3 font-semibold text-charcoal">{item.product.name}</td>
                        <td className="p-3 text-center font-bold text-charcoal">{item.quantity}</td>
                        <td className="p-3 text-right text-gray-600">Rp {Number(item.price).toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-extrabold text-charcoal">Rp {(Number(item.price) * item.quantity).toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-bold border-t border-gray-150">
                      <td colSpan={3} className="p-3 text-right text-charcoal">TOTAL BELANJA:</td>
                      <td className="p-3 text-right text-primary text-sm font-black">Rp {Number(selectedOrder.totalPrice).toLocaleString('id-ID')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Status Split Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Payment Status Side */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-4">
                  <h3 className="font-bold text-charcoal text-sm border-b pb-2 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> 1. Status Pembayaran
                  </h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">Status Pembayaran</label>
                    <select
                      value={modalPaymentStatus}
                      disabled={true}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-100 text-gray-500 cursor-not-allowed font-semibold"
                    >
                      {PAYMENT_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <p className="text-[10px] text-orange-700 font-bold bg-orange-50 p-2.5 border border-orange-200 rounded-lg mt-2 leading-tight flex items-start gap-1.5">
                      <Info size={14} className="shrink-0 mt-0.5" />
                      <span>Status pembayaran hanya dapat diubah/diverifikasi melalui menu khusus <strong>"Verifikasi Pembayaran"</strong> demi kepatuhan finansial & keamanan data.</span>
                    </p>
                  </div>

                  {/* Payment Proof View */}
                  <div className="space-y-2">
                    <span className="block text-xs font-bold text-gray-500">Bukti Transfer Pembayaran Pelanggan</span>
                    {selectedOrder.paymentConfirm ? (
                      <div className="space-y-2">
                        <div className="aspect-video bg-gray-100 rounded-xl border border-gray-200 overflow-hidden relative group">
                          <img 
                            src={selectedOrder.paymentConfirm.imageUrl} 
                            alt="Bukti Transfer" 
                            className="w-full h-full object-contain"
                          />
                          <button 
                            type="button"
                            onClick={() => setPreviewImage(selectedOrder.paymentConfirm?.imageUrl || null)}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-xs transition cursor-pointer w-full h-full border-0"
                          >
                            Klik untuk Lihat Ukuran Penuh
                          </button>
                        </div>
                        {selectedOrder.paymentConfirm.adminNote && (
                          <div className="p-2.5 bg-yellow-50 border border-yellow-150 rounded-lg text-xs text-yellow-800">
                            <strong>Catatan Pembayaran:</strong> {selectedOrder.paymentConfirm.adminNote}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-xl text-center text-xs text-gray-400 border border-dashed flex flex-col items-center justify-center gap-1">
                        <AlertTriangle size={18} className="text-yellow-500" />
                        <span>Pelanggan belum mengunggah bukti transfer pembayaran.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Status Side */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-4">
                  <h3 className="font-bold text-charcoal text-sm border-b pb-2 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> 2. Status Pengiriman
                  </h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">Ubah Status Pengiriman</label>
                    <select
                      value={modalShippingStatus}
                      disabled={isOrderLocked || selectedOrder.paymentStatus !== 'APPROVED'}
                      onChange={e => setModalShippingStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed font-medium"
                    >
                      {SHIPPING_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {isOrderLocked ? (
                      <p className="text-[10px] text-indigo-700 font-bold bg-indigo-50 p-2 border border-indigo-200 rounded-lg mt-2 flex items-center gap-1.5">
                        <Lock size={12} className="shrink-0" />
                        <span>Pesanan telah diselesaikan/dibatalkan & dikunci secara permanen.</span>
                      </p>
                    ) : selectedOrder.paymentStatus !== 'APPROVED' ? (
                      <p className="text-[10px] text-red-700 font-bold bg-red-50 p-2.5 border border-red-200 rounded-lg mt-2 leading-tight flex items-start gap-1.5">
                        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                        <span>Status pengiriman tidak dapat diubah sebelum pembayaran disetujui (APPROVED).</span>
                      </p>
                    ) : null}
                  </div>

                  {/* Delivery Proof Action */}
                  <div className="space-y-3">
                    <span className="block text-xs font-bold text-gray-500">Bukti Pengiriman Barang (Foto Surat Jalan / Penerimaan)</span>
                    
                    {/* Show delivery proof if available */}
                    {deliveryProof ? (
                      <div className="space-y-2">
                        <div className="aspect-video bg-gray-100 rounded-xl border border-gray-200 overflow-hidden relative group">
                          <img 
                            src={deliveryProof} 
                            alt="Bukti Pengiriman" 
                            className="w-full h-full object-contain"
                          />
                          <button 
                            type="button"
                            onClick={() => setPreviewImage(deliveryProof)}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-xs transition cursor-pointer w-full h-full border-0"
                          >
                            Klik untuk Lihat Ukuran Penuh
                          </button>
                          {!isOrderLocked && selectedOrder.paymentStatus === 'APPROVED' && (
                            <button
                              type="button"
                              onClick={() => setDeliveryProof('')}
                              className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition shadow z-10 cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (isOrderLocked || selectedOrder.paymentStatus !== 'APPROVED') ? (
                      <div className="p-4 bg-gray-50 rounded-xl text-center text-xs text-gray-400 border border-dashed flex flex-col items-center justify-center gap-1">
                        <ImageIcon size={18} className="text-gray-400" />
                        <span>
                          {isOrderLocked 
                            ? 'Tidak ada bukti pengiriman yang diunggah.' 
                            : 'Upload bukti pengiriman dikunci sebelum pembayaran disetujui (APPROVED).'}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Dual upload/link selector */}
                        <div className="grid grid-cols-2 gap-2">
                          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary transition overflow-hidden bg-gray-50/50">
                            <div className="text-center p-2">
                              <ImageIcon size={20} className="mx-auto mb-1 text-gray-400" />
                              <span className="text-[10px] font-bold text-gray-500">Pilih File Foto</span>
                            </div>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={handleImageUpload} 
                            />
                          </label>
                          <div className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl p-2.5 bg-gray-50/50">
                            <span className="text-[10px] font-bold text-gray-500 mb-1.5">Atau Tempel Link URL Gambar</span>
                            <input
                              type="text"
                              placeholder="https://example.com/bukti.jpg"
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const val = (e.target as HTMLInputElement).value;
                                  if (val) setDeliveryProof(val);
                                }
                              }}
                              onBlur={e => { if (e.target.value) setDeliveryProof(e.target.value); }}
                              className="w-full px-2 py-1.5 border border-gray-250 rounded-lg text-[10px] focus:outline-none focus:ring-1 focus:ring-primary bg-white text-center shadow-sm"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Delivery Note */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Catatan/Resi Pengiriman</label>
                      <textarea
                        rows={2}
                        value={deliveryNote}
                        disabled={isOrderLocked || selectedOrder.paymentStatus !== 'APPROVED'}
                        onChange={e => setDeliveryNote(e.target.value)}
                        placeholder="Contoh: Kurir Budi, Mobil Colt Diesel B 1234 ABC. Sudah diterima Bapak Joko."
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none disabled:bg-gray-100 disabled:text-gray-500"
                      />
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end gap-3 shrink-0 flex-wrap">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 border border-gray-300 text-charcoal font-semibold rounded-xl text-sm hover:bg-gray-100 transition mr-auto"
              >
                {isOrderLocked ? 'Tutup Detail' : 'Batal'}
              </button>
              
              {!isOrderLocked && (
                <div className="flex items-center gap-3 flex-wrap">
                  {modalPaymentStatus !== 'APPROVED' && (
                    <span className="text-xs text-red-500 font-bold bg-red-50 border border-red-200 px-3 py-2 rounded-xl flex items-center gap-1.5">
                      <AlertTriangle size={14} className="shrink-0" />
                      <span>Pembayaran harus disetujui terlebih dahulu</span>
                    </span>
                  )}
                  <button
                    onClick={handleSelesaikanPesanan}
                    disabled={isSaving || modalPaymentStatus !== 'APPROVED'}
                    className="px-5 py-2.5 bg-green-600 text-white font-bold rounded-xl text-sm hover:bg-green-700 transition flex items-center gap-1.5 shadow-md shadow-green-600/20 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <CheckCircle size={16} /> Selesaikan Pesanan
                  </button>
                  <button
                    onClick={handleSaveDetail}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary-dark transition flex items-center gap-2 disabled:opacity-50 shadow-md shadow-primary/25"
                  >
                    <Save size={16} /> {isSaving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        );
      })()}
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
            {snackbar.type === 'error' && <AlertTriangle size={20} className="shrink-0" />}
            {snackbar.type === 'warning' && <AlertTriangle size={20} className="shrink-0" />}
            {snackbar.type === 'info' && <CheckCircle size={20} className="shrink-0" />}
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
