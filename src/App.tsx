import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './components/auth/AuthPage';
import { PosyanduProvider, usePosyandu } from './context/PosyanduContext';
import { Header } from './components/common/Header';
import { NavigationTabs } from './components/common/NavigationTabs';
import { MqttSettingsModal } from './components/common/MqttSettingsModal';
import { Card1ResidentList } from './components/left-column/Card1ResidentList';
import { Card2IotControl } from './components/left-column/Card2IotControl';
import { Card3RealtimeMetrics } from './components/right-column/Card3RealtimeMetrics';
import { Card4GrowthChart } from './components/right-column/Card4GrowthChart';
import { Card5AiConsultation } from './components/right-column/Card5AiConsultation';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Scale, 
  TrendingUp, 
  UserCheck, 
  Plus
} from 'lucide-react';


function DashboardContent() {
  const { profile } = useAuth();
  const { 
    mqttConfig, 
    mqttStatus, 
    updateMqttConfig, 
    lastActionMessage,
    activeResident,
    activeResidentId,
    setActiveResidentId,
    activeMode,
    residents,
    activeTab,
    setActiveTab,
  } = usePosyandu();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Toast Notification Action */}
      {lastActionMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 text-xs font-medium flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{lastActionMessage}</span>
        </div>
      )}

      {/* Sticky Header Klinis dengan Real-Time MQTT Status */}
      <Header
        connectionStatus={mqttStatus}
        brokerHost={mqttConfig.brokerUrl}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-6">
        {/* Top Info Banner Profil Posyandu */}
        <div className="mb-5 p-3.5 sm:p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#0D5C46] flex items-center justify-center border border-emerald-200 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-semibold text-slate-900">
                  {profile ? `Dashboard ${profile.posyanduName}` : 'Sistem Pencatatan Digital Terpadu Posyandu'}
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                  2-in-1 IoT Mode
                </span>
                {profile && (
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">
                    {profile.rtRw} • {profile.desaKelurahan}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Kader: <strong className="text-slate-800">{profile?.kaderName || 'Ibu Kader'}</strong> &bull; Pasien Terpilih: <strong className="text-slate-800">{activeResident?.name || 'Belum dipilih'}</strong> ({activeMode})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 self-stretch sm:self-auto justify-between sm:justify-start">
            <span className="font-medium">Topik IoT:</span>
            <code className="text-[#0D5C46] font-mono font-semibold">{mqttConfig.dataTopic}</code>
          </div>
        </div>

        {/* 🗂️ NAVIGASI MENU TERPISAH (TAB NAVIGASI MANDIRI) */}
        <NavigationTabs />

        {/* ======================================================== */}
        {/* MENU 1: MEJA PENIMBANGAN & IOT (LIVE MEASUREMENT DESK)  */}
        {/* ======================================================== */}
        {activeTab === 'MEASUREMENT' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Quick Patient Switcher Bar di Meja Ukur */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#0D5C46] flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-semibold text-slate-500 block leading-tight">
                    Pasien yang Sedang Berada di Timbangan:
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 truncate block">
                    {activeResident ? `${activeResident.name} (${activeResident.id})` : 'Belum ada warga dipilih'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto self-stretch sm:self-auto">
                {residents.length > 0 ? (
                  <select
                    value={activeResidentId}
                    onChange={(e) => setActiveResidentId(e.target.value)}
                    className="flex-1 sm:w-64 bg-slate-50 border border-slate-200 rounded-lg text-xs py-2 px-2.5 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D5C46]"
                    aria-label="Pilih pasien yang akan ditimbang"
                  >
                    {residents.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.category === 'BALITA' ? `Balita ${r.ageValue} Thn` : `Bumil ${r.ageValue} Mgg`})
                      </option>
                    ))}
                  </select>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveTab('RESIDENTS')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0D5C46] text-white rounded-lg text-xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + Daftarkan Pasien
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveTab('RESIDENTS')}
                  className="px-2.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
                  title="Lihat seluruh daftar warga"
                >
                  Cari Warga
                </button>
              </div>
            </div>

            {/* 2 Kolom Meja Timbangan: Kontrol Alat (Kiri) + Hasil Real-Time (Kanan) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Kolom Kiri: Kontrol Alat IoT 2 Arah */}
              <div className="lg:col-span-5 space-y-6">
                <Card2IotControl />
              </div>

              {/* Kolom Kanan: Hasil Ukur Real-Time & Penilaian Kemenkes */}
              <div className="lg:col-span-7 space-y-6">
                <Card3RealtimeMetrics />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MENU 2: RIWAYAT & GRAFIK PASIEN (DATA KHUSUS HASIL UKUR) */}
        {/* ======================================================== */}
        {activeTab === 'HISTORY' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Header Pasien Terpilih & Switcher */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0D5C46] flex items-center justify-center flex-shrink-0 border border-emerald-200">
                  <TrendingUp className="w-5 h-5 text-[#0D5C46]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 leading-none">
                      {activeResident ? activeResident.name : 'Pilih Pasien Terlebih Dahulu'}
                    </h3>
                    {activeResident && (
                      <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                        {activeResident.id}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {activeResident 
                      ? `${activeResident.category === 'BALITA' ? `Balita (${activeResident.ageValue} Tahun)` : `Ibu Hamil (${activeResident.ageValue} Minggu)`} • Wali: ${activeResident.guardianName} • Total ${activeResident.records.length} Pemeriksaan`
                      : 'Pilih pasien untuk melihat grafik pertumbuhan dan rekam medis lengkap'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={activeResidentId}
                  onChange={(e) => setActiveResidentId(e.target.value)}
                  className="flex-1 sm:w-60 bg-slate-50 border border-slate-200 rounded-lg text-xs py-2 px-2.5 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D5C46]"
                  aria-label="Pilih pasien untuk melihat riwayat"
                >
                  {residents.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.records.length} riwayat)
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setActiveTab('MEASUREMENT')}
                  className="px-3 py-2 text-xs font-semibold text-white bg-[#0D5C46] hover:bg-[#094434] rounded-lg transition-colors whitespace-nowrap shadow-xs flex items-center gap-1"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Timbang Lagi</span>
                </button>
              </div>
            </div>

            {/* Konten Menu Riwayat: Kartu 4 (Grafik Plotly & Tabel Riwayat) */}
            <div className="w-full">
              <Card4GrowthChart />
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MENU 3: DATA WARGA (BALITA & IBU HAMIL LENGKAP)          */}
        {/* ======================================================== */}
        {activeTab === 'RESIDENTS' && (
          <div className="w-full animate-fadeIn">
            {/* Kartu 1: Pencarian, Filter Kategori, Daftar Warga, dan Tambah Pasien Baru */}
            <Card1ResidentList />
          </div>
        )}

        {/* ======================================================== */}
        {/* MENU 4: KONSULTASI AI POSYANDU                           */}
        {/* ======================================================== */}
        {activeTab === 'AI_CONSULTATION' && (
          <div className="w-full animate-fadeIn">
            <Card5AiConsultation />
          </div>
        )}
      </main>

      {/* Footer Bersih Puskesmas */}
      <footer className="w-full bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>&copy; 2026 TIMPOS &bull; Timbangan &amp; Pengukur Tinggi Posyandu Digital 2-in-1</p>
          <div className="flex items-center gap-3">
            <span>Standar Kemenkes RI</span>
            <span>&bull;</span>
            <span>MQTT over WSS HiveMQ</span>
            <span>&bull;</span>
            <span className="font-semibold text-emerald-800">Supabase &amp; Vercel Ready</span>
          </div>
        </div>
      </footer>


      {/* Modal Pengaturan MQTT */}
      <MqttSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={mqttConfig}
        onSave={updateMqttConfig}
      />
    </div>
  );
}

function AppRouter() {
  const { authStatus, profile } = useAuth();

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-[#0D5C46] flex items-center justify-center text-white animate-pulse mb-3 shadow-md">
          <ShieldCheck className="w-6 h-6 text-emerald-100" />
        </div>
        <p className="text-xs font-semibold text-slate-700">Memuat Sistem TIMPOS Posyandu...</p>
        <span className="text-[11px] text-slate-400 mt-1">Mengamankan sesi autentikasi kader</span>
      </div>
    );
  }

  if (authStatus === 'unauthenticated' || !profile) {
    return <AuthPage />;
  }

  return (
    <PosyanduProvider>
      <DashboardContent />
    </PosyanduProvider>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;

