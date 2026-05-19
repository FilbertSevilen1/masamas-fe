'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { 
  User, 
  Shield, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  AlertTriangle, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface UserItem {
  id: number;
  name: string;
  email: string;
  whatsapp: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER');

  // Confirmation Modal
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);

  // Snackbar Notification
  const [snackbar, setSnackbar] = useState({
    message: '',
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    visible: false
  });

  useEffect(() => { 
    fetchUsers(); 
  }, []);

  const triggerSnackbar = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setSnackbar({ message, type, visible: true });
    setTimeout(() => {
      setSnackbar(prev => ({ ...prev, visible: false }));
    }, 4000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data);
    } catch {
      triggerSnackbar('Gagal mengambil daftar pengguna', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedUser(null);
    setName('');
    setEmail('');
    setWhatsapp('');
    setPassword('');
    setRole('CUSTOMER');
    setModalOpen(true);
  };

  const handleOpenEdit = (user: UserItem) => {
    setModalMode('edit');
    setSelectedUser(user);
    setName(user.name);
    setEmail(user.email);
    setWhatsapp(user.whatsapp || '');
    setPassword(''); // Leave password empty for edit
    setRole(user.role);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (modalMode === 'create') {
        if (!password) {
          triggerSnackbar('Password wajib diisi untuk pengguna baru', 'warning');
          setIsSaving(false);
          return;
        }
        await api.post('/auth/users', { name, email, password, whatsapp, role });
        triggerSnackbar('Pengguna baru berhasil dibuat!', 'success');
      } else {
        if (!selectedUser) return;
        const payload: any = { name, email, whatsapp, role };
        if (password) payload.password = password; // Only update password if filled
        
        await api.put(`/auth/users/${selectedUser.id}`, payload);
        triggerSnackbar('Data pengguna berhasil diperbarui!', 'success');
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Gagal menyimpan data pengguna';
      triggerSnackbar(errMsg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDelete = (user: UserItem) => {
    setUserToDelete(user);
    setConfirmDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/auth/users/${userToDelete.id}`);
      triggerSnackbar('Pengguna berhasil dihapus!', 'success');
      setConfirmDeleteOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Gagal menghapus pengguna';
      triggerSnackbar(errMsg, 'error');
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="px-6 py-10">
        
        {/* Title Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-charcoal">Manajemen Pengguna</h1>
            <p className="text-gray-500 mt-1">{users.length} total pengguna terdaftar</p>
          </div>
          <button 
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition shadow-lg shadow-primary/25"
          >
            <Plus size={18} /> Tambah Pengguna
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="relative mb-6 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama atau email..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm bg-white shadow-sm"
          />
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-150 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-100 text-charcoal font-semibold">
                <tr>
                  <th className="p-4">Pengguna</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">WhatsApp</th>
                  <th className="p-4">Peran</th>
                  <th className="p-4">Bergabung Pada</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-charcoal">{u.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{u.email}</td>
                    <td className="p-4 text-gray-600 font-mono text-xs">{u.whatsapp}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${u.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                        {u.role === 'ADMIN' ? <Shield size={12} /> : <User size={12} />}
                        {u.role === 'ADMIN' ? 'Admin' : 'Customer'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-2 text-charcoal hover:bg-gray-100 rounded-xl transition"
                          title="Edit Pengguna"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(u)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition"
                          title="Hapus Pengguna"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {loading && <div className="text-center py-12 text-gray-400 font-medium">Memuat data pengguna...</div>}
          {!loading && filtered.length === 0 && <div className="text-center py-16 text-gray-400">Pengguna tidak ditemukan</div>}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
            {/* Modal Header */}
            <div className="bg-charcoal text-white p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {modalMode === 'create' ? 'Tambah Pengguna Baru' : 'Ubah Data Pengguna'}
              </h2>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Masukkan nama lengkap..."
                  className="w-full px-4 py-2.5 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Alamat Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Nomor WhatsApp</label>
                <input
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="081234567890"
                  className="w-full px-4 py-2.5 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">
                  Password {modalMode === 'edit' && <span className="text-gray-400 normal-case">(Kosongkan jika tidak diubah)</span>}
                </label>
                <input
                  type="password"
                  required={modalMode === 'create'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={modalMode === 'create' ? "Masukkan password minimal 6 karakter..." : "••••••••"}
                  className="w-full px-4 py-2.5 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Peran / Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm bg-white font-medium"
                >
                  <option value="CUSTOMER">Customer (Pelanggan)</option>
                  <option value="ADMIN">Admin (Pengelola)</option>
                </select>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-300 text-charcoal font-semibold rounded-xl text-sm hover:bg-gray-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary-dark transition flex items-center gap-2 shadow-md shadow-primary/25 disabled:opacity-50"
                >
                  <Save size={16} /> {isSaving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {confirmDeleteOpen && userToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-slide-up">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
                <AlertTriangle size={32} className="text-red-500" />
              </div>
              
              <h3 className="text-xl font-black text-charcoal mb-2">
                Konfirmasi Hapus
              </h3>
              
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Apakah Anda yakin ingin menghapus akun milik <strong>{userToDelete.name}</strong> ({userToDelete.email})? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
              </p>
              
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => setConfirmDeleteOpen(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition font-bold text-sm shadow-sm"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-bold text-sm shadow-lg shadow-red-200"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast / Snackbar Notification Container */}
      {snackbar.visible && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in pointer-events-auto">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border backdrop-blur-md max-w-md ${
            snackbar.type === 'success' ? 'bg-green-500/90 text-white border-green-600' :
            snackbar.type === 'error' ? 'bg-red-500/90 text-white border-red-600' :
            snackbar.type === 'warning' ? 'bg-orange-500/90 text-white border-orange-600' :
            'bg-blue-500/90 text-white border-blue-600'
          }`}>
            {snackbar.type === 'success' && <CheckCircle size={20} className="shrink-0" />}
            {snackbar.type === 'error' && <AlertCircle size={20} className="shrink-0" />}
            {snackbar.type === 'warning' && <AlertTriangle size={20} className="shrink-0" />}
            {snackbar.type === 'info' && <CheckCircle size={20} className="shrink-0" />}
            <span className="text-xs font-bold leading-snug">{snackbar.message}</span>
            <button 
              onClick={() => setSnackbar(prev => ({ ...prev, visible: false }))}
              className="p-1 hover:bg-white/20 rounded-full transition ml-auto"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
