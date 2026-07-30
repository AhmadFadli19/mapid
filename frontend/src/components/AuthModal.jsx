import React, { useState } from 'react';
import api from '../services/api';
import { LogIn, UserPlus, Shield, MapPin } from 'lucide-react';

export default function AuthModal({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegister ? '/register' : '/login';
      const response = await api.post(endpoint, formData);

      const { access_token, user } = response.data;
      localStorage.setItem('mapid_token', access_token);
      localStorage.setItem('mapid_user', JSON.stringify(user));

      onLoginSuccess(user);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal autentikasi. Periksa kembali data Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 text-slate-100 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">MAPID Transit Intelligence</h2>
            <p className="text-xs text-slate-400">Silakan login untuk mengakses fitur lengkap pendamping perjalanan</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ahmad Fadli"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="ahmadfadli"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nomor Telepon</label>
                <input
                  type="text"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="081234567890"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-100"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Alamat Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="user@mapid.id"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 font-semibold py-2.5 rounded-xl transition text-sm flex items-center justify-center gap-2 text-white shadow-lg shadow-blue-600/30"
          >
            {loading ? 'Memproses...' : isRegister ? (
              <>
                <UserPlus className="w-4 h-4" /> Daftar Akun MAPID
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Masuk ke MAPID
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-400 border-t border-slate-700/60 pt-4">
          {isRegister ? (
            <p>
              Sudah punya akun?{' '}
              <button
                onClick={() => setIsRegister(false)}
                className="text-blue-400 font-semibold hover:underline"
              >
                Login sekarang
              </button>
            </p>
          ) : (
            <p>
              Belum memiliki akun?{' '}
              <button
                onClick={() => setIsRegister(true)}
                className="text-blue-400 font-semibold hover:underline"
              >
                Daftar akun baru
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
