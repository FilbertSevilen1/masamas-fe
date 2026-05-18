'use client';

import { useEffect } from 'react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import { useCartStore } from '@/store/useCartStore';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { items, fetchCart, updateQuantity, removeItem, loading } = useCartStore();

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const total = items.reduce((acc, item) => acc + (Number(item.product.price) * item.quantity), 0);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <h1 className="text-4xl font-bold text-charcoal mb-2">Keranjang Belanja</h1>
        <p className="text-gray-500 mb-8">{items.length > 0 ? `${items.length} jenis produk dalam keranjang` : 'Keranjang masih kosong'}</p>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="bg-white h-24 rounded-2xl animate-pulse" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl shadow-sm">
            <ShoppingBag size={64} className="mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-400 mb-2">Keranjang Kosong</h2>
            <p className="text-gray-500 mb-8">Tambahkan produk dari katalog kami</p>
            <Link href="/products" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-dark transition shadow-lg shadow-primary/30">
              Mulai Belanja <ArrowRight size={20} />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Items List */}
            <div className="lg:w-2/3 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm flex items-center justify-between gap-4">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      {item.product.thumbnail ? (
                        <img src={item.product.thumbnail} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">📦</div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-charcoal leading-tight">{item.product.name}</h3>
                      <p className="text-primary font-bold mt-1">Rp {Number(item.product.price).toLocaleString('id-ID')}</p>
                      <p className="text-sm text-gray-400">per unit</p>
                      {item.product.stock <= 5 && (
                        <p className="text-[10px] text-red-500 font-bold mt-1 bg-red-50 px-2 py-0.5 rounded border border-red-200 inline-block">
                          ⚠️ Sisa stok tipis: {item.product.stock} unit
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="px-3 py-2 hover:bg-gray-100 transition text-charcoal">
                        <Minus size={16} />
                      </button>
                      <span className="px-4 font-bold text-charcoal">{item.quantity}</span>
                      <button 
                        onClick={() => {
                          if (item.quantity < item.product.stock) {
                            updateQuantity(item.id, item.quantity + 1);
                          }
                        }} 
                        disabled={item.quantity >= item.product.stock}
                        className="px-3 py-2 hover:bg-gray-100 transition text-charcoal disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <p className="font-bold text-charcoal w-28 text-right hidden sm:block">
                      Rp {(Number(item.product.price) * item.quantity).toLocaleString('id-ID')}
                    </p>
                    <button onClick={() => removeItem(item.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white p-8 rounded-2xl shadow-sm sticky top-24">
                <h3 className="text-2xl font-bold text-charcoal mb-6">Ringkasan Pesanan</h3>
                <div className="space-y-3 text-gray-600 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal ({items.reduce((a, i) => a + i.quantity, 0)} item)</span>
                    <span className="font-bold text-charcoal">Rp {total.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ongkos Kirim</span>
                    <span className="font-bold text-charcoal">Dihitung saat checkout</span>
                  </div>
                </div>
                <div className="border-t pt-4 mb-8">
                  <div className="flex justify-between items-center text-xl font-bold text-charcoal">
                    <span>Total</span>
                    <span className="text-primary text-2xl">Rp {total.toLocaleString('id-ID')}</span>
                  </div>
                </div>
                <Link href="/checkout" className="w-full block text-center bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary-dark transition shadow-lg shadow-primary/30 text-lg">
                  Lanjut ke Checkout
                </Link>
                <Link href="/products" className="w-full block text-center text-gray-500 py-3 mt-3 hover:text-charcoal transition text-sm font-medium">
                  ← Lanjut Belanja
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
