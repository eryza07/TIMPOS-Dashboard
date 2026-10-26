import { ResidentCategory, NutritionEvaluation } from '../types';

interface BalitaBenchmark {
  ageYears: number;
  tbMinNormal: number;
  tbDangerLimit: number;
  bbMinNormal: number;
  bbMaxNormal: number;
  bbDangerLimit: number;
}

const BALITA_BENCHMARKS: BalitaBenchmark[] = [
  { ageYears: 0.5, tbMinNormal: 63.0, tbDangerLimit: 61.0, bbMinNormal: 6.4, bbMaxNormal: 9.2, bbDangerLimit: 5.7 },
  { ageYears: 1.0, tbMinNormal: 71.0, tbDangerLimit: 68.5, bbMinNormal: 7.7, bbMaxNormal: 11.5, bbDangerLimit: 6.9 },
  { ageYears: 1.5, tbMinNormal: 76.5, tbDangerLimit: 74.0, bbMinNormal: 8.8, bbMaxNormal: 13.0, bbDangerLimit: 7.8 },
  { ageYears: 2.0, tbMinNormal: 81.0, tbDangerLimit: 78.0, bbMinNormal: 9.7, bbMaxNormal: 14.5, bbDangerLimit: 8.6 },
  { ageYears: 3.0, tbMinNormal: 88.5, tbDangerLimit: 85.0, bbMinNormal: 11.3, bbMaxNormal: 16.8, bbDangerLimit: 10.0 },
  { ageYears: 4.0, tbMinNormal: 95.0, tbDangerLimit: 91.0, bbMinNormal: 12.7, bbMaxNormal: 18.5, bbDangerLimit: 11.2 },
  { ageYears: 5.0, tbMinNormal: 101.0, tbDangerLimit: 96.5, bbMinNormal: 14.1, bbMaxNormal: 21.0, bbDangerLimit: 12.4 },
];

/**
 * Melakukan interpolasi linier acuan balita berdasarkan umur tahun
 */
export const getBalitaThresholds = (ageYears: number): BalitaBenchmark => {
  const clampedAge = Math.max(0.5, Math.min(5.0, ageYears));

  // Jika persis di tabel
  const exact = BALITA_BENCHMARKS.find((b) => b.ageYears === clampedAge);
  if (exact) return exact;

  // Cari dua titik untuk interpolasi
  let lower = BALITA_BENCHMARKS[0];
  let upper = BALITA_BENCHMARKS[BALITA_BENCHMARKS.length - 1];

  for (let i = 0; i < BALITA_BENCHMARKS.length - 1; i++) {
    if (clampedAge >= BALITA_BENCHMARKS[i].ageYears && clampedAge <= BALITA_BENCHMARKS[i + 1].ageYears) {
      lower = BALITA_BENCHMARKS[i];
      upper = BALITA_BENCHMARKS[i + 1];
      break;
    }
  }

  const factor = (clampedAge - lower.ageYears) / (upper.ageYears - lower.ageYears);
  const interpolate = (start: number, end: number) => Number((start + (end - start) * factor).toFixed(1));

  return {
    ageYears: clampedAge,
    tbMinNormal: interpolate(lower.tbMinNormal, upper.tbMinNormal),
    tbDangerLimit: interpolate(lower.tbDangerLimit, upper.tbDangerLimit),
    bbMinNormal: interpolate(lower.bbMinNormal, upper.bbMinNormal),
    bbMaxNormal: interpolate(lower.bbMaxNormal, upper.bbMaxNormal),
    bbDangerLimit: interpolate(lower.bbDangerLimit, upper.bbDangerLimit),
  };
};

/**
 * Menghitung batas acuan kehamilan berdasarkan usia gestasi (Minggu)
 */
export const getPregnancyThresholds = (weeks: number) => {
  const tbMinSafe = 145.0; // Batas risiko panggul sempit standar Kemenkes
  let trimester = 1;
  let bbMinIdeal = 45.0;
  let bbMaxIdeal = 72.0;
  let bbDangerKek = 42.0;

  if (weeks <= 12) {
    trimester = 1;
    bbMinIdeal = 45.0;
    bbMaxIdeal = 72.0;
    bbDangerKek = 42.0;
  } else if (weeks <= 27) {
    trimester = 2;
    bbMinIdeal = 47.0;
    bbMaxIdeal = 76.0;
    bbDangerKek = 44.0;
  } else {
    trimester = 3;
    bbMinIdeal = 50.0;
    bbMaxIdeal = 80.0;
    bbDangerKek = 46.0;
  }

  return {
    trimester,
    tbMinNormal: tbMinSafe,
    tbDangerLimit: 145.0,
    bbMinNormal: bbMinIdeal,
    bbMaxNormal: bbMaxIdeal,
    bbDangerLimit: bbDangerKek,
  };
};

/**
 * Menghitung Indeks Massa Tubuh (IMT / BMI)
 * Rumus: BB (kg) / ((TB (cm) / 100) ^ 2)
 */
export const calculateBmi = (tb_cm: number, bb_kg: number): number => {
  if (tb_cm <= 0 || bb_kg <= 0) return 0;
  const heightM = tb_cm / 100;
  const bmi = bb_kg / (heightM * heightM);
  return Number(bmi.toFixed(1));
};

/**
 * Engine Utama Evaluasi Status Gizi & Kehamilan Standar Kemenkes RI
 */
export const evaluateNutritionStatus = (
  mode: ResidentCategory,
  ageValue: number,
  tb_cm: number,
  bb_kg: number
): NutritionEvaluation => {
  const bmi = calculateBmi(tb_cm, bb_kg);

  // Default fallback jika nilai belum valid
  if (tb_cm <= 0 || bb_kg <= 0) {
    return {
      status: 'NORMAL',
      title: 'Menunggu Pengukuran Alat IoT',
      summary: 'Silakan posisikan pasien di timbangan dan alat ukur tinggi digital.',
      detail: 'Data hasil ukur akan otomatis dihitung begitu sinyal diterima dari alat fisik.',
      badgeClass: 'bg-slate-600 text-white',
      cardClass: 'bg-slate-100 text-slate-800 border-slate-300',
      borderClass: 'border-slate-300',
      bmi: 0,
      tbMinNormal: 0,
      tbDangerLimit: 0,
      bbMinNormal: 0,
      bbMaxNormal: 0,
      bbDangerLimit: 0,
    };
  }

  // ==========================================
  // 1. EVALUASI MODE BALITA
  // ==========================================
  if (mode === 'BALITA') {
    const limits = getBalitaThresholds(ageValue);

    const isStuntingDanger = tb_cm < limits.tbDangerLimit;
    const isWastingDanger = bb_kg < limits.bbDangerLimit;
    const isTbWarning = tb_cm < limits.tbMinNormal;
    const isBbWarningLow = bb_kg < limits.bbMinNormal;
    const isBbWarningHigh = bb_kg > limits.bbMaxNormal;

    // KATEGORI BAHAYA (MERAH)
    if (isStuntingDanger || isWastingDanger) {
      const dangerReasons: string[] = [];
      if (isStuntingDanger) dangerReasons.push(`TB (${tb_cm} cm) di bawah batas bahaya stunting (${limits.tbDangerLimit} cm)`);
      if (isWastingDanger) dangerReasons.push(`BB (${bb_kg} kg) di bawah batas gizi buruk (${limits.bbDangerLimit} kg)`);

      return {
        status: 'BAHAYA',
        title: isStuntingDanger ? 'Indikasi Stunting / Gizi Sangat Kurang' : 'Indikasi Gizi Buruk / Wasting',
        summary: `Perhatian Serius: ${dangerReasons.join(' dan ')}.`,
        detail: 'Segera lakukan rujukan ke Puskesmas/Dokter Anak. Berikan edukasi pemberian Makanan Tambahan (PMT) tinggi protein hewani (telur, ikan, daging) dan pantau berkala tiap minggu.',
        badgeClass: 'bg-red-800 text-white',
        cardClass: 'bg-red-100 text-red-900 border-red-400',
        borderClass: 'border-red-500',
        bmi,
        ...limits,
      };
    }

    // KATEGORI WASPADA (KUNING)
    if (isTbWarning || isBbWarningLow || isBbWarningHigh) {
      let warningReason = '';
      if (isTbWarning && isBbWarningLow) {
        warningReason = `Tinggi dan Berat badan balita sedikit di bawah garis normal (Normal min: TB ${limits.tbMinNormal} cm, BB ${limits.bbMinNormal} kg).`;
      } else if (isTbWarning) {
        warningReason = `Tinggi badan balita (${tb_cm} cm) sedikit di bawah standar minimum (${limits.tbMinNormal} cm). Risiko perawakan pendek.`;
      } else if (isBbWarningLow) {
        warningReason = `Berat badan balita (${bb_kg} kg) di bawah standar minimum (${limits.bbMinNormal} kg). Waspada tren gizi kurang.`;
      } else {
        warningReason = `Berat badan balita (${bb_kg} kg) melebihi batas atas normal (${limits.bbMaxNormal} kg). Waspada risiko obesitas anak.`;
      }

      return {
        status: 'WASPADA',
        title: isBbWarningHigh ? 'Waspada Risiko Gizi Lebih (Overweight)' : 'Waspada Potensi Gizi Kurang',
        summary: warningReason,
        detail: 'Perlu pemantauan intensif di Posyandu bulan depan. Tingkatkan variasi menu MP-ASI seimbang dan konsultasikan jadwal imunisasi serta vitamin A.',
        badgeClass: 'bg-amber-700 text-white',
        cardClass: 'bg-amber-100 text-amber-900 border-amber-400',
        borderClass: 'border-amber-500',
        bmi,
        ...limits,
      };
    }

    // KATEGORI NORMAL (HIJAU)
    return {
      status: 'NORMAL',
      title: 'Status Gizi Baik & Pertumbuhan Normal',
      summary: `Tinggi Badan (${tb_cm} cm) dan Berat Badan (${bb_kg} kg) berada di dalam kurva hijau standar Kemenkes RI untuk usia ${ageValue} tahun.`,
      detail: 'Pertumbuhan optimal. Lanjutkan pola asuh nutrisi seimbang, ASI lanjutan jika masih usia < 2 tahun, dan stimulasi tumbuh kembang aktif.',
      badgeClass: 'bg-green-800 text-white',
      cardClass: 'bg-green-100 text-green-900 border-green-400',
      borderClass: 'border-green-500',
      bmi,
      ...limits,
    };
  }

  // ==========================================
  // 2. EVALUASI MODE IBU HAMIL
  // ==========================================
  const limits = getPregnancyThresholds(ageValue);
  const isPelvisDanger = tb_cm < limits.tbDangerLimit;
  const isKekWeightDanger = bb_kg < limits.bbDangerLimit;
  const isBmiKekDanger = bmi < 18.5;
  const isBmiObeseWarning = bmi > 28.5;
  const isWeightWarningHigh = bb_kg > limits.bbMaxNormal;
  const isWeightWarningLow = bb_kg < limits.bbMinNormal && !isKekWeightDanger;

  // KATEGORI BAHAYA (MERAH)
  if (isPelvisDanger || isKekWeightDanger || isBmiKekDanger) {
    const dangerReasons: string[] = [];
    if (isPelvisDanger) dangerReasons.push(`TB (${tb_cm} cm < 145 cm) risiko tinggi panggul sempit (CPD)`);
    if (isKekWeightDanger || isBmiKekDanger) dangerReasons.push(`BB (${bb_kg} kg) / IMT (${bmi}) di bawah ambang batas bahaya KEK`);

    return {
      status: 'BAHAYA',
      title: isPelvisDanger ? 'Bahaya Risiko Panggul Sempit / KEK' : 'Bahaya Kurang Energi Kronis (KEK)',
      summary: `Peringatan Klinis: ${dangerReasons.join(' & ')}.`,
      detail: 'Wajib mendapatkan pemeriksaan USG dan rujukan ke dokter spesialis kandungan (SpOG). Salurkan biskuit PMT Ibu Hamil Kemenkes, suplemen zat besi (Fe), dan pantau tekanan darah secara berkala.',
      badgeClass: 'bg-red-800 text-white',
      cardClass: 'bg-red-100 text-red-900 border-red-400',
      borderClass: 'border-red-500',
      bmi,
      ...limits,
    };
  }

  // KATEGORI WASPADA (KUNING)
  if (isBmiObeseWarning || isWeightWarningHigh || isWeightWarningLow) {
    let warningReason = '';
    if (isBmiObeseWarning || isWeightWarningHigh) {
      warningReason = `Kenaikan berat badan berlebih (BB: ${bb_kg} kg, IMT: ${bmi} > 28.5). Waspada diabetes gestasional dan risiko pre-eklampsia.`;
    } else {
      warningReason = `Berat badan ibu hamil (${bb_kg} kg) sedikit di bawah rentang rekomendasi trimester ${limits.trimester} (${limits.bbMinNormal} - ${limits.bbMaxNormal} kg).`;
    }

    return {
      status: 'WASPADA',
      title: isBmiObeseWarning ? 'Waspada Obesitas Kehamilan & Pre-Eklampsia' : 'Waspada Kenaikan Berat Badan Lambat',
      summary: warningReason,
      detail: 'Pantau tekanan darah dan pemeriksaan urin (proteinuria). Anjurkan konsultasi pola makan sehat dengan gizi seimbang, kurangi asupan gula dan garam berlebih.',
      badgeClass: 'bg-amber-700 text-white',
      cardClass: 'bg-amber-100 text-amber-900 border-amber-400',
      borderClass: 'border-amber-500',
      bmi,
      ...limits,
    };
  }

  // KATEGORI NORMAL (HIJAU)
  return {
    status: 'NORMAL',
    title: 'Kondisi Fisik & Kehamilan Ideal',
    summary: `Tinggi Badan (${tb_cm} cm $\\ge$ 145 cm), Berat Badan (${bb_kg} kg), dan IMT (${bmi}) berada pada rentang ideal Trimester ${limits.trimester} (Minggu ke-${ageValue}).`,
    detail: 'Kondisi kesehatan ibu dan janin terpantau optimal. Lanjutkan konsumsi tablet tambah darah (TTD), asam folat, kalsium, dan olahraga prenatal ringan.',
    badgeClass: 'bg-green-800 text-white',
    cardClass: 'bg-green-100 text-green-900 border-green-400',
    borderClass: 'border-green-500',
    bmi,
    ...limits,
  };
};
