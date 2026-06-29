'use client';

import Link from 'next/link';
import { Menu, X, Package, LogOut, ShieldCheck, User, ChevronDown, ShoppingBag } from 'lucide-react';
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
    <>
      <nav className="bg-white border-b border-gray-100 fixed top-0 left-0 w-full z-50 shadow-sm">
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
                  className="flex items-center space-x-1 text-charcoal hover:text-primary font-medium transition-colors cursor-pointer"
                >
                  <span>Produk</span>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${prodDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {prodDropdownOpen && (
                  <div
                    className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-2 animate-in slide-in-from-top-2 duration-200 z-50"
                    onMouseLeave={() => setProdDropdownOpen(false)}
                  >
                    {products.slice(0, 5).map(p => (
                      <Link
                        key={p.id}
                        href={`/products/${p.slug}`}
                        onClick={() => setProdDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-charcoal hover:bg-gray-50 hover:text-primary transition"
                      >
                        {p.name}
                      </Link>
                    ))}
                    <div className="border-t border-gray-50 mt-1 pt-1">
                      <Link
                        href="/products"
                        onClick={() => setProdDropdownOpen(false)}
                        className="block text-center text-xs font-bold text-primary hover:text-emerald-600 py-2 transition"
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
                  className="flex items-center space-x-1 text-charcoal hover:text-primary font-medium transition-colors cursor-pointer"
                >
                  <span>Kategori</span>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${catDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {catDropdownOpen && (
                  <div
                    className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-2 animate-in slide-in-from-top-2 duration-200 z-50"
                    onMouseLeave={() => setCatDropdownOpen(false)}
                  >
                    {categories.slice(0, 5).map(c => (
                      <Link
                        key={c.id}
                        href={`/products?category=${c.slug}`}
                        onClick={() => setCatDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-charcoal hover:bg-gray-50 hover:text-primary transition"
                      >
                        {c.name}
                      </Link>
                    ))}
                    <div className="border-t border-gray-50 mt-1 pt-1">
                      <Link
                        href="/categories"
                        onClick={() => setCatDropdownOpen(false)}
                        className="block text-center text-xs font-bold text-primary hover:text-emerald-600 py-2 transition"
                      >
                        Lihat Semua Kategori
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link href="/gallery" className="text-charcoal hover:text-primary font-medium transition-colors">Galeri Proyek</Link>
              <Link href="/about" className="text-charcoal hover:text-primary font-medium transition-colors">Tentang Kami</Link>
              <Link href="/contact" className="text-charcoal hover:text-primary font-medium transition-colors">Kontak</Link>
            </div>

            {/* Icons */}
            <div className="hidden md:flex items-center space-x-4">
              {!isAdmin && (
                <Link
                  href="/cart"
                  className="relative p-2.5 text-charcoal hover:text-primary hover:bg-gray-100 rounded-xl transition duration-200"
                >
                  <ShoppingBag size={22} />
                  {items.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      {items.reduce((acc, item) => acc + item.quantity, 0)}
                    </span>
                  )}
                </Link>
              )}

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
                      {isAdmin ? (
                        <Link href="/admin" onClick={() => setDropdownOpen(false)} className="block px-4 py-3 text-sm text-charcoal hover:bg-gray-50 font-semibold transition">Dashboard Admin</Link>
                      ) : (
                        <Link href="/orders" onClick={() => setDropdownOpen(false)} className="block px-4 py-3 text-sm text-charcoal hover:bg-gray-50 font-semibold transition">Pesanan Saya</Link>
                      )}
                      <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-bold border-t border-gray-100 transition">Keluar</button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href="/login" className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-charcoal font-semibold rounded-xl text-sm transition">Masuk</Link>
                  <Link href="/register" className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-sm transition shadow-md shadow-primary/10">Daftar</Link>
                </div>
              )}
            </div>
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-4">
              {!isAdmin && (
                <Link
                  href="/cart"
                  className="relative p-2 text-charcoal hover:text-primary transition"
                >
                  <ShoppingBag size={24} />
                  {items.length > 0 && (
                    <span className="absolute top-0 right-0 bg-primary text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      {items.reduce((acc, item) => acc + item.quantity, 0)}
                    </span>
                  )}
                </Link>
              )}
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
                  className="w-full flex justify-between items-center py-3 text-charcoal hover:text-primary font-semibold"
                >
                  <span>Produk</span>
                  <ChevronDown size={18} className={`transition-transform duration-200 ${mobileProdOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileProdOpen && (
                  <div className="pl-4 pb-2 space-y-2 border-l border-gray-100 ml-1">
                    {products.slice(0, 5).map(p => (
                      <Link key={p.id} href={`/products/${p.slug}`} onClick={() => setIsOpen(false)} className="block py-1 text-sm text-gray-500 hover:text-primary">{p.name}</Link>
                    ))}
                    <Link href="/products" onClick={() => setIsOpen(false)} className="block py-1 text-xs font-bold text-primary">Semua Produk</Link>
                  </div>
                )}
              </div>

              {/* Categories Mobile Accordion */}
              <div>
                <button
                  onClick={() => setMobileCatOpen(!mobileCatOpen)}
                  className="w-full flex justify-between items-center py-3 text-charcoal hover:text-primary font-semibold"
                >
                  <span>Kategori</span>
                  <ChevronDown size={18} className={`transition-transform duration-200 ${mobileCatOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileCatOpen && (
                  <div className="pl-4 pb-2 space-y-2 border-l border-gray-100 ml-1">
                    {categories.slice(0, 5).map(c => (
                      <Link key={c.id} href={`/products?category=${c.slug}`} onClick={() => setIsOpen(false)} className="block py-1 text-sm text-gray-500 hover:text-primary">{c.name}</Link>
                    ))}
                    <Link href="/categories" onClick={() => setIsOpen(false)} className="block py-1 text-xs font-bold text-primary">Semua Kategori</Link>
                  </div>
                )}
              </div>

              <Link href="/gallery" onClick={() => setIsOpen(false)} className="block py-3 text-charcoal hover:text-primary font-semibold border-b border-gray-50">Galeri Proyek</Link>
              <Link href="/about" onClick={() => setIsOpen(false)} className="block py-3 text-charcoal hover:text-primary font-semibold border-b border-gray-50">Tentang Kami</Link>
              <Link href="/contact" onClick={() => setIsOpen(false)} className="block py-3 text-charcoal hover:text-primary font-semibold border-b border-gray-50">Kontak</Link>

              <div className="pt-4">
                {isLoggedIn ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 bg-gray-50 rounded-xl text-sm font-semibold text-charcoal">
                      Halo, {name}
                    </div>
                    {isAdmin ? (
                      <Link href="/admin" onClick={() => setIsOpen(false)} className="block text-center px-4 py-3 bg-primary text-white rounded-xl font-bold">Dashboard Admin</Link>
                    ) : (
                      <Link href="/orders" onClick={() => setIsOpen(false)} className="block text-center px-4 py-3 bg-primary text-white rounded-xl font-bold">Pesanan Saya</Link>
                    )}
                    <button onClick={handleLogout} className="w-full text-center px-4 py-3 text-red-600 hover:bg-red-50 border border-red-100 rounded-xl font-bold transition">Keluar</button>
                  </div>
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
      {/* Spacer to push content down below fixed Navbar */}
      <div className="h-20" />
    </>
  );
};

export default Navbar;
