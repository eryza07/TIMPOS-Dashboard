import { supabase, isSupabaseConfigured, isValidUUID } from './supabaseClient';
import { Resident, MeasurementRecord, ResidentCategory } from '../types';
import { 
  getStoredResidents, 
  saveStoredResidents, 
  deleteStoredResident as deleteLocalResident
} from './storageService';


/**
 * Mengambil daftar warga posyandu dari Supabase (atau fallback ke local storage)
 */
export async function getResidentsData(posyanduId?: string): Promise<Resident[]> {
  const localList = getStoredResidents();

  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('residents')
        .select(`
          id,
          name,
          category,
          age_value,
          guardian_name,
          created_at,
          last_measured_date,
          measurements (*)
        `);

      if (posyanduId && isValidUUID(posyanduId)) {
        query = query.eq('posyandu_id', posyanduId);
      }

      const { data: residentsData, error: resErr } = await query.order('name');

      if (resErr) {
        console.warn('[DB] Gagal ambil residents dari Supabase, pakai local:', resErr.message);
      } else if (residentsData) {
        if (residentsData.length > 0) {
          const mapped: Resident[] = residentsData.map((r: any) => ({
            id: r.id,
            name: r.name,
            category: r.category as ResidentCategory,
            ageValue: Number(r.age_value),
            guardianName: r.guardian_name,
            createdAt: r.created_at,
            lastMeasuredDate: r.last_measured_date,
            records: (r.measurements || []).map((m: any) => ({
              id: m.id,
              date: m.date,
              periodLabel: m.period_label,
              ageValue: Number(m.age_value),
              ageLabel: m.age_label,
              tb_cm: Number(m.tb_cm),
              bb_kg: Number(m.bb_kg),
              status: m.status,
              statusNote: m.status_note,
            })).sort((a: MeasurementRecord, b: MeasurementRecord) => new Date(a.date).getTime() - new Date(b.date).getTime()),
          }));

          // Simpan salinan ke localStorage untuk offline cache
          saveStoredResidents(mapped);
          return mapped;
        } else {
          // Supabase belum memiliki data untuk profil ini.
          // JANGAN menimpa localStorage jika di lokal sudah ada data warga!
          // Sinkronkan data warga lokal yang ada ke cloud Supabase.
          if (localList.length > 0) {
            console.info('[DB] Mensinkronkan data warga lokal ke cloud Supabase...');
            for (const item of localList) {
              createResidentRecord(posyanduId, item).catch(() => {});
            }
          }
          return localList;
        }
      }
    } catch (e) {
      console.error('[DB] Exception saat query Supabase:', e);
    }
  }

  return localList;
}

/**
 * Menyimpan warga baru ke Supabase
 */
export async function createResidentRecord(
  posyanduId: string | undefined,
  resident: Resident
): Promise<Resident> {
  if (isSupabaseConfigured && supabase) {
    try {
      const payload: any = {
        id: resident.id,
        name: resident.name,
        category: resident.category,
        age_value: resident.ageValue,
        guardian_name: resident.guardianName,
        created_at: resident.createdAt,
        last_measured_date: resident.lastMeasuredDate,
      };

      if (posyanduId && isValidUUID(posyanduId)) {
        payload.posyandu_id = posyanduId;
      }

      const { error: resErr } = await supabase.from('residents').insert(payload);

      if (resErr) {
        console.error('[DB] Gagal insert warga ke Supabase:', resErr.message, resErr);
      }

      // Masukkan pengukuran perdana jika ada
      if (resident.records && resident.records.length > 0) {
        const rec = resident.records[0];
        await supabase.from('measurements').insert({
          id: rec.id,
          resident_id: resident.id,
          date: rec.date,
          period_label: rec.periodLabel,
          age_value: rec.ageValue,
          age_label: rec.ageLabel,
          tb_cm: rec.tb_cm,
          bb_kg: rec.bb_kg,
          status: rec.status,
          status_note: rec.statusNote,
        });
      }
    } catch (e) {
      console.error('[DB] Exception creating resident in Supabase:', e);
    }
  }

  return resident;
}

/**
 * Menambahkan catatan ukur baru ke Supabase
 */
export async function addMeasurementRecord(
  residentId: string,
  record: MeasurementRecord
): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('measurements').insert({
        id: record.id,
        resident_id: residentId,
        date: record.date,
        period_label: record.periodLabel,
        age_value: record.ageValue,
        age_label: record.ageLabel,
        tb_cm: record.tb_cm,
        bb_kg: record.bb_kg,
        status: record.status,
        status_note: record.statusNote,
      });

      // Update tanggal ukur terakhir di tabel resident
      await supabase
        .from('residents')
        .update({ last_measured_date: record.date, age_value: record.ageValue })
        .eq('id', residentId);
    } catch (e) {
      console.error('[DB] Exception saving measurement to Supabase:', e);
    }
  }
}

/**
 * Menghapus warga dari Supabase & Local
 */
export async function deleteResidentRecord(residentId: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('residents').delete().eq('id', residentId);
    } catch (e) {
      console.error('[DB] Exception deleting resident from Supabase:', e);
    }
  }

  deleteLocalResident(residentId);
}
