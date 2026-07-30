import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { LogIn, UserPlus, MapPin, KeyRound } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: 'ayamurok@gmail.com',
    phone: '',
    password: 'jamal1234',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Autentikasi gagal. Silakan periksa kredensial Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow effect background */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700/80 rounded-3xl p-8 w-full max-w-md shadow-2xl z-10">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3.5 bg-blue-600/20 text-blue-400 rounded-2xl mb-3 border border-blue-500/30 shadow-lg shadow-blue-500/10">
            <MapPin className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">MAPID Transit Intelligence</h1>
          <p className="text-xs text-slate-400 mt-1">Platform WebGIS & Navigation Companion Transportasi Umum</p>
        </div>

        {/* Info Seeder Jamal */}
        <div className="mb-5 p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-xs text-slate-300">
          <p className="font-bold text-blue-400 flex items-center gap-1.5 mb-1">
            <KeyRound className="w-4 h-4" /> Akun Seeder Bawaan (Jamal)
          </p>
          <p>Email: <strong className="text-white">ayamurok@gmail.com</strong></p>
          <p>Password: <strong className="text-white">jamal1234</strong></p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl text-xs text-center font-medium">
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
                  placeholder="Jamal"
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition"
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
                  placeholder="jamal"
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition"
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
                  placeholder="081234567899"
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition"
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
              placeholder="ayamurok@gmail.com"
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition"
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
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 font-bold py-3 rounded-xl transition text-xs flex items-center justify-center gap-2 text-white shadow-lg shadow-blue-600/30 mt-2"
          >
            {loading ? 'Memproses...' : isRegister ? (
              <>
                <UserPlus className="w-4 h-4" /> Register & Masuk Dashboard
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Login sebagai Jamal
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-700/60 pt-4">
          {isRegister ? (
            <p>
              Sudah mempunyai akun?{' '}
              <button
                onClick={() => setIsRegister(false)}
                className="text-blue-400 font-semibold hover:underline"
              >
                Login sekarang
              </button>
            </p>
          ) : (
            <p>
              Belum mendaftar?{' '}
              <button
                onClick={() => setIsRegister(true)}
                className="text-blue-400 font-semibold hover:underline"
              >
                Buat akun MAPID baru
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
