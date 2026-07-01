'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api, { saveAuth } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { User, Lock, Mail, Eye, EyeOff, Phone, Check, X } from 'lucide-react';
import Navbar from '@/components/common/Navbar';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const isMinLength = password.length >= 8;
  const hasUpperLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  const isPasswordValid = isMinLength && hasUpperLower && hasNumber && hasSymbol;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!isPasswordValid) {
      let pwdError = '';
      if (!isMinLength) pwdError = 'Password harus minimal 8 karakter.';
      else if (!hasUpperLower) pwdError = 'Password harus mengandung kombinasi huruf besar dan huruf kecil.';
      else if (!hasNumber) pwdError = 'Password harus mengandung setidaknya satu angka.';
      else if (!hasSymbol) pwdError = 'Password harus mengandung setidaknya satu simbol.';
      
      setError(pwdError);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok dengan password yang dimasukkan.');
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/register', { name, email, password, whatsapp });
      // Auto-login after register
      const loginRes = await api.post('/auth/login', { email, password });
      const { token, user } = loginRes.data;
      saveAuth(token, user.role);
      setAuth(token, user.role, user.name);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
                <span className="text-white font-bold text-3xl">M</span>
              </div>
              <h1 className="text-3xl font-bold text-charcoal">Create Account</h1>
              <p className="text-gray-500 mt-2">Join Masamas today — it's free</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">Nomor WhatsApp</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="whatsapp"
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="081234567890"
                    pattern="[0-9]{9,15}"
                    title="Nomor WhatsApp harus berupa angka dengan panjang 9-15 digit."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 karakter (Huruf besar, kecil, angka, simbol)"
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Password Requirements Checklist */}
                <div className="mt-3 bg-gray-50 border border-gray-150 p-4 rounded-xl space-y-2 text-xs">
                  <p className="font-bold text-charcoal/80 mb-1">Persyaratan Password:</p>
                  
                  <div className="flex items-center gap-2">
                    {isMinLength ? (
                      <Check size={14} className="text-green-600 stroke-[3]" />
                    ) : (
                      <X size={14} className="text-gray-400 stroke-[3]" />
                    )}
                    <span className={`transition-colors ${isMinLength ? 'text-green-700 font-semibold' : 'text-gray-500'}`}>
                      Minimal 8 karakter {password.length > 0 && `(${password.length}/8)`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasUpperLower ? (
                      <Check size={14} className="text-green-600 stroke-[3]" />
                    ) : (
                      <X size={14} className="text-gray-400 stroke-[3]" />
                    )}
                    <span className={`transition-colors ${hasUpperLower ? 'text-green-700 font-semibold' : 'text-gray-500'}`}>
                      Mengandung huruf besar (A-Z) & huruf kecil (a-z)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasNumber ? (
                      <Check size={14} className="text-green-600 stroke-[3]" />
                    ) : (
                      <X size={14} className="text-gray-400 stroke-[3]" />
                    )}
                    <span className={`transition-colors ${hasNumber ? 'text-green-700 font-semibold' : 'text-gray-500'}`}>
                      Mengandung setidaknya satu angka (0-9)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasSymbol ? (
                      <Check size={14} className="text-green-600 stroke-[3]" />
                    ) : (
                      <X size={14} className="text-gray-400 stroke-[3]" />
                    )}
                    <span className={`transition-colors ${hasSymbol ? 'text-green-700 font-semibold' : 'text-gray-500'}`}>
                      Mengandung setidaknya satu simbol (e.g. !@#$)
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">Konfirmasi Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password Anda"
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                id="register-submit"
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition shadow-lg shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-8">
              Already have an account?{' '}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
