import React, { useState } from 'react';
import { usePosyandu } from '../../context/PosyanduContext';
import { 
  Activity, 
  Baby, 
  Heart, 
  Radio, 
  RefreshCw, 
  Info,
  Calendar,
  UserCheck,
  Plus,
  Minus
} from 'lucide-react';
import { getBalitaThresholds, getPregnancyThresholds } from '../../services/nutritionEngine';

export const Card2IotControl: React.FC = () => {
  const {
    activeResident,
    activeMode,
    setActiveMode,
    ageValue,
    setAgeValue,
    publishRemoteMeasure,
    publishSetMode,
    mqttStatus,
  } = usePosyandu();

  const [isPullingData, setIsPullingData] = useState(false);
  const [isSyncingMode, setIsSyncingMode] = useState(false);

  // Ambang acuan Kemenkes dinamis sesuai mode dan umur yang diinput
  const balitaLimits = activeMode === 'BALITA' ? getBalitaThresholds(ageValue) : null;
  const pregnancyLimits = activeMode === 'IBU_HAMIL' ? getPregnancyThresholds(ageValue) : null;

  // Handle Klik "Ambil Angka dari Timbangan"
  const handleRemoteMeasure = () => {
    setIsPullingData(true);
    publishRemoteMeasure();
    setTimeout(() => {
      setIsPullingData(false);
    }, 1200);
  };

  // Handle Sinkron Mode ke Layar Timbangan
  const handleSyncMode = () => {
    setIsSyncingMode(true);
    publishSetMode(activeMode);
    setTimeout(() => {
      setIsSyncingMode(false);
    }, 1000);
  };

  // Fungsi tambah / kurang umur ramah lansia
  const handleDecrementAge = () => {
    if (activeMode === 'BALITA') {
      const newVal = Math.max(0.5, Number((ageValue - 0.5).toFixed(1)));
      setAgeValue(newVal);
    } else {
      const newVal = Math.max(4, ageValue - 1);
      setAgeValue(newVal);
    }
  };

  const handleIncrementAge = () => {
    if (activeMode === 'BALITA') {
      const newVal = Math.min(5.0, Number((ageValue + 0.5).toFixed(1)));
      setAgeValue(newVal);
    } else {
      const newVal = Math.min(42, ageValue + 1);
      setAgeValue(newVal);
    }
  };

  return (
    <section 
      id="card-2-iot-control" 
      className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5 transition-all"
    >
      {/* Header Kartu */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 gap-2">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#0D5C46] flex items-center justify-center border border-emerald-200">
            <Activity className="w-5 h-5 text-[#0D5C46]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              Kontrol Alat Timbangan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih mode dan ambil hasil ukur dari timbangan
            </p>
          </div>
        </div>

        <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
          mqttStatus === 'connected' 
            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
            : 'bg-amber-100 text-amber-800 border border-amber-300'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            mqttStatus === 'connected' ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'
          }`}></span>
          {mqttStatus === 'connected' ? 'Alat Aktif' : 'Offline'}
        </span>
      </div>

      {/* Banner Pasien yang Sedang Diperiksa */}
      <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50/60 border border-emerald-200 rounded-2xl">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0D5C46] text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-[#0D5C46] block">
                Sedang Diperiksa:
              </span>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight mt-0.5">
                {activeResident ? activeResident.name : 'Pilih warga terlebih dahulu'}
              </h3>
            </div>
          </div>
          {activeResident && (
            <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-white text-[#0D5C46] font-bold border border-emerald-300 shadow-2xs">
              {activeResident.id}
            </span>
          )}
        </div>

        {activeResident && (
          <div className="mt-3 pt-2.5 border-t border-emerald-200/70 flex flex-wrap items-center justify-between gap-y-1 text-xs text-slate-700">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              Wali: <strong className="text-slate-900">{activeResident.guardianName}</strong>
            </span>
            <span className="text-slate-600">
              Riwayat: <strong>{activeResident.records[activeResident.records.length - 1]?.periodLabel || 'Belum ada data'}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Sakelar Mode Pemeriksaan (Balita / Ibu Hamil) */}
      <div className="mt-4">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
          1. Pilih Jenis Pasien
        </label>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setActiveMode('BALITA')}
            className={`flex items-center justify-center gap-2.5 py-3.5 px-3 rounded-2xl text-sm font-bold border-2 transition-all min-h-[52px] ${
              activeMode === 'BALITA'
                ? 'bg-[#0D5C46] text-white border-[#0D5C46] shadow-sm ring-2 ring-[#0D5C46]/20'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
            }`}
          >
            <Baby className="w-5 h-5 flex-shrink-0" />
            <span>Balita (Anak)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('IBU_HAMIL')}
            className={`flex items-center justify-center gap-2.5 py-3.5 px-3 rounded-2xl text-sm font-bold border-2 transition-all min-h-[52px] ${
              activeMode === 'IBU_HAMIL'
                ? 'bg-[#0D5C46] text-white border-[#0D5C46] shadow-sm ring-2 ring-[#0D5C46]/20'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
            }`}
          >
            <Heart className="w-5 h-5 flex-shrink-0" />
            <span>Ibu Hamil</span>
          </button>
        </div>
      </div>

      {/* Input Umur Ramah Lansia dengan Tombol [+] dan [-] Besar */}
      <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            2. {activeMode === 'BALITA' ? 'Umur Balita' : 'Usia Kandungan'}
          </label>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-xs font-extrabold text-[#0D5C46] bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              {activeMode === 'BALITA' 
                ? `${Math.round(ageValue * 12)} Bulan` 
                : `Trimester ${pregnancyLimits?.trimester || 1}`}
            </span>
            <button
              type="button"
              onClick={handleSyncMode}
              disabled={isSyncingMode}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg inline-flex items-center gap-1 shadow-2xs"
              title="Kirim ulang sinyal mode ke layar timbangan"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#0D5C46] ${isSyncingMode ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Kirim ke Layar</span>
            </button>
          </div>
        </div>

        {/* Stepper Umur Besar & Mudah Ditekan */}
        <div className="flex items-center justify-between gap-3 bg-white p-2 rounded-xl border border-slate-300">
          <button
            type="button"
            onClick={handleDecrementAge}
            className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center text-slate-700 font-bold border border-slate-200 transition-all flex-shrink-0"
            title="Kurangi umur"
            aria-label="Kurangi umur"
          >
            <Minus className="w-5 h-5" />
          </button>

          <div className="text-center flex-1 min-w-0">
            <span className="text-2xl font-black text-slate-900 tracking-tight block leading-none">
              {ageValue}
            </span>
            <span className="text-xs font-semibold text-slate-500 mt-0.5 block truncate">
              {activeMode === 'BALITA' ? 'Tahun' : 'Minggu Kehamilan'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleIncrementAge}
            className="w-11 h-11 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#0D5C46] active:scale-95 flex items-center justify-center font-bold border border-emerald-200 transition-all flex-shrink-0"
            title="Tambah umur"
            aria-label="Tambah umur"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Pilihan Cepat Umur */}
        <div className="flex items-center flex-wrap gap-2 pt-1">
          <span className="text-xs text-slate-500 font-semibold mr-1">
            Pilihan Cepat:
          </span>
          {activeMode === 'BALITA' ? (
            <>
              {[1, 2, 3, 4, 5].map((year) => (
                <button
                  key={`chip-yr-${year}`}
                  type="button"
                  onClick={() => setAgeValue(year)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-bold border transition-colors ${
                    ageValue === year
                      ? 'bg-[#0D5C46] text-white border-[#0D5C46]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {year} Thn
                </button>
              ))}
            </>
          ) : (
            <>
              {[12, 20, 24, 28, 36].map((week) => (
                <button
                  key={`chip-wk-${week}`}
                  type="button"
                  onClick={() => setAgeValue(week)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-bold border transition-colors ${
                    ageValue === week
                      ? 'bg-[#0D5C46] text-white border-[#0D5C46]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {week} Mgg
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Tombol Utama: Ambil Angka dari Timbangan */}
      <div className="mt-4 space-y-1.5">
        <button
          type="button"
          onClick={handleRemoteMeasure}
          disabled={isPullingData}
          className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-3.5 text-sm sm:text-base font-extrabold text-white bg-[#0D5C46] hover:bg-[#094434] active:scale-[0.98] rounded-2xl shadow-md transition-all min-h-[52px]"
        >
          {isPullingData ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin text-emerald-200" />
              <span>Mengambil Angka dari Timbangan...</span>
            </>
          ) : (
            <>
              <Radio className="w-5 h-5 text-emerald-300" />
              <span>Ambil Angka dari Timbangan</span>
            </>
          )}
        </button>
        <p className="text-xs text-center text-slate-500">
          Tekan tombol di atas saat pasien sudah berdiri tenang di atas timbangan.
        </p>
      </div>

      {/* Info Standar Sehat Kemenkes (Sederhana & Mudah Dipahami) */}
      <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700">
        <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-2">
          <Info className="w-4 h-4 text-[#0D5C46]" />
          <span>Batas Standar Sehat ({activeMode === 'BALITA' ? `Balita ${ageValue} Thn` : `Hamil ${ageValue} Mgg`}):</span>
        </div>
        {activeMode === 'BALITA' && balitaLimits && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 min-w-0">
              <span className="text-slate-500 block text-[11px] truncate">Tinggi Sehat:</span>
              <strong className="text-slate-900 text-sm block truncate">&ge; {balitaLimits.tbMinNormal} cm</strong>
              <span className="text-[11px] text-red-600 font-semibold block mt-0.5 truncate">Kurang: &lt; {balitaLimits.tbDangerLimit} cm</span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 min-w-0">
              <span className="text-slate-500 block text-[11px] truncate">Berat Sehat:</span>
              <strong className="text-slate-900 text-sm block truncate">{balitaLimits.bbMinNormal} - {balitaLimits.bbMaxNormal} kg</strong>
              <span className="text-[11px] text-red-600 font-semibold block mt-0.5 truncate">Kurang: &lt; {balitaLimits.bbDangerLimit} kg</span>
            </div>
          </div>
        )}

        {activeMode === 'IBU_HAMIL' && pregnancyLimits && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 min-w-0">
              <span className="text-slate-500 block text-[11px] truncate">Tinggi Aman:</span>
              <strong className="text-slate-900 text-sm block truncate">&ge; 145.0 cm</strong>
              <span className="text-[11px] text-red-600 font-semibold block mt-0.5 truncate">Panggul Sempit: &lt; 145 cm</span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 min-w-0">
              <span className="text-slate-500 block text-[11px] truncate">Berat Ideal:</span>
              <strong className="text-slate-900 text-sm block truncate">{pregnancyLimits.bbMinNormal} - {pregnancyLimits.bbMaxNormal} kg</strong>
              <span className="text-[11px] text-red-600 font-semibold block mt-0.5 truncate">Risiko KEK: &lt; {pregnancyLimits.bbDangerLimit} kg</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
