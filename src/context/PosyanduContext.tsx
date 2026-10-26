import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Resident, 
  ResidentCategory, 
  MqttConfig, 
  MqttConnectionStatus, 
  CurrentMeasurement, 
  NutritionEvaluation,
  MeasurementRecord
} from '../types';
import { 
  getStoredResidents, 
  addNewResident as addStoredResident, 
  appendMeasurementToResident, 
  resetResidentsToDefault as resetStoredResidents,
  deleteStoredResident,
  clearAllStoredResidents
} from '../services/storageService';
import { 
  getResidentsData, 
  createResidentRecord, 
  addMeasurementRecord, 
  deleteResidentRecord 
} from '../services/supabaseDatabase';
import { useAuth } from './AuthContext';
import { evaluateNutritionStatus } from '../services/nutritionEngine';
import { mqttService } from '../services/mqttService';

export type ActiveMenuTab = 'MEASUREMENT' | 'HISTORY' | 'RESIDENTS' | 'AI_CONSULTATION';

interface PosyanduContextType {
  activeTab: ActiveMenuTab;
  setActiveTab: (tab: ActiveMenuTab) => void;
  residents: Resident[];
  activeResident: Resident | null;
  activeResidentId: string;
  setActiveResidentId: (id: string) => void;
  activeMode: ResidentCategory;
  setActiveMode: (mode: ResidentCategory) => void;
  ageValue: number;
  setAgeValue: (age: number) => void;
  currentMeasurement: CurrentMeasurement;
  setCurrentMeasurement: React.Dispatch<React.SetStateAction<CurrentMeasurement>>;
  nutritionStatus: NutritionEvaluation;
  mqttConfig: MqttConfig;
  mqttStatus: MqttConnectionStatus;
  updateMqttConfig: (newConfig: MqttConfig) => void;
  publishSetMode: (mode: ResidentCategory) => boolean;
  publishRemoteMeasure: () => boolean;
  saveCurrentMeasurementToResident: () => void;
  addNewResident: (data: {
    name: string;
    category: ResidentCategory;
    ageValue: number;
    guardianName: string;
    initialTb: number;
    initialBb: number;
  }) => Resident;
  resetToDefaultData: () => void;
  deleteResident: (id: string) => void;
  clearAllResidents: () => void;
  simulateMeasurement: (type: 'NORMAL' | 'WASPADA' | 'BAHAYA') => void;
  chartMetric: 'BB' | 'TB';
  setChartMetric: (metric: 'BB' | 'TB') => void;
  lastActionMessage: string | null;
}

const PosyanduContext = createContext<PosyanduContextType | undefined>(undefined);

export const PosyanduProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();

  // 1. Data residents
  const [residents, setResidents] = useState<Resident[]>(() => getStoredResidents());
  const [activeResidentId, setActiveResidentIdState] = useState<string>(() => {
    return residents[0]?.id || 'BLT-01';
  });

  // Sinkronisasi data warga dari Supabase / Profil Posyandu
  useEffect(() => {
    if (profile?.id) {
      getResidentsData(profile.id).then((loaded) => {
        setResidents(loaded);
        if (loaded.length > 0) {
          setActiveResidentIdState((prev) => loaded.some((r) => r.id === prev) ? prev : loaded[0].id);
        } else {
          setActiveResidentIdState('');
        }
      });
    }
  }, [profile?.id]);

  const activeResident = useMemo(() => {
    return residents.find((r) => r.id === activeResidentId) || residents[0] || null;
  }, [residents, activeResidentId]);

  // 2. Active Mode & Age
  const [activeMode, setActiveModeState] = useState<ResidentCategory>(() => {
    return activeResident?.category || 'BALITA';
  });

  const [ageValue, setAgeValue] = useState<number>(() => {
    return activeResident?.ageValue || (activeMode === 'BALITA' ? 4 : 28);
  });

  // 3. Current Measurement
  const [currentMeasurement, setCurrentMeasurement] = useState<CurrentMeasurement>(() => {
    const latestRec = activeResident?.records[activeResident.records.length - 1];
    return {
      mode: activeResident?.category || 'BALITA',
      ageValue: activeResident?.ageValue || 4,
      tb_cm: latestRec?.tb_cm || 98.5,
      bb_kg: latestRec?.bb_kg || 14.8,
      source: 'IOT',
      lastUpdated: new Date().toLocaleTimeString('id-ID'),
    };
  });

  // 4. MQTT State
  const [mqttConfig, setMqttConfig] = useState<MqttConfig>(() => {
    try {
      const saved = localStorage.getItem('timpos_mqtt_config');
      return saved ? JSON.parse(saved) : mqttService.getConfig();
    } catch {
      return mqttService.getConfig();
    }
  });

  const [mqttStatus, setMqttStatus] = useState<MqttConnectionStatus>('disconnected');
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);
  const [chartMetric, setChartMetric] = useState<'BB' | 'TB'>('BB');
  const [activeTab, setActiveTab] = useState<ActiveMenuTab>('MEASUREMENT');

  // Trigger feedback notification
  const showActionToast = (msg: string) => {
    setLastActionMessage(msg);
    setTimeout(() => {
      setLastActionMessage(null);
    }, 3500);
  };

  // 5. Inisialisasi Koneksi MQTT & Listeners
  useEffect(() => {
    mqttService.connect(mqttConfig);

    const unsubStatus = mqttService.onStatusChange((status) => {
      setMqttStatus(status);
    });

    const unsubData = mqttService.onData((inboundData) => {
      console.info('[Dashboard] Inbound IoT Data received:', inboundData);
      
      setCurrentMeasurement((prev) => ({
        ...prev,
        mode: inboundData.mode,
        tb_cm: inboundData.tb_cm,
        bb_kg: inboundData.bb_kg,
        source: 'IOT',
        lastUpdated: new Date().toLocaleTimeString('id-ID'),
      }));

      // Sinkronkan mode jika data IoT menyertakan mode
      if (inboundData.mode) {
        setActiveModeState(inboundData.mode);
      }

      showActionToast(`Data diterima dari ${inboundData.device_id}: TB ${inboundData.tb_cm} cm, BB ${inboundData.bb_kg} kg`);
    });

    return () => {
      unsubStatus();
      unsubData();
      mqttService.disconnect();
    };
  }, [mqttConfig]);

  // 6. Ganti Warga yang Sedang Diperiksa
  const setActiveResidentId = useCallback((id: string) => {
    setActiveResidentIdState(id);
    const target = residents.find((r) => r.id === id);
    if (target) {
      setActiveModeState(target.category);
      setAgeValue(target.ageValue);

      const latestRec = target.records[target.records.length - 1];
      if (latestRec) {
        setCurrentMeasurement({
          mode: target.category,
          ageValue: target.ageValue,
          tb_cm: latestRec.tb_cm,
          bb_kg: latestRec.bb_kg,
          source: 'MANUAL',
          lastUpdated: new Date().toLocaleTimeString('id-ID'),
        });
      }

      // Kirim sinyal SET_MODE ke IoT agar LCD ESP32 berubah sesuai warga yang dipilih
      mqttService.publishSetMode(target.category);
      showActionToast(`Pemeriksaan dialihkan ke: ${target.name} (${target.id})`);
    }
  }, [residents]);

  // 7. Ganti Mode Pemeriksaan & Publish ke Wokwi
  const setActiveMode = useCallback((newMode: ResidentCategory) => {
    setActiveModeState(newMode);
    
    // Sesuaikan default umur jika berganti kategori
    if (newMode === 'BALITA' && (ageValue > 5 || ageValue < 0.5)) {
      setAgeValue(2);
    } else if (newMode === 'IBU_HAMIL' && ageValue < 4) {
      setAgeValue(24);
    }

    // Publish ke MQTT
    const success = mqttService.publishSetMode(newMode);
    if (success) {
      showActionToast(`Mode IoT disetel ke: ${newMode}`);
    }
  }, [ageValue]);

  // 8. Update MQTT Config
  const updateMqttConfig = useCallback((newConfig: MqttConfig) => {
    setMqttConfig(newConfig);
    try {
      localStorage.setItem('timpos_mqtt_config', JSON.stringify(newConfig));
    } catch (e) {
      console.error(e);
    }
    mqttService.connect(newConfig);
    showActionToast('Pengaturan MQTT berhasil diperbarui');
  }, []);

  // 9. Publish Remote Measure Command
  const publishRemoteMeasure = useCallback((): boolean => {
    const success = mqttService.publishRemoteMeasure();
    if (success) {
      showActionToast('Perintah REMOTE_MEASURE terkirim ke ESP32 Wokwi...');
    } else {
      showActionToast('Koneksi MQTT belum aktif. Menggunakan mode simulasi internal.');
    }
    return success;
  }, []);

  // 10. Publish Set Mode explicit
  const publishSetMode = useCallback((mode: ResidentCategory): boolean => {
    return mqttService.publishSetMode(mode);
  }, []);

  // 11. Perhitungan Status Gizi Otomatis Reaktif
  const nutritionStatus = useMemo(() => {
    return evaluateNutritionStatus(
      activeMode,
      ageValue,
      currentMeasurement.tb_cm,
      currentMeasurement.bb_kg
    );
  }, [activeMode, ageValue, currentMeasurement.tb_cm, currentMeasurement.bb_kg]);

  // 12. Simpan Hasil Ukur ke Riwayat Warga
  const saveCurrentMeasurementToResident = useCallback(() => {
    if (!activeResident) return;

    const today = new Date().toISOString().split('T')[0];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const now = new Date();
    const periodLabel = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
    const ageLabel = activeMode === 'BALITA' ? `${ageValue} Thn` : `${ageValue} Mgg`;

    const newRecord: Omit<MeasurementRecord, 'id'> = {
      date: today,
      periodLabel: periodLabel,
      ageValue: ageValue,
      ageLabel: ageLabel,
      tb_cm: currentMeasurement.tb_cm,
      bb_kg: currentMeasurement.bb_kg,
      status: nutritionStatus.status,
      statusNote: `${nutritionStatus.title}. ${nutritionStatus.summary}`,
    };

    const updated = appendMeasurementToResident(activeResident.id, newRecord);
    const recordWithId: MeasurementRecord = {
      ...newRecord,
      id: `rec-${activeResident.id.toLowerCase()}-${activeResident.records.length + 1}-${Date.now()}`,
    };
    addMeasurementRecord(activeResident.id, recordWithId);
    setResidents(updated);
    showActionToast(`Hasil ukur berhasil disimpan ke database riwayat ${activeResident.name}!`);
  }, [activeResident, activeMode, ageValue, currentMeasurement, nutritionStatus]);

  // 13. Tambah Warga Baru
  const addNewResident = useCallback((data: {
    name: string;
    category: ResidentCategory;
    ageValue: number;
    guardianName: string;
    initialTb: number;
    initialBb: number;
  }) => {
    const created = addStoredResident(data);
    createResidentRecord(profile?.id, created);
    const refreshed = getStoredResidents();
    setResidents(refreshed);
    setActiveResidentIdState(created.id);
    setActiveModeState(created.category);
    setAgeValue(created.ageValue);
    setCurrentMeasurement({
      mode: created.category,
      ageValue: created.ageValue,
      tb_cm: data.initialTb,
      bb_kg: data.initialBb,
      source: 'MANUAL',
      lastUpdated: new Date().toLocaleTimeString('id-ID'),
    });
    showActionToast(`Warga baru ${created.name} (${created.id}) berhasil didaftarkan!`);
    return created;
  }, []);

  // 14. Reset Data ke Default
  const resetToDefaultData = useCallback(() => {
    const defaults = resetStoredResidents();
    setResidents(defaults);
    if (defaults[0]) {
      setActiveResidentIdState(defaults[0].id);
      setActiveModeState(defaults[0].category);
      setAgeValue(defaults[0].ageValue);
      const rec = defaults[0].records[defaults[0].records.length - 1];
      setCurrentMeasurement({
        mode: defaults[0].category,
        ageValue: defaults[0].ageValue,
        tb_cm: rec?.tb_cm || 98.5,
        bb_kg: rec?.bb_kg || 14.8,
        source: 'MANUAL',
        lastUpdated: new Date().toLocaleTimeString('id-ID'),
      });
    }
    showActionToast('Data warga direset ke 5 data default Posyandu');
  }, []);

  // 15. Hapus Satu Warga
  const deleteResident = useCallback((id: string) => {
    deleteResidentRecord(id);
    const updated = deleteStoredResident(id);
    setResidents(updated);
    if (activeResidentId === id) {
      if (updated.length > 0) {
        setActiveResidentIdState(updated[0].id);
        setActiveModeState(updated[0].category);
        setAgeValue(updated[0].ageValue);
      } else {
        setActiveResidentIdState('');
      }
    }
    showActionToast('Data warga berhasil dihapus.');
  }, [activeResidentId]);

  // 16. Kosongkan Seluruh Data Warga (Untuk Pemakaian Riil Baru)
  const clearAllResidents = useCallback(() => {
    clearAllStoredResidents();
    setResidents([]);
    setActiveResidentIdState('');
    showActionToast('Semua data warga dibersihkan. Siap untuk pengisian data riil Posyandu!');
  }, []);

  // 15. Simulasi Cepat (Normal, Waspada, Bahaya)
  const simulateMeasurement = useCallback((type: 'NORMAL' | 'WASPADA' | 'BAHAYA') => {
    let mockTb = 98.0;
    let mockBb = 14.5;

    if (activeMode === 'BALITA') {
      if (type === 'NORMAL') {
        mockTb = ageValue >= 4 ? 98.5 : ageValue >= 2 ? 82.0 : 72.0;
        mockBb = ageValue >= 4 ? 14.8 : ageValue >= 2 ? 11.0 : 8.5;
      } else if (type === 'WASPADA') {
        mockTb = ageValue >= 4 ? 93.5 : ageValue >= 2 ? 78.5 : 69.5;
        mockBb = ageValue >= 4 ? 12.0 : ageValue >= 2 ? 9.2 : 7.2;
      } else {
        // BAHAYA
        mockTb = ageValue >= 4 ? 89.0 : ageValue >= 2 ? 75.0 : 66.0;
        mockBb = ageValue >= 4 ? 10.5 : ageValue >= 2 ? 8.2 : 6.4;
      }
    } else {
      // IBU_HAMIL
      if (type === 'NORMAL') {
        mockTb = 156.0;
        mockBb = ageValue >= 28 ? 62.0 : ageValue >= 13 ? 55.0 : 49.0;
      } else if (type === 'WASPADA') {
        mockTb = 152.0;
        mockBb = ageValue >= 28 ? 82.5 : ageValue >= 13 ? 78.0 : 74.0; // Obesitas / waspada
      } else {
        // BAHAYA
        mockTb = 143.0; // Panggul sempit < 145 cm
        mockBb = 41.0; // KEK < 42 kg
      }
    }

    setCurrentMeasurement({
      mode: activeMode,
      ageValue,
      tb_cm: mockTb,
      bb_kg: mockBb,
      source: 'SIMULASI',
      lastUpdated: new Date().toLocaleTimeString('id-ID'),
    });

    showActionToast(`Simulasi dijalankan: status ${type} (${activeMode})`);
  }, [activeMode, ageValue]);

  return (
    <PosyanduContext.Provider
      value={{
        residents,
        activeResident,
        activeResidentId,
        setActiveResidentId,
        activeMode,
        setActiveMode,
        ageValue,
        setAgeValue,
        currentMeasurement,
        setCurrentMeasurement,
        nutritionStatus,
        mqttConfig,
        mqttStatus,
        updateMqttConfig,
        publishSetMode,
        publishRemoteMeasure,
        saveCurrentMeasurementToResident,
        addNewResident,
        resetToDefaultData,
        deleteResident,
        clearAllResidents,
        simulateMeasurement,
        chartMetric,
        setChartMetric,
        activeTab,
        setActiveTab,
        lastActionMessage,
      }}
    >
      {children}
    </PosyanduContext.Provider>
  );
};

export const usePosyandu = () => {
  const context = useContext(PosyanduContext);
  if (!context) {
    throw new Error('usePosyandu must be used within a PosyanduProvider');
  }
  return context;
};
