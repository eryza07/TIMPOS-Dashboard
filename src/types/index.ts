export type ResidentCategory = 'BALITA' | 'IBU_HAMIL';

export type NutritionStatusType = 'NORMAL' | 'WASPADA' | 'BAHAYA';

export interface MeasurementRecord {
  id: string;
  date: string; // ISO date or 'YYYY-MM-DD'
  periodLabel: string; // e.g. 'Jan 2026', 'Pemeriksaan 1'
  ageValue: number; // in Years (Balita) or Weeks (Ibu Hamil)
  ageLabel: string; // e.g. '4 Tahun' or '28 Minggu'
  tb_cm: number;
  bb_kg: number;
  status: NutritionStatusType;
  statusNote: string;
}

export interface Resident {
  id: string; // e.g. 'BLT-01', 'BML-01'
  name: string;
  category: ResidentCategory;
  ageValue: number; // Balita in years, Ibu Hamil in weeks
  guardianName: string; // Orang Tua / Suami
  records: MeasurementRecord[];
  createdAt: string;
  lastMeasuredDate?: string;
}

export interface MqttConfig {
  brokerUrl: string;
  dataTopic: string;
  cmdTopic: string;
}

export type MqttConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

export interface MqttInboundData {
  device_id: string;
  mode: ResidentCategory;
  tb_cm: number;
  bb_kg: number;
}

export interface NutritionEvaluation {
  status: NutritionStatusType;
  title: string;
  summary: string;
  detail: string;
  badgeClass: string;
  cardClass: string;
  borderClass: string;
  bmi?: number;
  tbMinNormal: number;
  tbDangerLimit: number;
  bbMinNormal: number;
  bbMaxNormal: number;
  bbDangerLimit: number;
}

export interface CurrentMeasurement {
  mode: ResidentCategory;
  ageValue: number;
  tb_cm: number;
  bb_kg: number;
  source: 'IOT' | 'MANUAL' | 'SIMULASI';
  lastUpdated: string;
}
