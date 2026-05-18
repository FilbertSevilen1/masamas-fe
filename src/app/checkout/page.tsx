'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import { useCartStore } from '@/store/useCartStore';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { MapPin, CreditCard, ChevronRight } from 'lucide-react';

export default function CheckoutPage() {
  const { items, fetchCart, clearCart } = useCartStore();
  const [shippingAddr, setShippingAddr] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const total = items.reduce((acc, item) => acc + (Number(item.product.price) * item.quantity), 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return alert('Keranjang masih kosong');
    setLoading(true);
    try {
      const res = await api.post('/orders/checkout', { shippingAddr });
      clearCart();
      router.push(`/payment-upload/${res.data.id}`);
    } catch (error) {
      alert('Checkout gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-grow max-w-5xl mx-auto px-4 py-12 w-full">
        <h1 className="text-4xl font-bold text-charcoal mb-2">Checkout</h1>
        <p className="text-gray-500 mb-10">Lengkapi informasi pengiriman untuk melanjutkan</p>

        <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <MapPin size={20} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-charcoal">Alamat Pengiriman</h3>
              </div>
              <textarea
                required
                rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none text-sm"
                placeholder="Masukkan alamat lengkap pengiriman Anda...&#10;Contoh: Jl. Merdeka No. 10, RT 01/RW 02, Kelurahan Menteng, Kecamatan Menteng, Jakarta Pusat, 10310"
                value={shippingAddr}
                onChange={(e) => setShippingAddr(e.target.value)}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl text-sm text-blue-700">
              <p className="font-bold mb-1">💳 Metode Pembayaran: Transfer Bank Manual</p>
              <p>Setelah pesanan dibuat, Anda akan diarahkan untuk mengunggah bukti transfer. Tim kami akan memverifikasi dalam 1×24 jam.</p>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white p-6 rounded-2xl shadow-sm sticky top-24">
              <h3 className="text-lg font-bold text-charcoal mb-5">Ringkasan Pesanan</h3>
              <div className="space-y-3 mb-5 max-h-60 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {item.product.thumbnail && <img src={item.product.thumbnail} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-semibold text-charcoal line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-gray-500">× {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-charcoal shrink-0">
                      Rp {(Number(item.product.price) * item.quantity).toLocaleString('id-ID')}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-xl font-bold text-charcoal">
                  <span>Total</span>
                  <span className="text-primary">Rp {total.toLocaleString('id-ID')}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary-dark transition shadow-lg shadow-primary/30 disabled:opacity-50 text-lg"
              >
                {loading ? 'Memproses...' : <><CreditCard size={20} /> Buat Pesanan</>}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">Anda akan diarahkan untuk upload bukti bayar</p>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </main>
  );
}
