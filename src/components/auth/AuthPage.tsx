import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle,
  Database,
  KeyRound,
  Info
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, isSupabaseConfigured } = useAuth();


  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State Form Login & Ingat Perangkat Ini
  const [rememberDevice, setRememberDevice] = useState(() => {
    return localStorage.getItem('timpos_remember_device') !== 'false';
  });

  const [loginEmail, setLoginEmail] = useState(() => {
    return localStorage.getItem('timpos_saved_email') || '';
  });
  const [loginPassword, setLoginPassword] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    if (rememberDevice) {
      localStorage.setItem('timpos_remember_device', 'true');
      localStorage.setItem('timpos_saved_email', loginEmail);
    } else {
      localStorage.setItem('timpos_remember_device', 'false');
      localStorage.removeItem('timpos_saved_email');
    }

    try {
      const res = await login(loginEmail, loginPassword);
      if (!res.success) {
        setErrorMessage(res.error || 'Email atau kata sandi tidak cocok. Silakan periksa kembali.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Terjadi kesalahan saat masuk.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-10 px-4 sm:px-6 font-sans">
      <div className="max-w-md w-full mx-auto">
        {/* Brand & Logo Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0D5C46] text-white shadow-md mb-3 border-2 border-emerald-300">
            <ShieldCheck className="w-8 h-8 text-emerald-100" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">TIMPOS</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-[#0D5C46] border border-emerald-300">
              KEMENKES RI
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Portal Digital Kader &amp; Pemantauan Alat Ukur IoT Timbangan 2-in-1 Posyandu
          </p>

          {/* Status Badge Supabase */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white border border-slate-200 text-slate-600 shadow-2xs">
            <Database className={`w-3.5 h-3.5 ${isSupabaseConfigured ? 'text-emerald-600' : 'text-amber-500'}`} />
            <span>
              {isSupabaseConfigured ? 'Database Cloud Supabase Terhubung' : 'Mode Offline / Local Auth Aktif'}
            </span>
          </div>
        </div>

        {/* Card Utama Login Saja (Registrasi Dihapus Sesuai Permintaan) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header Card Login */}
          <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 leading-none">
              Masuk ke Dashboard Posyandu
            </h2>
            <p className="text-[11px] text-slate-500 mt-1">
              Gunakan email &amp; kata sandi yang telah disiapkan Administrator
            </p>
          </div>

          <div className="p-6">
            {/* Feedback Pesan Error */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* FORM LOGIN */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Akun Posyandu / Kader
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="kader@posyandudigital.id"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5C46] focus:border-transparent text-slate-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Kata Sandi
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5C46] focus:border-transparent text-slate-900"
                  />
                </div>
              </div>

              {/* Checkbox Ingat Perangkat Ini */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="w-4 h-4 text-[#0D5C46] rounded border-slate-300 focus:ring-[#0D5C46] accent-[#0D5C46] cursor-pointer"
                  />
                  <span className="text-xs text-slate-700 font-medium group-hover:text-slate-900 transition-colors">
                    Ingat perangkat ini (tetap masuk)
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 px-4 bg-[#0D5C46] hover:bg-[#094434] active:scale-98 text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all min-h-[44px] disabled:opacity-50"
              >
                {isLoading ? 'Sedang Memeriksa Akun...' : 'Masuk ke Dashboard Posyandu'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Catatan Akses Terbatas untuk Kader */}
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2 text-[11px] text-slate-500">
              <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <span>
                Pendaftaran akun dikelola secara terpusat. Hubungi Administrator / Bidan Desa jika Anda belum memiliki akun atau lupa kata sandi.
              </span>
            </div>
          </div>
        </div>


        {/* Petunjuk Setup Supabase .env */}
        <div className="mt-5 p-3.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 shadow-2xs">
          <div className="flex items-center gap-2 font-semibold text-slate-800 mb-1">
            <KeyRound className="w-4 h-4 text-[#0D5C46]" />
            <span>Kredensial Database Cloud (.env)</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Data login akun dihubungkan ke Supabase via file <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">.env</code>. File ini sudah aman dan tidak akan ter-upload ke GitHub.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-slate-400">
        &copy; 2026 TIMPOS &bull; Timbangan &amp; Pengukur Tinggi Posyandu Digital 2-in-1
      </footer>
    </div>
  );
};
