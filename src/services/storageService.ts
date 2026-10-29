import { Resident, MeasurementRecord, ResidentCategory } from '../types';

const STORAGE_KEY = 'timpos_residents_data';
const PURGE_FLAG_KEY = 'timpos_clean_purge_v3';

// Data Warga Awal: Bersih / Kosong (Siap diisi data riil dari Supabase / Kader Posyandu)
export const INITIAL_RESIDENTS: Resident[] = [];

/**
 * Membersihkan data duplikat secara otomatis (baik warga kembar maupun riwayat ukur kembar)
 */
export function deduplicateResidents(list: Resident[]): Resident[] {
  if (!Array.isArray(list) || list.length === 0) return [];

  const seenIds = new Set<string>();
  const seenTwinKeys = new Set<string>();
  const cleaned: Resident[] = [];

  for (const resident of list) {
    if (!resident || !resident.id) continue;

    // 1. Cek duplikasi berdasarkan ID
    if (seenIds.has(resident.id)) {
      continue;
    }

    // 2. Cek duplikasi warga kembar (nama sama, kategori sama, wali sama)
    const normalizedName = (resident.name || '').trim().toLowerCase();
    const normalizedGuardian = (resident.guardianName || '').trim().toLowerCase();
    const twinKey = `${normalizedName}|${resident.category}|${normalizedGuardian}`;

    if (seenTwinKeys.has(twinKey)) {
      continue;
    }

    seenIds.add(resident.id);
    seenTwinKeys.add(twinKey);

    // 3. Bersihkan duplikasi di dalam array records pengukuran warga ini
    const cleanedRecords: MeasurementRecord[] = [];
    const seenRecordKeys = new Set<string>();

    for (const rec of (resident.records || [])) {
      if (!rec) continue;
      const recKey = `${rec.date}|${rec.tb_cm}|${rec.bb_kg}|${rec.periodLabel || ''}`;
      if (!seenRecordKeys.has(recKey)) {
        seenRecordKeys.add(recKey);
        cleanedRecords.push(rec);
      }
    }

    cleaned.push({
      ...resident,
      records: cleanedRecords,
    });
  }

  return cleaned;
}

/**
 * Mengambil daftar seluruh warga dari localStorage dengan auto-deduplikasi.
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

    // 2. Bersihkan otomatis jika ada sisa data ganda/duplikat
    const deduped = deduplicateResidents(parsed);
    if (deduped.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped));
    }

    return deduped;
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
    const deduped = deduplicateResidents(residents);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped));
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

  // Cegah penambahan ganda jika warga dengan nama & wali yang sama persis sudah ada
  const trimmedName = newResidentData.name.trim().toLowerCase();
  const trimmedGuardian = newResidentData.guardianName.trim().toLowerCase();
  const existingTwin = currentList.find(
    (r) =>
      r.category === newResidentData.category &&
      r.name.trim().toLowerCase() === trimmedName &&
      r.guardianName.trim().toLowerCase() === trimmedGuardian
  );
  if (existingTwin) {
    console.warn('[Storage] Warga kembar terdeteksi, menggunakan entri yang sudah ada:', existingTwin.id);
    return existingTwin;
  }
  
  // Menghasilkan ID unik seperti BLT-01 atau BML-01 berdasarkan angka maksimum yang ada
  const prefix = newResidentData.category === 'BALITA' ? 'BLT' : 'BML';
  const existingNums = currentList
    .filter((r) => r.category === newResidentData.category && r.id.startsWith(prefix))
    .map((r) => {
      const match = r.id.match(new RegExp(`^${prefix}-(\\d+)`));
      return match ? parseInt(match[1], 10) : 0;
    });
  const nextNum = existingNums.length > 0 ? Math.max(...existingNums, 0) + 1 : 1;
  const newId = `${prefix}-${String(nextNum).padStart(2, '0')}`;
  
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
    name: newResidentData.name.trim(),
    category: newResidentData.category,
    ageValue: newResidentData.ageValue,
    guardianName: newResidentData.guardianName.trim(),
    createdAt: today,
    lastMeasuredDate: today,
    records: [initialRecord],
  };

  const updatedList = deduplicateResidents([newResident, ...currentList]);
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
  const balitaNums = currentList
    .filter((r) => r.category === 'BALITA' && r.id.startsWith('BLT'))
    .map((r) => {
      const match = r.id.match(/^BLT-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
  let nextBalitaNum = balitaNums.length > 0 ? Math.max(...balitaNums, 0) + 1 : 1;

  const ibuNums = currentList
    .filter((r) => r.category === 'IBU_HAMIL' && r.id.startsWith('BML'))
    .map((r) => {
      const match = r.id.match(/^BML-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
  let nextIbuNum = ibuNums.length > 0 ? Math.max(...ibuNums, 0) + 1 : 1;

  for (const item of newResidentsData) {
    const isBalita = item.category === 'BALITA';
    const prefix = isBalita ? 'BLT' : 'BML';
    const num = isBalita ? nextBalitaNum++ : nextIbuNum++;
    const newId = `${prefix}-${String(num).padStart(2, '0')}`;

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
      name: item.name.trim(),
      category: item.category,
      ageValue: item.ageValue,
      guardianName: item.guardianName.trim(),
      createdAt: today,
      lastMeasuredDate: today,
      records: [initialRecord],
    };

    addedList.push(newResident);
  }

  const updatedList = deduplicateResidents([...addedList, ...currentList]);
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

    // Cek apakah rekaman ukur dengan tanggal & hasil ukur yang sama persis sudah ada
    const isDuplicateRec = res.records.some(
      (r) => r.date === record.date && r.tb_cm === record.tb_cm && r.bb_kg === record.bb_kg
    );
    if (isDuplicateRec) {
      return res;
    }

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
  if (!residentId) return getStoredResidents();
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
