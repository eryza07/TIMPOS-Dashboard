import { Resident, MeasurementRecord, ResidentCategory } from '../types';

const STORAGE_KEY = 'timpos_residents_data';

// 5 Data Warga Awal Terstruktur (3 Balita + 2 Ibu Hamil) dengan masing-masing 4 riwayat bulanan
export const INITIAL_RESIDENTS: Resident[] = [
  {
    id: 'BLT-01',
    name: 'Ananda Budi Santoso',
    category: 'BALITA',
    ageValue: 4, // 4 Tahun (48 Bulan)
    guardianName: 'Ny. Siti Rahma',
    createdAt: '2025-09-10',
    lastMeasuredDate: '2026-02-15',
    records: [
      {
        id: 'rec-blt01-1',
        date: '2025-11-15',
        periodLabel: 'Nov 2025',
        ageValue: 3.7,
        ageLabel: '3.7 Thn (44 Bln)',
        tb_cm: 93.8,
        bb_kg: 13.9,
        status: 'NORMAL',
        statusNote: 'Pertumbuhan fisik normal sesuai kurva standar Kemenkes',
      },
      {
        id: 'rec-blt01-2',
        date: '2025-12-15',
        periodLabel: 'Des 2025',
        ageValue: 3.8,
        ageLabel: '3.8 Thn (45 Bln)',
        tb_cm: 95.0,
        bb_kg: 14.1,
        status: 'NORMAL',
        statusNote: 'Kenaikan berat badan stabil, nafsu makan baik',
      },
      {
        id: 'rec-blt01-3',
        date: '2026-01-15',
        periodLabel: 'Jan 2026',
        ageValue: 3.9,
        ageLabel: '3.9 Thn (47 Bln)',
        tb_cm: 96.8,
        bb_kg: 14.4,
        status: 'NORMAL',
        statusNote: 'Tinggi dan berat badan ideal, stimulasi motorik baik',
      },
      {
        id: 'rec-blt01-4',
        date: '2026-02-15',
        periodLabel: 'Feb 2026',
        ageValue: 4.0,
        ageLabel: '4.0 Thn (48 Bln)',
        tb_cm: 98.5,
        bb_kg: 14.8,
        status: 'NORMAL',
        statusNote: 'Status gizi optimal, teruskan pemenuhan protein hewani',
      },
    ],
  },
  {
    id: 'BLT-02',
    name: 'Ananda Siti Aisyah',
    category: 'BALITA',
    ageValue: 2, // 2 Tahun (24 Bulan)
    guardianName: 'Ibu Nurul Hidayah',
    createdAt: '2025-08-01',
    lastMeasuredDate: '2026-02-14',
    records: [
      {
        id: 'rec-blt02-1',
        date: '2025-11-14',
        periodLabel: 'Nov 2025',
        ageValue: 1.7,
        ageLabel: '1.7 Thn (20 Bln)',
        tb_cm: 75.5,
        bb_kg: 8.6,
        status: 'WASPADA',
        statusNote: 'Tinggi badan mendekati batas bawah garis hijau',
      },
      {
        id: 'rec-blt02-2',
        date: '2025-12-14',
        periodLabel: 'Des 2025',
        ageValue: 1.8,
        ageLabel: '1.8 Thn (21 Bln)',
        tb_cm: 77.0,
        bb_kg: 9.0,
        status: 'WASPADA',
        statusNote: 'Kenaikan TB tipis, disarankan pemberian PMT tambahan',
      },
      {
        id: 'rec-blt02-3',
        date: '2026-01-14',
        periodLabel: 'Jan 2026',
        ageValue: 1.9,
        ageLabel: '1.9 Thn (23 Bln)',
        tb_cm: 79.2,
        bb_kg: 9.6,
        status: 'NORMAL',
        statusNote: 'Perkembangan membaik masuk rentang hijau normal',
      },
      {
        id: 'rec-blt02-4',
        date: '2026-02-14',
        periodLabel: 'Feb 2026',
        ageValue: 2.0,
        ageLabel: '2.0 Thn (24 Bln)',
        tb_cm: 81.5,
        bb_kg: 10.3,
        status: 'NORMAL',
        statusNote: 'Tinggi dan berat badan memenuhi standar 2 tahun',
      },
    ],
  },
  {
    id: 'BLT-03',
    name: 'Ananda Kevin Pratama',
    category: 'BALITA',
    ageValue: 1.5, // 1.5 Tahun (18 Bulan)
    guardianName: 'Ibu Dewi Lestari',
    createdAt: '2025-10-05',
    lastMeasuredDate: '2026-02-10',
    records: [
      {
        id: 'rec-blt03-1',
        date: '2025-11-10',
        periodLabel: 'Nov 2025',
        ageValue: 1.2,
        ageLabel: '1.2 Thn (14 Bln)',
        tb_cm: 68.0,
        bb_kg: 7.1,
        status: 'BAHAYA',
        statusNote: 'TB < 70 cm, indikasi risiko stunting dan gizi kurang',
      },
      {
        id: 'rec-blt03-2',
        date: '2025-12-10',
        periodLabel: 'Des 2025',
        ageValue: 1.3,
        ageLabel: '1.3 Thn (15 Bln)',
        tb_cm: 69.8,
        bb_kg: 7.4,
        status: 'BAHAYA',
        statusNote: 'Masih di bawah batas bahaya, diberikan intervensi PMT telur',
      },
      {
        id: 'rec-blt03-3',
        date: '2026-01-10',
        periodLabel: 'Jan 2026',
        ageValue: 1.4,
        ageLabel: '1.4 Thn (17 Bln)',
        tb_cm: 71.5,
        bb_kg: 7.9,
        status: 'WASPADA',
        statusNote: 'Ada tren positif, berat badan naik 500 gram',
      },
      {
        id: 'rec-blt03-4',
        date: '2026-02-10',
        periodLabel: 'Feb 2026',
        ageValue: 1.5,
        ageLabel: '1.5 Thn (18 Bln)',
        tb_cm: 73.5,
        bb_kg: 8.3,
        status: 'WASPADA',
        statusNote: 'Tinggi mendekati garis ambang normal, pantau ketat asupan gizi',
      },
    ],
  },
  {
    id: 'BML-01',
    name: 'Ibu Rina Wardani',
    category: 'IBU_HAMIL',
    ageValue: 28, // Usia kandungan 28 Minggu (Trimester 3)
    guardianName: 'Tn. Hendra Kusuma (Suami)',
    createdAt: '2025-07-20',
    lastMeasuredDate: '2026-02-18',
    records: [
      {
        id: 'rec-bml01-1',
        date: '2025-11-18',
        periodLabel: 'Nov 2025',
        ageValue: 16,
        ageLabel: '16 Minggu (Trim 2)',
        tb_cm: 156.0,
        bb_kg: 53.5,
        status: 'NORMAL',
        statusNote: 'IMT 22.0, kenaikan berat badan normal trimester kedua',
      },
      {
        id: 'rec-bml01-2',
        date: '2025-12-18',
        periodLabel: 'Des 2025',
        ageValue: 20,
        ageLabel: '20 Minggu (Trim 2)',
        tb_cm: 156.0,
        bb_kg: 56.0,
        status: 'NORMAL',
        statusNote: 'Kondisi fisik prima, tinggi fundus sesuai usia gestasi',
      },
      {
        id: 'rec-bml01-3',
        date: '2026-01-18',
        periodLabel: 'Jan 2026',
        ageValue: 24,
        ageLabel: '24 Minggu (Trim 2)',
        tb_cm: 156.0,
        bb_kg: 58.5,
        status: 'NORMAL',
        statusNote: 'Penambahan berat badan teratur, tidak ada edema',
      },
      {
        id: 'rec-bml01-4',
        date: '2026-02-18',
        periodLabel: 'Feb 2026',
        ageValue: 28,
        ageLabel: '28 Minggu (Trim 3)',
        tb_cm: 156.0,
        bb_kg: 61.2,
        status: 'NORMAL',
        statusNote: 'Memasuki Trimester 3 dalam batas ideal, HB dan gizi terkontrol',
      },
    ],
  },
  {
    id: 'BML-02',
    name: 'Ibu Maya Safitri',
    category: 'IBU_HAMIL',
    ageValue: 16, // Usia kandungan 16 Minggu (Trimester 2)
    guardianName: 'Tn. Agus Salim (Suami)',
    createdAt: '2025-09-12',
    lastMeasuredDate: '2026-02-12',
    records: [
      {
        id: 'rec-bml02-1',
        date: '2025-11-12',
        periodLabel: 'Nov 2025',
        ageValue: 8,
        ageLabel: '8 Minggu (Trim 1)',
        tb_cm: 143.5,
        bb_kg: 40.5,
        status: 'BAHAYA',
        statusNote: 'TB < 145 cm (panggul sempit) & BB < 42 kg (risiko KEK)',
      },
      {
        id: 'rec-bml02-2',
        date: '2025-12-12',
        periodLabel: 'Des 2025',
        ageValue: 10,
        ageLabel: '10 Minggu (Trim 1)',
        tb_cm: 143.5,
        bb_kg: 41.2,
        status: 'BAHAYA',
        statusNote: 'Kenaikan lambat akibat emesis gravidarum, butuh biskuit PMT',
      },
      {
        id: 'rec-bml02-3',
        date: '2026-01-12',
        periodLabel: 'Jan 2026',
        ageValue: 12,
        ageLabel: '12 Minggu (Trim 1)',
        tb_cm: 143.5,
        bb_kg: 42.8,
        status: 'WASPADA',
        statusNote: 'Kenaikan BB mulai positif, namun faktor TB tetap butuh pemantauan bidan',
      },
      {
        id: 'rec-bml02-4',
        date: '2026-02-12',
        periodLabel: 'Feb 2026',
        ageValue: 16,
        ageLabel: '16 Minggu (Trim 2)',
        tb_cm: 143.5,
        bb_kg: 44.5,
        status: 'WASPADA',
        statusNote: 'BB naik ke 44.5 kg, pantau rencana persalinan rujukan fasilitas lengkap',
      },
    ],
  },
];

/**
 * Mengambil daftar seluruh warga dari localStorage.
 * Jika belum ada, data default 5 warga awal akan disimpan secara otomatis.
 */
export const getStoredResidents = (): Resident[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RESIDENTS));
      return INITIAL_RESIDENTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RESIDENTS));
      return INITIAL_RESIDENTS;
    }
    return parsed;
  } catch (error) {
    console.warn('Gagal membaca residents dari localStorage, memuat initial data:', error);
    return INITIAL_RESIDENTS;
  }
};

/**
 * Menyimpan seluruh daftar warga ke localStorage.
 */
export const saveStoredResidents = (residents: Resident[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(residents));
  } catch (error) {
    console.error('Gagal menyimpan data warga ke localStorage:', error);
  }
};

/**
 * Menambahkan warga baru ke dalam daftar.
 */
export const addNewResident = (newResidentData: {
  name: string;
  category: ResidentCategory;
  ageValue: number;
  guardianName: string;
  initialTb: number;
  initialBb: number;
}): Resident => {
  const currentList = getStoredResidents();
  
  // Menghasilkan ID unik seperti BLT-04 atau BML-03
  const prefix = newResidentData.category === 'BALITA' ? 'BLT' : 'BML';
  const existingCount = currentList.filter((r) => r.category === newResidentData.category).length;
  const newId = `${prefix}-${String(existingCount + 1).padStart(2, '0')}`;
  
  const today = new Date().toISOString().split('T')[0];
  const ageLabel = newResidentData.category === 'BALITA' 
    ? `${newResidentData.ageValue} Thn` 
    : `${newResidentData.ageValue} Mgg`;

  const initialRecord: MeasurementRecord = {
    id: `rec-${newId.toLowerCase()}-1`,
    date: today,
    periodLabel: 'Pemeriksaan Awal',
    ageValue: newResidentData.ageValue,
    ageLabel: ageLabel,
    tb_cm: newResidentData.initialTb,
    bb_kg: newResidentData.initialBb,
    status: 'NORMAL', // Default status awal akan dikalkulasi ulang oleh engine
    statusNote: 'Pemeriksaan fisik perdana saat pendaftaran warga baru',
  };

  const newResident: Resident = {
    id: newId,
    name: newResidentData.name,
    category: newResidentData.category,
    ageValue: newResidentData.ageValue,
    guardianName: newResidentData.guardianName,
    createdAt: today,
    lastMeasuredDate: today,
    records: [initialRecord],
  };

  const updatedList = [newResident, ...currentList];
  saveStoredResidents(updatedList);
  return newResident;
};

/**
 * Menambahkan riwayat pemeriksaan baru ke seorang warga.
 */
export const appendMeasurementToResident = (
  residentId: string,
  record: Omit<MeasurementRecord, 'id'>
): Resident[] => {
  const currentList = getStoredResidents();
  const updatedList = currentList.map((res) => {
    if (res.id !== residentId) return res;

    const newRecord: MeasurementRecord = {
      ...record,
      id: `rec-${res.id.toLowerCase()}-${res.records.length + 1}-${Date.now()}`,
    };

    return {
      ...res,
      ageValue: record.ageValue,
      lastMeasuredDate: record.date,
      records: [...res.records, newRecord],
    };
  });

  saveStoredResidents(updatedList);
  return updatedList;
};

/**
 * Mereset data warga kembali ke 5 data default awal.
 */
export const resetResidentsToDefault = (): Resident[] => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RESIDENTS));
  return INITIAL_RESIDENTS;
};

/**
 * Menghapus satu warga berdasarkan ID.
 */
export const deleteStoredResident = (residentId: string): Resident[] => {
  const currentList = getStoredResidents();
  const updatedList = currentList.filter((r) => r.id !== residentId);
  saveStoredResidents(updatedList);
  return updatedList;
};

/**
 * Mengosongkan seluruh daftar warga untuk pemakaian riil baru (mulai dari nol).
 */
export const clearAllStoredResidents = (): Resident[] => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  return [];
};

