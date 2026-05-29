'use client';

import Link from 'next/link';
import { Menu, X, Package, LogOut, ShieldCheck, User, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { items, fetchCart } = useCartStore();
  const { isLoggedIn, isAdmin, name, init, logout } = useAuthStore();
  const router = useRouter();

  // Dropdown lists
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [prodDropdownOpen, setProdDropdownOpen] = useState(false);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);

  // Mobile navigation collapsible states
  const [mobileProdOpen, setMobileProdOpen] = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);

  const prodDropdownRef = useRef<HTMLDivElement>(null);
  const catDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (isLoggedIn) fetchCart();
  }, [isLoggedIn, fetchCart]);

  useEffect(() => {
    // Fetch categories for dropdown
    api.get('/categories')
      .then(res => setCategories(res.data.slice(0, 5)))
      .catch(err => console.error(err));

    // Fetch latest 5 products for dropdown
    api.get('/products?limit=5')
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : (res.data.products || []);
        setProducts(list.slice(0, 5));
      })
      .catch(err => console.error(err));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setDropdownOpen(false);
      }
      if (prodDropdownRef.current && !prodDropdownRef.current.contains(target)) {
        setProdDropdownOpen(false);
      }
      if (catDropdownRef.current && !catDropdownRef.current.contains(target)) {
        setCatDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    router.push('/');
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg shadow-lg shadow-primary/30">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="text-2xl font-bold tracking-tighter text-charcoal">
                MASA<span className="text-primary">MAS</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Products Dropdown */}
            <div className="relative" ref={prodDropdownRef}>
              <button
                onClick={() => {
                  setProdDropdownOpen(!prodDropdownOpen);
                  setCatDropdownOpen(false);
                }}
                onMouseEnter={() => {
                  setProdDropdownOpen(true);
                  setCatDropdownOpen(false);
                }}
                className="flex items-center gap-1 text-charcoal hover:text-primary font-medium transition-colors py-6"
              >
                <span>Produk</span>
                <ChevronDown size={14} className={`transition-transform ${prodDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {prodDropdownOpen && (
                <div 
                  onMouseLeave={() => setProdDropdownOpen(false)}
                  className="absolute left-0 mt-[-10px] w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in slide-in-from-top-2 duration-150"
                >
                  <div className="px-4 py-1 text-xs font-semibold text-gray-400 border-b border-gray-50 pb-2 mb-1">
                    Produk Unggulan
                  </div>
                  {products.length > 0 ? (
                    products.map((p) => (
                      <Link
                        key={p.id}
                        href={`/products/${p.slug}`}
                        onClick={() => setProdDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-orange-50 text-sm text-charcoal hover:text-primary transition-colors"
                      >
                        {p.thumbnail ? (
                          <img src={p.thumbnail} alt="" className="w-8 h-8 rounded object-cover" />
                        ) : (
                          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-xs">📦</div>
                        )}
                        <span className="truncate flex-grow font-medium">{p.name}</span>
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-400 italic">Produk tidak ditemukan</div>
                  )}
                  <div className="border-t border-gray-50 mt-1 pt-1">
                    <Link
                      href="/products"
                      onClick={() => setProdDropdownOpen(false)}
                      className="block text-center text-xs font-bold text-primary hover:text-orange-600 py-2 transition"
                    >
                      Lihat Semua Produk
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Categories Dropdown */}
            <div className="relative" ref={catDropdownRef}>
              <button
                onClick={() => {
                  setCatDropdownOpen(!catDropdownOpen);
                  setProdDropdownOpen(false);
                }}
                onMouseEnter={() => {
                  setCatDropdownOpen(true);
                  setProdDropdownOpen(false);
                }}
                className="flex items-center gap-1 text-charcoal hover:text-primary font-medium transition-colors py-6"
              >
                <span>Kategori</span>
                <ChevronDown size={14} className={`transition-transform ${catDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {catDropdownOpen && (
                <div 
                  onMouseLeave={() => setCatDropdownOpen(false)}
                  className="absolute left-0 mt-[-10px] w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in slide-in-from-top-2 duration-150"
                >
                  <div className="px-4 py-1 text-xs font-semibold text-gray-400 border-b border-gray-50 pb-2 mb-1">
                    Kategori Produk
                  </div>
                  {categories.length > 0 ? (
                    categories.map((c) => (
                      <Link
                        key={c.id}
                        href={`/products?category=${c.slug}`}
                        onClick={() => setCatDropdownOpen(false)}
                        className="block px-4 py-2 hover:bg-orange-50 text-sm text-charcoal hover:text-primary transition-colors font-medium"
                      >
                        {c.name}
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-400 italic">Kategori tidak ditemukan</div>
                  )}
                  <div className="border-t border-gray-50 mt-1 pt-1">
                    <Link
                      href="/categories"
                      onClick={() => setCatDropdownOpen(false)}
                      className="block text-center text-xs font-bold text-primary hover:text-orange-600 py-2 transition"
                    >
                      Lihat Semua Kategori
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link href="/gallery" className="text-charcoal hover:text-primary font-medium transition-colors">Galeri</Link>
            <Link href="/about" className="text-charcoal hover:text-primary font-medium transition-colors">Tentang Kami</Link>
            <Link href="/contact" className="text-charcoal hover:text-primary font-medium transition-colors">Kontak</Link>
          </div>

          {/* Icons */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition font-medium text-charcoal"
                >
                  <User size={18} />
                  <span className="max-w-[120px] truncate">{name}</span>
                  <ChevronDown size={16} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in slide-in-from-top-2 duration-200 z-50">
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center space-x-2 px-4 py-3 text-sm font-medium text-charcoal hover:bg-primary hover:text-white transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <ShieldCheck size={16} />
                        <span>Panel Admin</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                    >
                      <LogOut size={16} />
                      <span>Keluar</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login" className="px-4 py-2 text-charcoal font-medium hover:text-primary transition-colors">
                  Masuk
                </Link>
                <Link href="/register" className="flex items-center space-x-1 px-4 py-2 bg-primary text-white rounded-xl hover:bg-orange-600 transition font-bold shadow-lg shadow-primary/30">
                  <span>Daftar</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <button onClick={() => setIsOpen(!isOpen)} className="text-charcoal">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {/* Products Mobile Accordion */}
            <div>
              <button 
                onClick={() => setMobileProdOpen(!mobileProdOpen)}
                className="w-full flex justify-between items-center px-3 py-4 font-medium text-charcoal hover:bg-gray-50 border-b border-gray-50 rounded-lg text-left"
              >
                <span>Produk</span>
                <ChevronDown size={18} className={`transition-transform ${mobileProdOpen ? 'rotate-180' : ''}`} />
              </button>
              {mobileProdOpen && (
                <div className="pl-6 bg-gray-50/55 py-1 space-y-1">
                  {products.map(p => (
                    <Link
                      key={p.id}
                      href={`/products/${p.slug}`}
                      onClick={() => { setIsOpen(false); setMobileProdOpen(false); }}
                      className="block py-2.5 px-3 text-sm text-gray-600 hover:text-primary font-medium"
                    >
                      {p.name}
                    </Link>
                  ))}
                  <Link
                    href="/products"
                    onClick={() => { setIsOpen(false); setMobileProdOpen(false); }}
                    className="block py-2.5 px-3 text-sm text-primary font-bold"
                  >
                    Lihat Semua Produk
                  </Link>
                </div>
              )}
            </div>

            {/* Categories Mobile Accordion */}
            <div>
              <button 
                onClick={() => setMobileCatOpen(!mobileCatOpen)}
                className="w-full flex justify-between items-center px-3 py-4 font-medium text-charcoal hover:bg-gray-50 border-b border-gray-50 rounded-lg text-left"
              >
                <span>Kategori</span>
                <ChevronDown size={18} className={`transition-transform ${mobileCatOpen ? 'rotate-180' : ''}`} />
              </button>
              {mobileCatOpen && (
                <div className="pl-6 bg-gray-50/55 py-1 space-y-1">
                  {categories.map(c => (
                    <Link
                      key={c.id}
                      href={`/products?category=${c.slug}`}
                      onClick={() => { setIsOpen(false); setMobileCatOpen(false); }}
                      className="block py-2.5 px-3 text-sm text-gray-600 hover:text-primary font-medium"
                    >
                      {c.name}
                    </Link>
                  ))}
                  <Link
                    href="/categories"
                    onClick={() => { setIsOpen(false); setMobileCatOpen(false); }}
                    className="block py-2.5 px-3 text-sm text-primary font-bold"
                  >
                    Lihat Semua Kategori
                  </Link>
                </div>
              )}
            </div>

            <Link href="/gallery" onClick={() => setIsOpen(false)} className="block px-3 py-4 font-medium text-charcoal hover:bg-gray-50 border-b border-gray-50 rounded-lg">Galeri</Link>
            <Link href="/about" onClick={() => setIsOpen(false)} className="block px-3 py-4 font-medium text-charcoal hover:bg-gray-50 border-b border-gray-50 rounded-lg">Tentang Kami</Link>
            <Link href="/contact" onClick={() => setIsOpen(false)} className="block px-3 py-4 font-medium text-charcoal rounded-lg">Kontak</Link>

            <div className="pt-4 border-t border-gray-100 space-y-2">
              {isLoggedIn ? (
                <>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setIsOpen(false)} className="flex items-center space-x-2 px-3 py-3 bg-charcoal text-white rounded-xl font-medium">
                      <ShieldCheck size={18} /><span>Panel Admin</span>
                    </Link>
                  )}
                  <button onClick={handleLogout} className="w-full flex items-center space-x-2 px-3 py-3 bg-red-50 text-red-600 rounded-xl font-medium">
                    <LogOut size={18} /><span>Keluar</span>
                  </button>
                </>
              ) : (
                <div className="flex gap-3">
                  <Link href="/login" onClick={() => setIsOpen(false)} className="flex-1 text-center px-4 py-3 bg-gray-100 text-charcoal rounded-xl font-medium">Masuk</Link>
                  <Link href="/register" onClick={() => setIsOpen(false)} className="flex-1 text-center px-4 py-3 bg-primary text-white rounded-xl font-bold">Daftar</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
