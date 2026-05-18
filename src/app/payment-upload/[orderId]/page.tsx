'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import api from '@/lib/api';
import Link from 'next/link';
import { Upload, CheckCircle, ArrowLeft, CreditCard } from 'lucide-react';

interface Order {
  id: number;
  totalPrice: string;
  status: string;
  shippingAddr: string;
  items: { product: { name: string }; quantity: number; price: string }[];
}

interface BankInfo {
  bank_name: string;
  bank_account: string;
  bank_holder: string;
}

export default function PaymentUploadPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get(`/orders/my-orders`).then(res => {
      const found = res.data.find((o: Order) => o.id === Number(orderId));
      setOrder(found || null);
    });
    api.get('/cms/map').then(res => {
      setBankInfo({
        bank_name: res.data.bank_name || 'Bank Mandiri',
        bank_account: res.data.bank_account || '1234-5678-9012-3456',
        bank_holder: res.data.bank_holder || 'PT Masamas Jaya Abadi',
      });
    });
  }, [orderId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImageUrl(base64);
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return alert('Silakan unggah bukti pembayaran');
    setLoading(true);
    try {
      await api.post('/payments/upload', { orderId: Number(orderId), imageUrl });
      setSuccess(true);
    } catch (error) {
      alert('Gagal mengunggah bukti pembayaran');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-12 shadow-sm text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-charcoal mb-3">Bukti Pembayaran Terkirim!</h2>
          <p className="text-gray-500 mb-8">Tim kami akan memverifikasi pembayaran Anda dalam 1x24 jam. Anda akan mendapat notifikasi setelah disetujui.</p>
          <Link href="/orders" className="w-full block bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary-dark transition text-center">
            Lihat Status Pesanan
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-grow max-w-2xl mx-auto px-4 py-12 w-full">
        <Link href="/orders" className="flex items-center gap-2 text-gray-500 hover:text-charcoal mb-8 text-sm font-medium">
          <ArrowLeft size={18} /> Kembali ke Pesanan
        </Link>

        <h1 className="text-3xl font-bold text-charcoal mb-8">Unggah Bukti Pembayaran</h1>

        {/* Bank Info */}
        {bankInfo && (
          <div className="bg-charcoal text-white p-6 rounded-2xl mb-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard size={24} className="text-primary" />
              <h3 className="text-lg font-bold">Informasi Transfer</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Bank</span>
                <span className="font-bold">{bankInfo.bank_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Nomor Rekening</span>
                <span className="font-bold font-mono text-lg tracking-widest">{bankInfo.bank_account}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Atas Nama</span>
                <span className="font-bold">{bankInfo.bank_holder}</span>
              </div>
              {order && (
                <div className="flex justify-between border-t border-white/20 pt-3 mt-3">
                  <span className="text-gray-400">Jumlah Transfer</span>
                  <span className="font-bold text-primary text-lg">Rp {Number(order.totalPrice).toLocaleString('id-ID')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Summary */}
        {order && (
          <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">
            <h3 className="font-bold text-charcoal mb-4">Ringkasan Pesanan #{order.id}</h3>
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{item.product.name} × {item.quantity}</span>
                <span>Rp {(Number(item.price) * item.quantity).toLocaleString('id-ID')}</span>
              </div>
            ))}
            <div className="border-t pt-3 mt-3 flex justify-between font-bold text-charcoal">
              <span>Total</span>
              <span className="text-primary">Rp {Number(order.totalPrice).toLocaleString('id-ID')}</span>
            </div>
          </div>
        )}

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm">
          <h3 className="font-bold text-charcoal mb-6 text-lg">Unggah Bukti Transfer</h3>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-charcoal mb-3">Foto Bukti Pembayaran</label>
            <label className={`flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed rounded-2xl cursor-pointer transition overflow-hidden ${imagePreview ? 'border-primary' : 'border-gray-300 hover:border-primary bg-gray-50'}`}>
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
              ) : (
                <div className="text-center p-8">
                  <Upload size={40} className="mx-auto mb-3 text-gray-400" />
                  <p className="font-semibold text-charcoal">Klik untuk memilih foto</p>
                  <p className="text-sm text-gray-400 mt-1">JPG, PNG, WEBP (maks. 5MB)</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-charcoal mb-2">Atau masukkan URL gambar</label>
            <input
              type="url"
              placeholder="https://..."
              value={imageUrl.startsWith('data:') ? '' : imageUrl}
              onChange={(e) => { setImageUrl(e.target.value); setImagePreview(e.target.value); }}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !imageUrl}
            className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition shadow-lg shadow-primary/30 disabled:opacity-50"
          >
            {loading ? 'Mengunggah...' : 'Kirim Bukti Pembayaran'}
          </button>
        </form>
      </div>
      <Footer />
    </main>
  );
}
