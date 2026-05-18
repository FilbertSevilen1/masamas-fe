'use client';

import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import Link from 'next/link';
import { Award, Users, Truck, Wrench, CheckCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-charcoal text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1600" alt="bg" className="w-full h-full object-cover" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <p className="text-primary font-bold uppercase tracking-widest text-sm mb-4">Tentang Kami</p>
          <h1 className="text-5xl font-bold mb-6">Membangun Indonesia<br />Dengan Material Terbaik</h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">Masamas telah melayani proyek konstruksi skala kecil hingga besar selama lebih dari 15 tahun. Kami berkomitmen menyediakan material bangunan berkualitas dengan harga kompetitif.</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-white text-center">
            {[
              { value: '15+', label: 'Tahun Pengalaman' },
              { value: '2.500+', label: 'Proyek Selesai' },
              { value: '500+', label: 'Produk Tersedia' },
              { value: '98%', label: 'Kepuasan Pelanggan' },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-5xl font-bold mb-2">{stat.value}</p>
                <p className="text-white/80 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-charcoal mb-4">Mengapa Memilih Masamas?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Kami tidak hanya menjual material — kami memberikan solusi konstruksi lengkap untuk setiap kebutuhan Anda.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Award, title: 'Kualitas Bersertifikat SNI', desc: 'Semua produk kami telah melalui uji kualitas ketat dan bersertifikat Standar Nasional Indonesia.' },
              { icon: Truck, title: 'Pengiriman ke Lokasi', desc: 'Armada pengiriman kami siap mengantarkan material langsung ke lokasi proyek Anda di seluruh Jakarta.' },
              { icon: Users, title: 'Tim Konsultan Ahli', desc: 'Tim teknis berpengalaman siap membantu Anda memilih material yang tepat sesuai kebutuhan proyek.' },
              { icon: Wrench, title: 'Dukungan Purna Jual', desc: 'Garansi produk dan layanan purna jual untuk memastikan kepuasan Anda setelah pembelian.' },
            ].map((item, i) => (
              <div key={i} className="p-8 bg-gray-50 rounded-2xl hover:shadow-lg transition group">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary transition">
                  <item.icon size={28} className="text-primary group-hover:text-white transition" />
                </div>
                <h3 className="text-xl font-bold text-charcoal mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team / Story */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-primary font-bold uppercase tracking-widest text-sm mb-4">Kisah Kami</p>
              <h2 className="text-4xl font-bold text-charcoal mb-6">Dari Toko Kecil ke Distributor Terpercaya</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>Masamas didirikan pada tahun 2008 oleh Bapak Ahmad Fauzi dengan modal kecil dan tekad besar. Bermula dari toko material kecil di Cipinang, Jakarta Timur.</p>
                <p>Dengan fokus pada kualitas produk dan kejujuran dalam berbisnis, Masamas tumbuh menjadi salah satu distributor material bangunan terpercaya di DKI Jakarta.</p>
                <p>Kini, Masamas melayani ratusan kontraktor, arsitek, dan developer setiap bulannya, dan terus berkembang untuk memberikan layanan terbaik.</p>
              </div>
              <div className="mt-8 space-y-3">
                {['Produk asli dan bergaransi', 'Harga transparan tanpa biaya tersembunyi', 'Tim profesional berpengalaman', 'Pengiriman tepat waktu'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-primary shrink-0" />
                    <span className="text-charcoal font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600" alt="Gudang" className="rounded-2xl shadow-lg w-full object-cover aspect-square mt-8" />
              <img src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=600" alt="Tim" className="rounded-2xl shadow-lg w-full object-cover aspect-square" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-charcoal text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-4">Siap Berkolaborasi?</h2>
          <p className="text-gray-400 mb-10 text-lg">Hubungi tim kami sekarang dan dapatkan konsultasi gratis untuk proyek Anda.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products" className="px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition shadow-lg shadow-primary/30">
              Lihat Produk
            </Link>
            <Link href="/contact" className="px-8 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition border border-white/20">
              Hubungi Kami
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
