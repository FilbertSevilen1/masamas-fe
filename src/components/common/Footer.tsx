'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

const Facebook = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const Instagram = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const Twitter = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

interface CmsMap {
  footer_desc?: string;
  footer_phone?: string;
  footer_email?: string;
  footer_address?: string;
}

const Footer = () => {
  const [cms, setCms] = useState<CmsMap>({});

  useEffect(() => {
    api.get('/cms/map').then(r => setCms(r.data)).catch(() => {});
  }, []);

  return (
    <footer className="bg-charcoal text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="space-y-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg shadow-lg shadow-primary/30">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-2xl font-bold tracking-tighter">
              MASA<span className="text-primary">MAS</span>
            </span>
          </Link>
          <p className="text-gray-400 leading-relaxed text-sm">
            {cms.footer_desc || 'Penyedia material bangunan berkualitas tinggi untuk konstruksi industri dan residensial. Dibangun di atas kepercayaan dan kualitas.'}
          </p>
          <div className="flex space-x-3">
            <a href="#" className="w-10 h-10 bg-white/10 flex items-center justify-center rounded-full hover:bg-primary transition-colors">
              <Facebook size={16} />
            </a>
            <a href="#" className="w-10 h-10 bg-white/10 flex items-center justify-center rounded-full hover:bg-primary transition-colors">
              <Instagram size={16} />
            </a>
            <a href="#" className="w-10 h-10 bg-white/10 flex items-center justify-center rounded-full hover:bg-primary transition-colors">
              <Twitter size={16} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-bold mb-6 border-l-4 border-primary pl-3">Tautan Cepat</h3>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li><Link href="/products" className="hover:text-primary transition-colors">Produk</Link></li>
            <li><Link href="/categories" className="hover:text-primary transition-colors">Kategori</Link></li>
            <li><Link href="/about" className="hover:text-primary transition-colors">Tentang Kami</Link></li>
            <li><Link href="/contact" className="hover:text-primary transition-colors">Hubungi Kami</Link></li>
            <li><Link href="/cart" className="hover:text-primary transition-colors">Keranjang</Link></li>
            <li><Link href="/orders" className="hover:text-primary transition-colors">Pesanan Saya</Link></li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-lg font-bold mb-6 border-l-4 border-primary pl-3">Kategori Populer</h3>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li><Link href="/products?category=semen-beton" className="hover:text-primary transition-colors">Semen &amp; Beton</Link></li>
            <li><Link href="/products?category=baja-tulangan" className="hover:text-primary transition-colors">Baja Tulangan</Link></li>
            <li><Link href="/products?category=bata-batu" className="hover:text-primary transition-colors">Bata &amp; Batu</Link></li>
            <li><Link href="/products?category=atap" className="hover:text-primary transition-colors">Material Atap</Link></li>
            <li><Link href="/categories" className="hover:text-primary transition-colors font-semibold text-primary">Lihat Semua →</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-bold mb-6 border-l-4 border-primary pl-3">Hubungi Kami</h3>
          <ul className="space-y-4 text-gray-400 text-sm">
            <li className="flex items-start space-x-3">
              <MapPin className="text-primary shrink-0 mt-0.5" size={18} />
              <span>{cms.footer_address || 'Jl. Industri Raya No. 45, Jakarta Timur, 13920'}</span>
            </li>
            <li className="flex items-center space-x-3">
              <Phone className="text-primary shrink-0" size={18} />
              <span>{cms.footer_phone || '+62 21 1234 5678'}</span>
            </li>
            <li className="flex items-center space-x-3">
              <Mail className="text-primary shrink-0" size={18} />
              <span>{cms.footer_email || 'info@masamas.co.id'}</span>
            </li>
          </ul>
          <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Jam Operasional</p>
            <p className="text-sm text-white">Senin–Jumat: 08.00–17.00</p>
            <p className="text-sm text-gray-400">Sabtu: 08.00–13.00 WIB</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Masamas Store. Seluruh hak cipta dilindungi.</p>
        <div className="flex gap-6">
          <Link href="/about" className="hover:text-primary transition-colors">Tentang</Link>
          <Link href="/contact" className="hover:text-primary transition-colors">Kontak</Link>
          <Link href="/products" className="hover:text-primary transition-colors">Produk</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
