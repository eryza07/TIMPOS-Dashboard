import React from 'react';
import { MqttConnectionStatus } from '../../types';
import { Settings, Wifi, WifiOff, LogOut } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';


interface HeaderProps {
  connectionStatus: MqttConnectionStatus;
  brokerHost: string;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  connectionStatus,
  brokerHost,
  onOpenSettings,
}) => {
  const { profile, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 py-3 flex items-center justify-between gap-4">
        {/* Brand / Logo Section */}
        <div className="flex items-center space-x-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#0D5C46] flex items-center justify-center text-white font-bold text-lg tracking-wider shadow-sm flex-shrink-0">
            TP
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">
                {profile ? profile.posyanduName : 'TIMPOS — Dashboard'}
              </h1>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-[#0D5C46] border border-emerald-300 flex-shrink-0">
                2-in-1 IoT
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate hidden sm:block">
              {profile ? `${profile.kaderName} • ${profile.rtRw}, ${profile.desaKelurahan} • ${profile.puskesmasPembina}` : 'Integrasi Alat Ukur IoT 2 Arah (Balita & Ibu Hamil) • Standar Kemenkes RI'}
            </p>
          </div>
        </div>

        {/* Right Action / MQTT Status & Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          {/* Status Koneksi Alat Timbangan (Bahasa Sederhana) */}
          <div 
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-colors cursor-pointer bg-slate-50"
            onClick={onOpenSettings}
            title={`Status Koneksi Alat: ${connectionStatus} (${brokerHost})`}
          >
            {connectionStatus === 'connected' ? (
              <>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
                </span>
                <span className="text-emerald-900 font-bold">
                  Alat Terhubung
                </span>
              </>
            ) : connectionStatus === 'connecting' ? (
              <>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
                <span className="text-amber-800 font-bold">
                  Menyambungkan...
                </span>
              </>
            ) : (
              <>
                <span className="h-3 w-3 rounded-full bg-slate-400"></span>
                <span className="text-slate-600 font-semibold">
                  Alat Offline
                </span>
              </>
            )}
          </div>

          {/* Tombol Pengaturan Alat */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#0D5C46] bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-xl border border-slate-200 transition-all min-h-[42px]"
            aria-label="Buka Pengaturan"
          >
            {connectionStatus === 'connected' ? (
              <Wifi className="w-4 h-4 text-[#0D5C46]" />
            ) : (
              <WifiOff className="w-4 h-4 text-slate-500" />
            )}
            <span className="hidden sm:inline">Pengaturan</span>
            <Settings className="w-3.5 h-3.5 text-slate-400 hidden sm:inline ml-0.5" />
          </button>

          {/* Tombol Logout / Keluar */}
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100/80 active:scale-95 rounded-lg border border-rose-200 transition-all min-h-[40px]"
            title="Keluar dari akun Posyandu ini"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
};

