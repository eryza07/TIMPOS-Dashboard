import { Resident, MeasurementRecord, ResidentCategory } from '../types';

const STORAGE_KEY = 'timpos_residents_data';
const PURGE_FLAG_KEY = 'timpos_clean_purge_v3';

// Data Warga Awal: Bersih / Kosong (Siap diisi data riil dari Supabase / Kader Posyandu)
export const INITIAL_RESIDENTS: Resident[] = [];

/**
 * Mengambil daftar seluruh warga dari localStorage.
 */
export const getStoredResidents = (): Resident[] => {
  try {
    // 1. Auto-purge: Bersihkan cache demo lama di browser jika belum pernah dibersihkan
    if (!localStorage.getItem(PURGE_FLAG_KEY)) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('timpos_local_auth_user');
      localStorage.removeItem('timpos_local_auth_profile');
      localStorage.setItem(PURGE_FLAG_KEY, 'true');
      return [];
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    // 2. Deteksi jika masih ada nama-nama warga demo bawaan lama, hapus otomatis
    const hasOldDemo = parsed.some((r: any) => 
      r.name === 'Ahmad Fauzan' || 
      r.name === 'Siti Aisyah' || 
      r.name === 'Kenzo Alfarezel' || 
      r.name === 'Ibu Dewi Lestari' ||
      r.name === 'Ibu Rina Anggraini'
    );
    if (hasOldDemo) {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }

    return parsed;
  } catch (error) {
    console.warn('Gagal membaca data warga dari localStorage:', error);
    return [];
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
  
  // Menghasilkan ID unik seperti BLT-01 atau BML-01
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
    status: 'NORMAL',
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
 * Menambahkan daftar warga secara massal (Bulk Import dari Excel / CSV).
 */
export const bulkAddStoredResidents = (newResidentsData: {
  name: string;
  category: ResidentCategory;
  ageValue: number;
  guardianName: string;
  initialTb: number;
  initialBb: number;
}[]): Resident[] => {
  const currentList = getStoredResidents();
  const today = new Date().toISOString().split('T')[0];

  const addedList: Resident[] = [];
  let existingBalitaCount = currentList.filter((r) => r.category === 'BALITA').length;
  let existingIbuCount = currentList.filter((r) => r.category === 'IBU_HAMIL').length;

  for (const item of newResidentsData) {
    const isBalita = item.category === 'BALITA';
    const prefix = isBalita ? 'BLT' : 'BML';
    if (isBalita) {
      existingBalitaCount++;
    } else {
      existingIbuCount++;
    }
    const count = isBalita ? existingBalitaCount : existingIbuCount;
    const newId = `${prefix}-${String(count).padStart(2, '0')}`;

    const ageLabel = isBalita ? `${item.ageValue} Thn` : `${item.ageValue} Mgg`;
    const initialRecord: MeasurementRecord = {
      id: `rec-${newId.toLowerCase()}-1`,
      date: today,
      periodLabel: 'Pemeriksaan Awal',
      ageValue: item.ageValue,
      ageLabel: ageLabel,
      tb_cm: item.initialTb,
      bb_kg: item.initialBb,
      status: 'NORMAL',
      statusNote: 'Import dari file Excel/CSV data posyandu',
    };

    const newResident: Resident = {
      id: newId,
      name: item.name,
      category: item.category,
      ageValue: item.ageValue,
      guardianName: item.guardianName,
      createdAt: today,
      lastMeasuredDate: today,
      records: [initialRecord],
    };

    addedList.push(newResident);
  }

  const updatedList = [...addedList, ...currentList];
  saveStoredResidents(updatedList);
  return addedList;
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
 * Mereset data warga kembali ke kondisi kosong bersih.
 */
export const resetResidentsToDefault = (): Resident[] => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  return [];
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
