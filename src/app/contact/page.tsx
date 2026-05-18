'use client';

import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, ArrowRight } from 'lucide-react';

export default function ContactPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-charcoal text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">Hubungi Kami</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">Tim kami siap membantu Anda. Jangan ragu untuk menghubungi kami kapanpun Anda butuh bantuan.</p>
        </div>
      </section>

      <section className="py-20 bg-gray-50 flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-charcoal mb-6">Informasi Kontak</h2>
                <p className="text-gray-600 leading-relaxed">Kami membuka layanan konsultasi dan pemesanan setiap hari kerja. Hubungi kami melalui salah satu saluran berikut.</p>
              </div>

              {[
                { icon: Phone, title: 'Telepon', value: '+62 21 1234 5678', sub: 'Senin–Sabtu, 08.00–17.00 WIB' },
                { icon: Mail, title: 'Email', value: 'info@masamas.co.id', sub: 'Balas dalam 1x24 jam' },
                { icon: MapPin, title: 'Alamat', value: 'Jl. Industri Raya No. 45', sub: 'Jakarta Timur, 13920' },
                { icon: Clock, title: 'Jam Operasional', value: 'Senin–Jumat: 08.00–17.00', sub: 'Sabtu: 08.00–13.00 WIB' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <item.icon size={22} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-charcoal">{item.title}</p>
                    <p className="text-gray-800 mt-0.5">{item.value}</p>
                    <p className="text-gray-500 text-sm">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Form */}
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h3 className="text-2xl font-bold text-charcoal mb-6">Kirim Pesan</h3>
              <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert('Pesan terkirim! Kami akan segera menghubungi Anda.'); }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">Nama Lengkap</label>
                    <input required type="text" placeholder="Nama Anda" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">Telepon</label>
                    <input type="tel" placeholder="+62 8xx xxxx xxxx" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">Email</label>
                  <input required type="email" placeholder="email@anda.com" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">Subjek</label>
                  <input required type="text" placeholder="Topik pesan Anda" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">Pesan</label>
                  <textarea required rows={5} placeholder="Tulis pesan Anda di sini..." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"></textarea>
                </div>
                <button type="submit" className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition shadow-lg shadow-primary/30 flex items-center justify-center gap-2">
                  Kirim Pesan <ArrowRight size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
