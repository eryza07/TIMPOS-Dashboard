import React, { useState, useMemo } from 'react';
import { usePosyandu } from '../../context/PosyanduContext';
import { 
  Gauge, 
  Ruler, 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  BookmarkCheck, 
  Radio, 
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

export const Card3RealtimeMetrics: React.FC = () => {
  const {
    activeResident,
    activeMode,
    ageValue,
    currentMeasurement,
    setCurrentMeasurement,
    nutritionStatus,
    saveCurrentMeasurementToResident,
    simulateMeasurement,
    setActiveTab,
  } = usePosyandu();

  const [isSavedFeedback, setIsSavedFeedback] = useState(false);


  // Hitung selisih TB dan BB dibandingkan pemeriksaan sebelumnya
  const deltas = useMemo(() => {
    if (!activeResident || activeResident.records.length === 0) {
      return { tbDiff: 0, bbDiff: 0, hasPrevious: false };
    }
    const latestRec = activeResident.records[activeResident.records.length - 1];
    const tbDiff = Number((currentMeasurement.tb_cm - latestRec.tb_cm).toFixed(1));
    const bbDiff = Number((currentMeasurement.bb_kg - latestRec.bb_kg).toFixed(1));
    return {
      tbDiff,
      bbDiff,
      hasPrevious: true,
      lastPeriod: latestRec.periodLabel,
    };
  }, [activeResident, currentMeasurement.tb_cm, currentMeasurement.bb_kg]);

  // Handle Simpan Hasil Ukur
  const handleSave = () => {
    saveCurrentMeasurementToResident();
    setIsSavedFeedback(true);
    setTimeout(() => {
      setIsSavedFeedback(false);
    }, 2000);
  };

  const renderDiffBadge = (diff: number, unit: string) => {
    if (diff > 0) {
      return (
        <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
          <TrendingUp className="w-3 h-3 mr-0.5 text-emerald-600" />
          +{diff} {unit}
        </span>
      );
    }
    if (diff < 0) {
      return (
        <span className="inline-flex items-center text-[11px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
          <TrendingDown className="w-3 h-3 mr-0.5 text-amber-600" />
          {diff} {unit}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-[11px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
        <Minus className="w-3 h-3 mr-0.5 text-slate-400" />
        Stabil
      </span>
    );
  };

  return (
    <section 
      id="card-3-realtime-metrics" 
      className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5 transition-all"
    >
      {/* Header Kartu */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0D5C46] flex items-center justify-center border border-emerald-200">
            <Gauge className="w-4 h-4 text-[#0D5C46]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-none">
              Kartu 3: Hasil Pengukuran Real-Time &amp; Status
            </h2>
            <p className="text-[11px] text-slate-500 mt-1">
              Data digital otomatis dari sensor ultrasonik &amp; timbangan IoT
            </p>
          </div>
        </div>

        {/* Source Badge */}
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
          <Radio className={`w-3.5 h-3.5 ${currentMeasurement.source === 'IOT' ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
          <span>Sumber: <strong>{currentMeasurement.source}</strong> ({currentMeasurement.lastUpdated})</span>
        </div>
      </div>

      {/* 4 Kotak Metrik Utama */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metrik 1: Mode */}
        <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Kategori Pasien
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-bold text-slate-900">
              {activeMode === 'BALITA' ? 'BALITA' : 'IBU HAMIL'}
            </span>
          </div>
          <span className="text-[11px] text-[#0D5C46] font-semibold block mt-1">
            {activeResident ? activeResident.id : '-'}
          </span>
        </div>

        {/* Metrik 2: Umur */}
        <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Umur Pasien
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-bold text-slate-900">
              {ageValue}
            </span>
            <span className="text-xs text-slate-500">
              {activeMode === 'BALITA' ? 'Tahun' : 'Minggu'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            {activeMode === 'BALITA' ? `${Math.round(ageValue * 12)} Bulan` : 'Trimester ' + (ageValue <= 12 ? '1' : ageValue <= 27 ? '2' : '3')}
          </span>
        </div>

        {/* Metrik 3: Tinggi Badan (TB) */}
        <div className="p-3 bg-white border-2 border-emerald-600/30 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Ruler className="w-3 h-3 text-[#0D5C46]" />
              Tinggi Badan
            </span>
            {deltas.hasPrevious && renderDiffBadge(deltas.tbDiff, 'cm')}
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {currentMeasurement.tb_cm.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-slate-500">cm</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            Min Normal: {nutritionStatus.tbMinNormal} cm
          </span>
        </div>

        {/* Metrik 4: Berat Badan (BB) */}
        <div className="p-3 bg-white border-2 border-emerald-600/30 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Scale className="w-3 h-3 text-[#0D5C46]" />
              Berat Badan
            </span>
            {deltas.hasPrevious && renderDiffBadge(deltas.bbDiff, 'kg')}
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {currentMeasurement.bb_kg.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-slate-500">kg</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">
            IMT: <strong className="text-slate-800">{nutritionStatus.bmi || '-'}</strong>
          </span>
        </div>
      </div>

      {/* Kartu Indikasi Status Otomatis Kemenkes (Hijau / Kuning / Merah) */}
      <div className={`mt-4 p-4 rounded-xl border-2 transition-all ${nutritionStatus.cardClass}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className="mt-0.5 flex-shrink-0">
              {nutritionStatus.status === 'NORMAL' && (
                <div className="w-7 h-7 rounded-full bg-green-700 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
              {nutritionStatus.status === 'WASPADA' && (
                <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              )}
              {nutritionStatus.status === 'BAHAYA' && (
                <div className="w-7 h-7 rounded-full bg-red-700 text-white flex items-center justify-center">
                  <AlertOctagon className="w-4 h-4" />
                </div>
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${nutritionStatus.badgeClass}`}>
                  STATUS: {nutritionStatus.status}
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {nutritionStatus.title}
                </span>
              </div>
              <p className="mt-1.5 text-xs sm:text-sm font-medium leading-relaxed">
                {nutritionStatus.summary}
              </p>
              <div className="mt-2.5 pt-2 border-t border-slate-300/60 text-xs leading-relaxed text-slate-700 bg-white/60 p-2.5 rounded-lg">
                <strong className="text-slate-900 block mb-0.5">Saran Medis Kader Posyandu:</strong>
                {nutritionStatus.detail}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Baris Simulasi Cepat (Normal, Waspada, Bahaya) & Koreksi Manual */}
      <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Sparkles className="w-4 h-4 text-[#0D5C46]" />
            <span>Simulasi Uji Cepat (Tanpa Alat Wokwi):</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => simulateMeasurement('NORMAL')}
              className="flex-1 sm:flex-none px-2.5 py-1 text-xs font-semibold text-green-800 bg-green-100 hover:bg-green-200 rounded-md border border-green-300 transition-colors"
            >
              Simulasi Normal
            </button>
            <button
              type="button"
              onClick={() => simulateMeasurement('WASPADA')}
              className="flex-1 sm:flex-none px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-md border border-amber-300 transition-colors"
            >
              Simulasi Waspada
            </button>
            <button
              type="button"
              onClick={() => simulateMeasurement('BAHAYA')}
              className="flex-1 sm:flex-none px-2.5 py-1 text-xs font-semibold text-red-800 bg-red-100 hover:bg-red-200 rounded-md border border-red-300 transition-colors"
            >
              Simulasi Bahaya
            </button>
          </div>
        </div>

        {/* Koreksi Manual Input */}
        <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <span className="text-slate-500 font-medium">Koreksi Angka Manual:</span>
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] text-slate-500">TB (cm):</label>
            <input
              type="number"
              step="0.1"
              value={currentMeasurement.tb_cm}
              onChange={(e) => setCurrentMeasurement((prev) => ({
                ...prev,
                tb_cm: Number(e.target.value),
                source: 'MANUAL',
                lastUpdated: new Date().toLocaleTimeString('id-ID'),
              }))}
              className="w-20 px-2 py-1 text-xs bg-white border border-slate-300 rounded font-semibold text-slate-900"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] text-slate-500">BB (kg):</label>
            <input
              type="number"
              step="0.1"
              value={currentMeasurement.bb_kg}
              onChange={(e) => setCurrentMeasurement((prev) => ({
                ...prev,
                bb_kg: Number(e.target.value),
                source: 'MANUAL',
                lastUpdated: new Date().toLocaleTimeString('id-ID'),
              }))}
              className="w-20 px-2 py-1 text-xs bg-white border border-slate-300 rounded font-semibold text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Tombol Simpan Hasil Ukur ke Riwayat Warga */}
      <div className="mt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSavedFeedback || !activeResident}
          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold rounded-xl shadow-sm transition-all min-h-[46px] ${
            isSavedFeedback
              ? 'bg-emerald-700 text-white'
              : 'bg-[#0D5C46] hover:bg-[#094434] active:scale-[0.98] text-white'
          }`}
        >
          {isSavedFeedback ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              <span>Hasil Ukur Berhasil Tersimpan ke Grafik Pasien!</span>
            </>
          ) : (
            <>
              <BookmarkCheck className="w-5 h-5 text-emerald-300" />
              <span>Simpan Hasil Ukur ke Riwayat Warga</span>
            </>
          )}
        </button>
        <p className="mt-1 text-[11px] text-center text-slate-500">
          Data akan otomatis ditambahkan ke database riwayat warga dan memperbarui kurva garis Kemenkes.
        </p>

        {/* Tombol Pintas ke Menu Riwayat & Grafik */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setActiveTab('HISTORY')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#0D5C46] hover:text-[#094434] bg-emerald-50 hover:bg-emerald-100/80 rounded-lg border border-emerald-200 transition-colors shadow-2xs"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Lihat Menu Riwayat &amp; Grafik Pasien Ini ➔</span>
          </button>
        </div>
      </div>
    </section>

  );
};
