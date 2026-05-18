'use client';

import { useEffect, useState } from 'react';

import api from '@/lib/api';
import { User, Shield, Search } from 'lucide-react';

interface UserItem {
  id: number; name: string; email: string; role: string; createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data);
    } catch {
      // Endpoint might not exist yet — show empty
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal">Manajemen Pengguna</h1>
          <p className="text-gray-500 mt-1">{users.length} pengguna terdaftar</p>
        </div>

        <div className="relative mb-6 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama atau email..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold text-charcoal">Pengguna</th>
                <th className="p-4 font-semibold text-charcoal">Email</th>
                <th className="p-4 font-semibold text-charcoal">Peran</th>
                <th className="p-4 font-semibold text-charcoal">Bergabung</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-charcoal">{u.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-500">{u.email}</td>
                  <td className="p-4">
                    <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {u.role === 'ADMIN' ? <Shield size={12} /> : <User size={12} />}
                      {u.role === 'ADMIN' ? 'Admin' : 'Customer'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">{new Date(u.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="text-center py-8 text-gray-400">Memuat...</div>}
          {!loading && filtered.length === 0 && <div className="text-center py-12 text-gray-400">Pengguna tidak ditemukan</div>}
        </div>
      </div>
    </main>
  );
}

