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
  UserCheck
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

  // Handle Klik "Kunci & Tarik Data dari Alat IoT"
  const handleRemoteMeasure = () => {
    setIsPullingData(true);
    publishRemoteMeasure();
    setTimeout(() => {
      setIsPullingData(false);
    }, 1200);
  };

  // Handle Sinkron Mode ke LCD
  const handleSyncMode = () => {
    setIsSyncingMode(true);
    publishSetMode(activeMode);
    setTimeout(() => {
      setIsSyncingMode(false);
    }, 1000);
  };

  return (
    <section 
      id="card-2-iot-control" 
      className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5 transition-all"
    >
      {/* Header Kartu */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0D5C46] flex items-center justify-center border border-emerald-200">
            <Activity className="w-4 h-4 text-[#0D5C46]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-none">
              Kartu 2: Kontrol Alat IoT 2 Arah
            </h2>
            <p className="text-[11px] text-slate-500 mt-1">
              Kirim perintah sakelar mode dan kendali ukur ke ESP32 Wokwi
            </p>
          </div>
        </div>

        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
          mqttStatus === 'connected' 
            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
            : 'bg-amber-100 text-amber-800 border border-amber-200'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            mqttStatus === 'connected' ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'
          }`}></span>
          {mqttStatus === 'connected' ? 'WSS Aktif' : 'Simulasi/Offline'}
        </span>
      </div>

      {/* Banner Pasien Aktif */}
      <div className="mt-3.5 p-3.5 bg-gradient-to-r from-emerald-50/80 to-teal-50/50 border border-emerald-200/80 rounded-xl">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0D5C46] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#0D5C46] block">
                Sedang Diperiksa di Timbangan:
              </span>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {activeResident ? activeResident.name : 'Pilih warga terlebih dahulu'}
              </h3>
            </div>
          </div>
          {activeResident && (
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-white text-[#0D5C46] font-bold border border-emerald-300 shadow-2xs">
              {activeResident.id}
            </span>
          )}
        </div>

        {activeResident && (
          <div className="mt-2.5 pt-2 border-t border-emerald-200/60 flex flex-wrap items-center justify-between gap-y-1 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Wali: <strong>{activeResident.guardianName}</strong>
            </span>
            <span className="text-slate-500">
              Riwayat Terakhir: <strong>{activeResident.records[activeResident.records.length - 1]?.periodLabel || '-'}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Sakelar Mode Pemeriksaan 2 Arah (Kirim Sinyal ke LCD Wokwi) */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Sakelar Mode Alat (Sinkron LCD 16x2)
          </label>
          <span className="text-[10px] text-slate-400 font-mono">
            {activeMode === 'BALITA' ? 'KAT: BALITA' : 'KAT: IBU HAMIL'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setActiveMode('BALITA')}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all min-h-[44px] ${
              activeMode === 'BALITA'
                ? 'bg-[#0D5C46] text-white border-[#0D5C46] shadow-sm ring-2 ring-[#0D5C46]/20'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
            }`}
          >
            <Baby className="w-4 h-4" />
            <span>MODE BALITA</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('IBU_HAMIL')}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all min-h-[44px] ${
              activeMode === 'IBU_HAMIL'
                ? 'bg-[#0D5C46] text-white border-[#0D5C46] shadow-sm ring-2 ring-[#0D5C46]/20'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>MODE IBU HAMIL</span>
          </button>
        </div>
      </div>

      {/* Input Umur Pasien & Quick Chips */}
      <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            {activeMode === 'BALITA' ? 'Umur Balita (Tahun)' : 'Usia Kandungan (Minggu)'}
          </label>
          <span className="text-xs font-bold text-[#0D5C46] bg-white px-2.5 py-0.5 rounded border border-slate-200 shadow-2xs">
            {activeMode === 'BALITA' 
              ? `${ageValue} Tahun (${Math.round(ageValue * 12)} Bulan)` 
              : `${ageValue} Minggu (Trimester ${pregnancyLimits?.trimester || 1})`}
          </span>
        </div>

        {/* Input Angka Umur */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            step={activeMode === 'BALITA' ? '0.1' : '1'}
            min={activeMode === 'BALITA' ? 0.5 : 4}
            max={activeMode === 'BALITA' ? 5.0 : 42}
            value={ageValue}
            onChange={(e) => setAgeValue(Number(e.target.value))}
            className="flex-1 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5C46] text-slate-900 font-semibold"
          />
          <button
            type="button"
            onClick={handleSyncMode}
            disabled={isSyncingMode}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 active:scale-95 border border-slate-300 rounded-lg transition-all inline-flex items-center gap-1.5 min-h-[38px]"
            title="Kirim ulang sinyal mode ke LCD Wokwi"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#0D5C46] ${isSyncingMode ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sinkron LCD</span>
          </button>
        </div>

        {/* Quick Chips Pilihan Cepat */}
        <div className="flex items-center flex-wrap gap-1.5 pt-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold mr-1">
            Pilihan Cepat:
          </span>
          {activeMode === 'BALITA' ? (
            <>
              {[1, 2, 3, 4, 5].map((year) => (
                <button
                  key={`chip-yr-${year}`}
                  type="button"
                  onClick={() => setAgeValue(year)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium border transition-colors ${
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
                  className={`px-2 py-1 text-xs rounded-md font-medium border transition-colors ${
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

      {/* Tombol Aksi Utama Kontrol IoT 2 Arah */}
      <div className="mt-4 space-y-2">
        <button
          type="button"
          onClick={handleRemoteMeasure}
          disabled={isPullingData}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white bg-[#0D5C46] hover:bg-[#094434] active:scale-[0.98] rounded-xl shadow-sm transition-all min-h-[46px]"
        >
          {isPullingData ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Meminta Data Sensor Wokwi...</span>
            </>
          ) : (
            <>
              <Radio className="w-5 h-5 text-emerald-300" />
              <span>Kunci &amp; Tarik Data dari Alat IoT</span>
            </>
          )}
        </button>
        <p className="text-[11px] text-center text-slate-500">
          Mengirim perintah <code className="font-mono font-semibold text-emerald-800">REMOTE_MEASURE</code> ke topik <code className="font-mono text-slate-700">sic8/timpos/command</code>
        </p>
      </div>

      {/* Kotak Info Standar Acuan Kemenkes */}
      <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
        <div className="flex items-center gap-1.5 font-semibold text-slate-800 mb-1.5">
          <Info className="w-3.5 h-3.5 text-[#0D5C46]" />
          <span>Acuan Standar Kemenkes RI ({activeMode === 'BALITA' ? `Balita ${ageValue} Thn` : `Kehamilan ${ageValue} Mgg`}):</span>
        </div>
        {activeMode === 'BALITA' && balitaLimits && (
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <span className="text-slate-500 block">Tinggi Normal:</span>
              <strong className="text-slate-900">&ge; {balitaLimits.tbMinNormal} cm</strong>
              <span className="text-[10px] text-red-600 block mt-0.5">Bahaya Stunting: &lt; {balitaLimits.tbDangerLimit} cm</span>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <span className="text-slate-500 block">Berat Normal:</span>
              <strong className="text-slate-900">{balitaLimits.bbMinNormal} - {balitaLimits.bbMaxNormal} kg</strong>
              <span className="text-[10px] text-red-600 block mt-0.5">Gizi Buruk: &lt; {balitaLimits.bbDangerLimit} kg</span>
            </div>
          </div>
        )}

        {activeMode === 'IBU_HAMIL' && pregnancyLimits && (
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <span className="text-slate-500 block">Tinggi Aman:</span>
              <strong className="text-slate-900">&ge; 145.0 cm</strong>
              <span className="text-[10px] text-red-600 block mt-0.5">Panggul Sempit: &lt; 145 cm</span>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <span className="text-slate-500 block">Berat Ideal (Trim {pregnancyLimits.trimester}):</span>
              <strong className="text-slate-900">{pregnancyLimits.bbMinNormal} - {pregnancyLimits.bbMaxNormal} kg</strong>
              <span className="text-[10px] text-red-600 block mt-0.5">Risiko KEK: &lt; {pregnancyLimits.bbDangerLimit} kg</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
