'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import api from '@/lib/api';
import Link from 'next/link';
import { 
  Download, 
  Package, 
  Truck, 
  CheckCircle, 
  FileText, 
  Upload, 
  XCircle, 
  RotateCcw,
  Clock,
  MapPin,
  Image as ImageIcon,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';

interface OrderItem {
  id: number;
  product: { name: string; thumbnail: string; price: string };
  quantity: number;
  price: string;
}

interface Order {
  id: number;
  orderNumber?: string | null;
  status: string;
  paymentStatus: string;
  shippingStatus: string;
  deliveryProof: string | null;
  deliveryNote: string | null;
  totalPrice: string;
  createdAt: string;
  shippingAddr: string;
  user?: { id: number; name: string; email: string; whatsapp?: string | null };
  items: OrderItem[];
  paymentConfirm?: { imageUrl?: string | null; status: string; adminNote: string | null };
}

const PAYMENT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Menunggu Pembayaran', color: 'bg-yellow-50 text-yellow-700 border-yellow-250' },
  WAITING_VERIFICATION: { label: 'Menunggu Verifikasi Pembayaran', color: 'bg-blue-50 text-blue-700 border-blue-250' },
  APPROVED: { label: 'Pembayaran Lunas & Disetujui', color: 'bg-green-50 text-green-700 border-green-250' },
  REJECTED: { label: 'Pembayaran Ditolak', color: 'bg-red-50 text-red-700 border-red-250' },
};

const SHIPPING_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Menunggu Verifikasi Pembayaran', color: 'bg-gray-50 text-gray-500 border-gray-200' },
  PREPARING: { label: 'Sedang Dipersiapkan', color: 'bg-purple-50 text-purple-700 border-purple-250' },
  IN_DELIVERY: { label: 'Dalam Pengiriman', color: 'bg-indigo-50 text-indigo-700 border-indigo-250' },
  DELIVERED: { label: 'Telah Sampai & Diterima', color: 'bg-emerald-50 text-emerald-700 border-emerald-250' },
  RETURNED: { label: 'Dikembalikan ke Gudang', color: 'bg-orange-50 text-orange-700 border-orange-250' },
  CANCELLED: { label: 'Dibatalkan', color: 'bg-red-50 text-red-600 border-red-200' },
};

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Cancel Modal State
  const [cancelModal, setCancelModal] = useState<{
    visible: boolean;
    orderId: number | null;
  }>({
    visible: false,
    orderId: null
  });

  // Snackbar State
  const [snackbar, setSnackbar] = useState({
    message: '',
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    visible: false
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);

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
    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.data);
    } catch {
      triggerSnackbar('Gagal memuat pesanan Anda', 'error');
    } finally {
      setLoading(false);
    }
  };

  const downloadHistory = async () => {
    triggerSnackbar('Menyiapkan riwayat transaksi PDF...', 'info');
    try {
      const res = await api.get('/orders/my-orders/history-pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'riwayat-transaksi.pdf');
      document.body.appendChild(link);
      link.click();
      triggerSnackbar('Riwayat transaksi berhasil diunduh!', 'success');
    } catch {
      triggerSnackbar('Gagal mengunduh riwayat transaksi PDF', 'error');
    }
  };

  const downloadInvoice = async (id: number) => {
    triggerSnackbar(`Menyiapkan invoice #${id} PDF...`, 'info');
    try {
      const res = await api.get(`/orders/${id}/invoice-pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      triggerSnackbar(`Invoice #${id} berhasil diunduh!`, 'success');
    } catch {
      triggerSnackbar(`Gagal mengunduh invoice #${id} PDF`, 'error');
    }
  };

  const handleCancelOrder = (id: number) => {
    setCancelModal({ visible: true, orderId: id });
  };

  const confirmCancelOrder = async () => {
    if (!cancelModal.orderId) return;
    try {
      await api.post(`/orders/${cancelModal.orderId}/cancel`);
      triggerSnackbar('Pesanan berhasil dibatalkan!', 'success');
      setCancelModal({ visible: false, orderId: null });
      fetchOrders();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Gagal membatalkan pesanan';
      triggerSnackbar(errMsg, 'error');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-grow max-w-5xl mx-auto px-4 py-12 w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-charcoal">Pesanan Saya</h1>
            <p className="text-gray-500 mt-1">{orders.length} pesanan tercatat</p>
          </div>
          <button 
            onClick={downloadHistory} 
            className="flex items-center gap-2 bg-charcoal text-white px-5 py-3 rounded-xl hover:bg-charcoal-light transition font-semibold text-sm shadow-sm"
          >
            <FileText size={18} /> Unduh Riwayat PDF
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="bg-white h-48 rounded-2xl animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Package size={60} className="mx-auto mb-4 text-gray-300 animate-bounce" />
            <h2 className="text-2xl font-bold text-gray-400">Belum ada pesanan</h2>
            <Link href="/products" className="mt-6 inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-dark transition shadow-md shadow-primary/20">
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const payCfg = PAYMENT_STATUS_LABELS[order.paymentStatus || 'PENDING'] || { label: order.paymentStatus, color: 'bg-gray-100 text-gray-600' };
              const shipCfg = SHIPPING_STATUS_LABELS[order.shippingStatus || 'PENDING'] || { label: order.shippingStatus, color: 'bg-gray-100 text-gray-600' };

              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition duration-300">
                  
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-gray-50 bg-gray-50/20 gap-4">
                    <div>
                      <h3 className="text-lg font-black text-charcoal">Pesanan #{order.orderNumber || order.id}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-left sm:text-right w-full sm:w-auto justify-between sm:justify-end">
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Tagihan</p>
                        <p className="text-xl font-extrabold text-primary">Rp {Number(order.totalPrice).toLocaleString('id-ID')}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button 
                          onClick={() => downloadInvoice(order.id)} 
                          className="flex items-center gap-1.5 border border-charcoal text-charcoal px-4 py-2 rounded-xl hover:bg-charcoal hover:text-white transition font-bold text-xs shadow-sm"
                        >
                          <Download size={13} /> Cetak Invoice PDF
                        </button>
                        {order.shippingStatus === 'PENDING' && (
                          <button 
                            onClick={() => handleCancelOrder(order.id)} 
                            className="flex items-center gap-1.5 border border-red-500 text-red-500 px-4 py-2 rounded-xl hover:bg-red-500 hover:text-white transition font-bold text-xs shadow-sm"
                          >
                            <XCircle size={13} /> Batalkan Pesanan
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Split Status Display Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 border-b border-gray-50 p-6 gap-6">
                    
                    {/* 1. Payment Status Box */}
                    <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-100">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">1. Status Pembayaran</h4>
                      <div className="flex items-center gap-2.5">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${payCfg.color}`}>
                          {payCfg.label}
                        </span>
                      </div>
                      
                      {/* Payment Actions */}
                      {order.shippingStatus !== 'CANCELLED' && (order.paymentStatus === 'PENDING' || order.paymentStatus === 'RETURNED') && (
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between gap-4 mt-2">
                          <p className="text-xs text-blue-700 leading-tight">
                            {order.paymentStatus === 'RETURNED'
                              ? 'Bukti transfer dikembalikan admin untuk di-upload ulang. Harap periksa catatan verifikasi di bawah dan unggah bukti baru.'
                              : 'Mohon transfer ke rekening toko dan unggah bukti pembayaran.'}
                          </p>
                          <Link 
                            href={`/payment-upload/${order.id}`} 
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-dark transition whitespace-nowrap shadow-sm shadow-primary/25 animate-pulse"
                          >
                            <Upload size={13} /> Upload Bukti
                          </Link>
                        </div>
                      )}

                      {order.paymentConfirm?.imageUrl && (
                        <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg space-y-2 mt-2">
                          <div className="flex items-center gap-1.5 text-xs text-blue-800 font-bold">
                            <ImageIcon size={14} /> Bukti Pembayaran Anda
                          </div>
                          
                          <div className="aspect-video bg-gray-50 border rounded-lg overflow-hidden relative group max-h-32">
                            <img 
                              src={order.paymentConfirm.imageUrl} 
                              alt="Bukti Pembayaran" 
                              className="w-full h-full object-contain"
                            />
                            <button 
                              type="button"
                              onClick={() => setPreviewImage(order.paymentConfirm?.imageUrl || null)}
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-[10px] transition cursor-pointer w-full h-full border-0"
                            >
                              Buka Gambar
                            </button>
                          </div>
                        </div>
                      )}

                      {order.paymentConfirm?.adminNote && (
                        <div className="p-2.5 bg-yellow-50 border border-yellow-150 rounded-lg text-xs text-yellow-800 mt-2">
                          <strong>Catatan Verifikasi:</strong> {order.paymentConfirm.adminNote}
                        </div>
                      )}
                    </div>

                    {/* 2. Shipping Status Box */}
                    <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-100">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">2. Status Pengiriman</h4>
                      <div>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${shipCfg.color}`}>
                          {shipCfg.label}
                        </span>
                      </div>

                      {/* Display Proof of Delivery if uploaded by Admin */}
                      {order.deliveryProof && (
                        <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg space-y-2 mt-2">
                          <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold">
                            <CheckCircle size={14} /> Bukti Pengiriman Valid
                          </div>
                          
                          <div className="aspect-video bg-gray-50 border rounded-lg overflow-hidden relative group max-h-32">
                            <img 
                              src={order.deliveryProof} 
                              alt="Bukti Pengiriman" 
                              className="w-full h-full object-contain"
                            />
                            <button 
                              type="button"
                              onClick={() => setPreviewImage(order.deliveryProof)}
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-[10px] transition cursor-pointer w-full h-full border-0"
                            >
                              Buka Gambar
                            </button>
                          </div>

                          {order.deliveryNote && (
                            <p className="text-[11px] text-emerald-700 bg-white/70 p-1.5 rounded border border-emerald-100 leading-tight">
                              <strong>Info Pengiriman:</strong> {order.deliveryNote}
                            </p>
                          )}
                        </div>
                      )}

                      {!order.deliveryProof && order.paymentStatus === 'APPROVED' && (
                        <p className="text-xs text-gray-500 italic mt-2">
                          Pesanan Anda sedang dipersiapkan dan segera dikirim oleh armada kami.
                        </p>
                      )}
                    </div>

                  </div>

                  {/* Shopping Address */}
                  <div className="px-6 pt-4 text-xs text-gray-500 space-y-1">
                    <div className="flex items-start gap-1">
                      <MapPin size={13} className="shrink-0 mt-0.5" />
                      <span><strong>Alamat Pengiriman:</strong> {order.shippingAddr}</span>
                    </div>
                    {order.user?.whatsapp && (
                      <div className="flex items-center gap-1 text-green-600 font-medium pl-4">
                        <span>💬 <strong>WhatsApp:</strong> {order.user.whatsapp}</span>
                      </div>
                    )}
                  </div>

                  {/* Ordered Items List */}
                  <div className="p-6 space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3">
                          {item.product.thumbnail ? (
                            <img src={item.product.thumbnail} alt="" className="w-12 h-12 object-cover rounded-lg border bg-white" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-lg">📦</div>
                          )}
                          <div>
                            <p className="font-semibold text-charcoal text-sm">{item.product.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">× {item.quantity} unit</p>
                          </div>
                        </div>
                        <span className="font-bold text-sm text-charcoal">
                          Rp {(Number(item.price) * item.quantity).toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Custom Confirmation Modal */}
      {cancelModal.visible && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 transform transition-all duration-300 scale-100 animate-slide-up">
            <div className="flex flex-col items-center text-center">
              {/* Icon Bubble */}
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
                <AlertTriangle size={32} className="text-red-500" />
              </div>
              
              <h3 className="text-xl font-black text-charcoal mb-2">
                Konfirmasi Pembatalan
              </h3>
              
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Apakah Anda yakin ingin membatalkan <strong>Pesanan #{orders.find(o => o.id === cancelModal.orderId)?.orderNumber || cancelModal.orderId}</strong>? Tindakan ini bersifat permanen dan pesanan tidak dapat diaktifkan kembali.
              </p>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => setCancelModal({ visible: false, orderId: null })}
                  className="px-5 py-3.5 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition font-bold text-sm shadow-sm mr-auto"
                >
                  Kembali
                </button>
                <button
                  onClick={confirmCancelOrder}
                  className="px-5 py-3.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-bold text-sm shadow-lg shadow-red-200"
                >
                  Ya, Batalkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in cursor-pointer"
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

      <Footer />
    </main>
  );
}
