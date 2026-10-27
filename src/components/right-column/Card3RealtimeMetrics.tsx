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
  TrendingUp,
  TrendingDown,
  Minus,
  User,
  Calendar
} from 'lucide-react';

export const Card3RealtimeMetrics: React.FC = () => {
  const {
    activeResident,
    activeMode,
    ageValue,
    currentMeasurement,
    nutritionStatus,
    saveCurrentMeasurementToResident,
    setActiveTab,
    autoSaveOnIot,
    setAutoSaveOnIot,
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
        <span className="inline-flex items-center text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300 flex-shrink-0">
          <TrendingUp className="w-3.5 h-3.5 mr-0.5 text-emerald-600" />
          +{diff} {unit}
        </span>
      );
    }
    if (diff < 0) {
      return (
        <span className="inline-flex items-center text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300 flex-shrink-0">
          <TrendingDown className="w-3.5 h-3.5 mr-0.5 text-amber-600" />
          {diff} {unit}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md flex-shrink-0">
        <Minus className="w-3.5 h-3.5 mr-0.5 text-slate-400" />
        Sama
      </span>
    );
  };

  return (
    <section 
      id="card-3-realtime-metrics" 
      className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5 transition-all overflow-hidden"
    >
      {/* Header Kartu */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 gap-2">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#0D5C46] flex items-center justify-center border border-emerald-200 flex-shrink-0">
            <Gauge className="w-5 h-5 text-[#0D5C46]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-900 leading-tight truncate">
              Hasil Ukur Timbangan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              Angka tinggi &amp; berat badan langsung dari alat
            </p>
          </div>
        </div>

        {/* Status Sumber Angka */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-emerald-50 px-2.5 sm:px-3 py-1.5 rounded-xl border border-emerald-200 flex-shrink-0">
          <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span className="hidden xs:inline sm:inline">Timbangan Digital</span>
        </div>
      </div>

      {/* Baris 1: Info Singkat Pasien & Umur (2 Kolom Rapi) */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {/* Kolom 1: Kategori Pasien */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 truncate">
            <User className="w-3.5 h-3.5 text-[#0D5C46]" />
            Kategori
          </span>
          <div className="mt-1 flex items-baseline gap-1.5 min-w-0">
            <span className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
              {activeMode === 'BALITA' ? 'BALITA' : 'IBU HAMIL'}
            </span>
          </div>
          <span className="text-xs text-[#0D5C46] font-bold block mt-0.5 truncate">
            {activeResident ? activeResident.id : '-'}
          </span>
        </div>

        {/* Kolom 2: Umur Pasien */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 truncate">
            <Calendar className="w-3.5 h-3.5 text-[#0D5C46]" />
            Umur Pasien
          </span>
          <div className="mt-1 flex items-baseline gap-1 min-w-0">
            <span className="text-base sm:text-lg font-black text-slate-900">
              {ageValue}
            </span>
            <span className="text-xs font-bold text-slate-600">
              {activeMode === 'BALITA' ? 'Tahun' : 'Minggu'}
            </span>
          </div>
          <span className="text-xs text-slate-600 block mt-0.5 font-medium truncate">
            {activeMode === 'BALITA' ? `${Math.round(ageValue * 12)} Bulan` : `Trimester ${ageValue <= 12 ? '1' : ageValue <= 27 ? '2' : '3'}`}
          </span>
        </div>
      </div>

      {/* Baris 2: Kotak Utama Tinggi & Berat Badan (Spacious 2-Col Grid, Bebas Overflow!) */}
      <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Kotak TB (Tinggi Badan) */}
        <div className="p-4 bg-emerald-50/40 border-2 border-emerald-600/40 rounded-2xl shadow-xs min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-[#0D5C46]" />
              Tinggi Badan
            </span>
            {deltas.hasPrevious && renderDiffBadge(deltas.tbDiff, 'cm')}
          </div>
          
          <div className="mt-2 flex items-baseline gap-1.5 min-w-0">
            <span className="text-3xl sm:text-4xl font-black text-[#0D5C46] tracking-tight">
              {currentMeasurement.tb_cm.toFixed(1)}
            </span>
            <span className="text-sm font-black text-slate-700">cm</span>
          </div>

          <div className="mt-2 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs text-slate-600">
            <span>Standar Normal:</span>
            <strong className="text-slate-900">&ge; {nutritionStatus.tbMinNormal} cm</strong>
          </div>
        </div>

        {/* Kotak BB (Berat Badan) */}
        <div className="p-4 bg-emerald-50/40 border-2 border-emerald-600/40 rounded-2xl shadow-xs min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-[#0D5C46]" />
              Berat Badan
            </span>
            {deltas.hasPrevious && renderDiffBadge(deltas.bbDiff, 'kg')}
          </div>
          
          <div className="mt-2 flex items-baseline gap-1.5 min-w-0">
            <span className="text-3xl sm:text-4xl font-black text-[#0D5C46] tracking-tight">
              {currentMeasurement.bb_kg.toFixed(1)}
            </span>
            <span className="text-sm font-black text-slate-700">kg</span>
          </div>

          <div className="mt-2 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs text-slate-600">
            <span>Indeks Massa (IMT):</span>
            <strong className="text-slate-900">{nutritionStatus.bmi || '-'}</strong>
          </div>
        </div>
      </div>

      {/* Kartu Status Kesehatan (Ramah Lansia: Hijau / Kuning / Merah dengan min-w-0 agar tidak keluar garis) */}
      <div className={`mt-4 p-4 rounded-2xl border-2 transition-all ${nutritionStatus.cardClass}`}>
        <div className="flex items-start gap-3">
          <div className="mt-1 flex-shrink-0">
            {nutritionStatus.status === 'NORMAL' && (
              <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            )}
            {nutritionStatus.status === 'WASPADA' && (
              <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-xs">
                <AlertTriangle className="w-5 h-5" />
              </div>
            )}
            {nutritionStatus.status === 'BAHAYA' && (
              <div className="w-8 h-8 rounded-full bg-red-700 text-white flex items-center justify-center shadow-xs">
                <AlertOctagon className="w-5 h-5" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide ${nutritionStatus.badgeClass}`}>
                {nutritionStatus.status === 'NORMAL' 
                  ? 'KONDISI SEHAT (NORMAL)' 
                  : nutritionStatus.status === 'WASPADA' 
                  ? 'PERLU PERHATIAN (WASPADA)' 
                  : 'PERLU PEMERIKSAAN KHUSUS'}
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 break-words">
                {nutritionStatus.title}
              </span>
            </div>

            <p className="mt-2 text-xs sm:text-sm font-semibold leading-relaxed text-slate-800 break-words">
              {nutritionStatus.summary}
            </p>

            <div className="mt-2.5 pt-2 border-t border-slate-300/60 text-xs sm:text-sm leading-relaxed text-slate-800 bg-white/70 p-3 rounded-xl break-words">
              <strong className="text-slate-900 block mb-0.5">Saran Kader Posyandu:</strong>
              {nutritionStatus.detail}
            </div>
          </div>
        </div>
      </div>

      {/* Opsi Auto-Save Otomatis Real-time (Responsive Wrap) */}
      <div className="mt-4 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-3 h-3 rounded-full bg-emerald-600 animate-pulse flex-shrink-0"></span>
          <div className="min-w-0">
            <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate">
              Simpan Otomatis Saat Ditimbang
            </span>
            <span className="text-[11px] sm:text-xs text-slate-500 block truncate">
              Hasil timbangan langsung otomatis masuk ke catatan tanpa klik simpan
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setAutoSaveOnIot(!autoSaveOnIot)}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border flex-shrink-0 self-start sm:self-auto min-h-[40px] ${
            autoSaveOnIot
              ? 'bg-[#0D5C46] text-white border-[#0D5C46] shadow-xs'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
        >
          {autoSaveOnIot ? '✓ AKTIF (Otomatis)' : 'Manual (Klik Simpan)'}
        </button>
      </div>

      {/* Tombol Simpan Hasil Ukur ke Riwayat */}
      <div className="mt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSavedFeedback || !activeResident}
          className={`w-full inline-flex items-center justify-center gap-2.5 px-4 py-3.5 text-sm sm:text-base font-extrabold rounded-2xl shadow-md transition-all min-h-[52px] ${
            isSavedFeedback
              ? 'bg-emerald-700 text-white'
              : 'bg-[#0D5C46] hover:bg-[#094434] active:scale-[0.98] text-white'
          }`}
        >
          {isSavedFeedback ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              <span>Data Berhasil Tersimpan ke Riwayat Pasien!</span>
            </>
          ) : (
            <>
              <BookmarkCheck className="w-5 h-5 text-emerald-300" />
              <span>Simpan Data Pemeriksaan ke Riwayat</span>
            </>
          )}
        </button>
        <p className="mt-1.5 text-xs text-center text-slate-500">
          Data akan disimpan ke buku catatan posyandu dan memperbarui grafik pertumbuhan anak.
        </p>

        {/* Tombol Pintas ke Menu Riwayat & Grafik */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setActiveTab('HISTORY')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-[#0D5C46] hover:text-[#094434] bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors shadow-2xs"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Lihat Catatan &amp; Grafik Pasien Ini ➔</span>
          </button>
        </div>
      </div>
    </section>
  );
};
