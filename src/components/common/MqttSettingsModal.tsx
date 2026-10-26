import React, { useState } from 'react';
import { MqttConfig } from '../../types';
import { X, Settings, RotateCcw, Check, Radio } from 'lucide-react';

interface MqttSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MqttConfig;
  onSave: (newConfig: MqttConfig) => void;
}

const DEFAULT_CONFIG: MqttConfig = {
  brokerUrl: 'wss://broker.hivemq.com:8884/mqtt',
  dataTopic: 'sic8/timpos/data',
  cmdTopic: 'sic8/timpos/command',
};

export const MqttSettingsModal: React.FC<MqttSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [formData, setFormData] = useState<MqttConfig>(config);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleReset = () => {
    setFormData(DEFAULT_CONFIG);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#0D5C46]/10 text-[#0D5C46] flex items-center justify-center">
              <Settings className="w-5 h-5 text-[#0D5C46]" />
            </div>
            <div>
              <h2 id="modal-title" className="text-base font-semibold text-slate-900">
                Pengaturan Broker MQTT over WSS
              </h2>
              <p className="text-xs text-slate-500">
                Konfigurasi komunikasi 2 arah browser dengan ESP32 Wokwi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              URL Broker WebSocket Secure (WSS)
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.brokerUrl}
                onChange={(e) => setFormData({ ...formData, brokerUrl: e.target.value })}
                placeholder="wss://broker.hivemq.com:8884/mqtt"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5C46] focus:border-transparent text-slate-900 font-mono"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-500 flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Kompatibel dengan ESP32 Wokwi pada TCP port 1883</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Topik Terima Data (ESP32 &rarr; Web)
              </label>
              <input
                type="text"
                required
                value={formData.dataTopic}
                onChange={(e) => setFormData({ ...formData, dataTopic: e.target.value })}
                placeholder="sic8/timpos/data"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5C46] focus:border-transparent text-slate-900 font-mono"
              />
              <p className="mt-1 text-[11px] text-slate-500">Subscribe data TB & BB</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Topik Perintah (Web &rarr; ESP32)
              </label>
              <input
                type="text"
                required
                value={formData.cmdTopic}
                onChange={(e) => setFormData({ ...formData, cmdTopic: e.target.value })}
                placeholder="sic8/timpos/command"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5C46] focus:border-transparent text-slate-900 font-mono"
              />
              <p className="mt-1 text-[11px] text-slate-500">Publish SET_MODE & MEASURE</p>
            </div>
          </div>

          {/* Info Banner */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
            <h4 className="text-xs font-semibold text-[#0D5C46]">Catatan Kompatibilitas Vercel:</h4>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
              Karena Vercel berjalan pada HTTPS, koneksi MQTT di browser <strong>wajib menggunakan protokol WSS (port 8884)</strong>. ESP32 di Wokwi terhubung ke broker yang sama via port 1883, sehingga komunikasi tetap tersinkronisasi 2 arah.
            </p>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Default
            </button>

            <div className="w-full sm:w-auto flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saveSuccess}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#0D5C46] hover:bg-[#094434] active:scale-[0.98] rounded-lg shadow-sm transition-all"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    Tersimpan
                  </>
                ) : (
                  'Simpan & Terapkan'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
