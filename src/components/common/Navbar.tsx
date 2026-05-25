'use client';

import Link from 'next/link';
import { ShoppingCart, Menu, X, Package, LogOut, ShieldCheck, User, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { items, fetchCart } = useCartStore();
  const { isLoggedIn, isAdmin, name, init, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (isLoggedIn) fetchCart();
  }, [isLoggedIn, fetchCart]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

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
            <Link href="/products" className="text-charcoal hover:text-primary font-medium transition-colors">Products</Link>
            <Link href="/categories" className="text-charcoal hover:text-primary font-medium transition-colors">Categories</Link>
            <Link href="/about" className="text-charcoal hover:text-primary font-medium transition-colors">About</Link>
            <Link href="/contact" className="text-charcoal hover:text-primary font-medium transition-colors">Contact</Link>
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
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login" className="px-4 py-2 text-charcoal font-medium hover:text-primary transition-colors">
                  Sign In
                </Link>
                <Link href="/register" className="flex items-center space-x-1 px-4 py-2 bg-primary text-white rounded-xl hover:bg-orange-600 transition font-bold shadow-lg shadow-primary/30">
                  <span>Get Started</span>
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
            <Link href="/products" onClick={() => setIsOpen(false)} className="block px-3 py-4 font-medium text-charcoal hover:bg-gray-50 border-b border-gray-50 rounded-lg">Products</Link>
            <Link href="/categories" onClick={() => setIsOpen(false)} className="block px-3 py-4 font-medium text-charcoal hover:bg-gray-50 border-b border-gray-50 rounded-lg">Categories</Link>
            <Link href="/about" onClick={() => setIsOpen(false)} className="block px-3 py-4 font-medium text-charcoal hover:bg-gray-50 border-b border-gray-50 rounded-lg">About</Link>
            <Link href="/contact" onClick={() => setIsOpen(false)} className="block px-3 py-4 font-medium text-charcoal hover:bg-gray-50 rounded-lg">Contact</Link>

            <div className="pt-4 border-t border-gray-100 space-y-2">
              {isLoggedIn ? (
                <>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setIsOpen(false)} className="flex items-center space-x-2 px-3 py-3 bg-charcoal text-white rounded-xl font-medium">
                      <ShieldCheck size={18} /><span>Admin Panel</span>
                    </Link>
                  )}
                  <button onClick={handleLogout} className="w-full flex items-center space-x-2 px-3 py-3 bg-red-50 text-red-600 rounded-xl font-medium">
                    <LogOut size={18} /><span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="flex gap-3">
                  <Link href="/login" onClick={() => setIsOpen(false)} className="flex-1 text-center px-4 py-3 bg-gray-100 text-charcoal rounded-xl font-medium">Sign In</Link>
                  <Link href="/register" onClick={() => setIsOpen(false)} className="flex-1 text-center px-4 py-3 bg-primary text-white rounded-xl font-bold">Register</Link>
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
