import mqtt, { MqttClient } from 'mqtt';
import { MqttConfig, MqttConnectionStatus, MqttInboundData, ResidentCategory } from '../types';

export type MqttDataCallback = (data: MqttInboundData) => void;
export type MqttStatusCallback = (status: MqttConnectionStatus, errorMsg?: string) => void;

class MqttService {
  private client: MqttClient | null = null;
  private currentConfig: MqttConfig = {
    brokerUrl: 'wss://broker.hivemq.com:8884/mqtt',
    dataTopic: 'sic8/timpos/data',
    cmdTopic: 'sic8/timpos/command',
  };
  private dataListeners: Set<MqttDataCallback> = new Set();
  private statusListeners: Set<MqttStatusCallback> = new Set();
  private connectionStatus: MqttConnectionStatus = 'disconnected';

  /**
   * Menginisialisasi koneksi MQTT over WebSockets Secure (WSS)
   */
  public connect(config?: Partial<MqttConfig>): void {
    if (config) {
      this.currentConfig = { ...this.currentConfig, ...config };
    }

    // Jika sudah ada client lama, disconnect terlebih dahulu
    if (this.client) {
      try {
        this.client.end(true);
      } catch (e) {
        console.warn('Error closing existing MQTT client:', e);
      }
      this.client = null;
    }

    this.setStatus('connecting');

    const clientId = `timpos_dash_${Math.random().toString(16).substring(2, 10)}`;

    try {
      this.client = mqtt.connect(this.currentConfig.brokerUrl, {
        clientId,
        clean: true,
        connectTimeout: 7000,
        reconnectPeriod: 5000,
        protocolVersion: 4,
        resubscribe: true,
        keepalive: 60,
      });

      this.client.on('connect', () => {
        console.info(`[MQTT] Terhubung ke broker: ${this.currentConfig.brokerUrl}`);
        this.setStatus('connected');

        // Otomatis subscribe ke topik data pengukuran
        if (this.client && this.currentConfig.dataTopic) {
          this.client.subscribe(this.currentConfig.dataTopic, { qos: 0 }, (err) => {
            if (err) {
              console.error(`[MQTT] Gagal subscribe ke ${this.currentConfig.dataTopic}:`, err);
            } else {
              console.info(`[MQTT] Berhasil subscribe ke topik: ${this.currentConfig.dataTopic}`);
            }
          });
        }
      });

      this.client.on('message', (topic, payload) => {
        if (topic === this.currentConfig.dataTopic) {
          try {
            const raw = payload.toString();
            const json = JSON.parse(raw);
            
            // Validasi & normalisasi payload
            if (typeof json === 'object' && json !== null) {
              const normalizedData: MqttInboundData = {
                device_id: json.device_id || 'TIMPOS-01',
                mode: (json.mode === 'IBU_HAMIL' ? 'IBU_HAMIL' : 'BALITA') as ResidentCategory,
                tb_cm: Number(json.tb_cm) || 0,
                bb_kg: Number(json.bb_kg) || 0,
              };

              console.info('[MQTT] Menerima data ukur:', normalizedData);
              this.notifyDataListeners(normalizedData);
            }
          } catch (err) {
            console.error('[MQTT] Gagal parse payload data:', err);
          }
        }
      });

      this.client.on('reconnect', () => {
        console.warn('[MQTT] Sedang mencoba menghubungkan ulang...');
        this.setStatus('connecting');
      });

      this.client.on('close', () => {
        this.setStatus('disconnected');
      });

      this.client.on('offline', () => {
        this.setStatus('disconnected');
      });

      this.client.on('error', (err) => {
        console.error('[MQTT] Connection error:', err);
        this.setStatus('error', err.message);
      });
    } catch (error: any) {
      console.error('[MQTT] Inisialisasi client gagal:', error);
      this.setStatus('error', error?.message || 'Gagal membuat koneksi MQTT');
    }
  }

  /**
   * Mengirim perintah ganti mode ke ESP32 Wokwi
   * Topik: sic8/timpos/command
   * Payload: {"cmd":"SET_MODE","mode":"BALITA" | "IBU_HAMIL"}
   */
  public publishSetMode(mode: ResidentCategory): boolean {
    if (!this.client || this.connectionStatus !== 'connected') {
      console.warn('[MQTT] Tidak dapat mengirim SET_MODE: client belum terhubung');
      return false;
    }

    const payload = JSON.stringify({
      cmd: 'SET_MODE',
      mode: mode,
    });

    this.client.publish(this.currentConfig.cmdTopic, payload, { qos: 0 }, (err) => {
      if (err) {
        console.error('[MQTT] Gagal publish SET_MODE:', err);
      } else {
        console.info(`[MQTT] Berhasil kirim SET_MODE: ${mode} ke ${this.currentConfig.cmdTopic}`);
      }
    });

    return true;
  }

  /**
   * Mengirim perintah "Kunci & Tarik Data dari Alat IoT" ke ESP32 Wokwi
   * Topik: sic8/timpos/command
   * Payload: {"cmd":"REMOTE_MEASURE"}
   */
  public publishRemoteMeasure(): boolean {
    if (!this.client || this.connectionStatus !== 'connected') {
      console.warn('[MQTT] Tidak dapat mengirim REMOTE_MEASURE: client belum terhubung');
      return false;
    }

    const payload = JSON.stringify({
      cmd: 'REMOTE_MEASURE',
    });

    this.client.publish(this.currentConfig.cmdTopic, payload, { qos: 0 }, (err) => {
      if (err) {
        console.error('[MQTT] Gagal publish REMOTE_MEASURE:', err);
      } else {
        console.info(`[MQTT] Berhasil kirim REMOTE_MEASURE ke ${this.currentConfig.cmdTopic}`);
      }
    });

    return true;
  }

  /**
   * Subscribe listener untuk menerima data ukur masuk dari ESP32
   */
  public onData(callback: MqttDataCallback): () => void {
    this.dataListeners.add(callback);
    return () => {
      this.dataListeners.delete(callback);
    };
  }

  /**
   * Subscribe listener untuk status koneksi MQTT
   */
  public onStatusChange(callback: MqttStatusCallback): () => void {
    this.statusListeners.add(callback);
    callback(this.connectionStatus);
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  public getStatus(): MqttConnectionStatus {
    return this.connectionStatus;
  }

  public getConfig(): MqttConfig {
    return { ...this.currentConfig };
  }

  public disconnect(): void {
    if (this.client) {
      try {
        this.client.end(true);
      } catch (e) {
        console.warn('Error closing client:', e);
      }
      this.client = null;
    }
    this.setStatus('disconnected');
  }

  private setStatus(status: MqttConnectionStatus, errorMsg?: string): void {
    this.connectionStatus = status;
    this.statusListeners.forEach((listener) => {
      try {
        listener(status, errorMsg);
      } catch (e) {
        console.error('Error in status listener:', e);
      }
    });
  }

  private notifyDataListeners(data: MqttInboundData): void {
    this.dataListeners.forEach((listener) => {
      try {
        listener(data);
      } catch (e) {
        console.error('Error in data listener:', e);
      }
    });
  }
}

export const mqttService = new MqttService();
