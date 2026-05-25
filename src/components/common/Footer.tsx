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
  footer_whatsapp?: string;
  footer_email?: string;
  footer_address?: string;
}

const WhatsAppIcon = ({ size = 18, className = '' }: { size?: number; className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

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
              <a href={`tel:${(cms.footer_phone || '+622112345678').replace(/\s+/g, '')}`} className="hover:text-primary transition-colors">
                {cms.footer_phone || '+62 21 1234 5678'}
              </a>
            </li>
            <li className="flex items-center space-x-3">
              <WhatsAppIcon className="text-primary shrink-0" size={18} />
              <a 
                href={`https://wa.me/${(cms.footer_whatsapp || '+62 812 3456 7890').replace(/[^0-9]/g, '').startsWith('0') ? `62${(cms.footer_whatsapp || '+62 812 3456 7890').replace(/[^0-9]/g, '').slice(1)}` : (cms.footer_whatsapp || '+62 812 3456 7890').replace(/[^0-9]/g, '')}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-primary transition-colors font-medium text-white"
              >
                {cms.footer_whatsapp || '+62 812 3456 7890'} (WA)
              </a>
            </li>
            <li className="flex items-center space-x-3">
              <Mail className="text-primary shrink-0" size={18} />
              <a href={`mailto:${cms.footer_email || 'info@masamas.co.id'}`} className="hover:text-primary transition-colors">
                {cms.footer_email || 'info@masamas.co.id'}
              </a>
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
