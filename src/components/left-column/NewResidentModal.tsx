import React, { useState } from 'react';
import { ResidentCategory } from '../../types';
import { X, UserPlus, Baby, Heart, Scale, Ruler } from 'lucide-react';

interface NewResidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    category: ResidentCategory;
    ageValue: number;
    guardianName: string;
    initialTb: number;
    initialBb: number;
  }) => void;
}

export const NewResidentModal: React.FC<NewResidentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ResidentCategory>('BALITA');
  const [ageValue, setAgeValue] = useState<number>(2);
  const [guardianName, setGuardianName] = useState('');
  const [initialTb, setInitialTb] = useState<number>(85);
  const [initialBb, setInitialBb] = useState<number>(12);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCategoryChange = (newCat: ResidentCategory) => {
    setCategory(newCat);
    if (newCat === 'BALITA') {
      setAgeValue(2);
      setInitialTb(85);
      setInitialBb(12);
    } else {
      setAgeValue(20);
      setInitialTb(155);
      setInitialBb(56);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      onSubmit({
        name: name.trim(),
        category,
        ageValue: Number(ageValue),
        guardianName: guardianName.trim() || (category === 'BALITA' ? 'Ibu / Wali' : 'Suami'),
        initialTb: Number(initialTb),
        initialBb: Number(initialBb),
      });

      // Reset form
      setName('');
      setGuardianName('');
      onClose();
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-resident-title"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#0D5C46]/10 text-[#0D5C46] flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-[#0D5C46]" />
            </div>
            <div>
              <h2 id="new-resident-title" className="text-base font-semibold text-slate-900">
                Pendaftaran Warga Posyandu Baru
              </h2>
              <p className="text-xs text-slate-500">
                Data akan otomatis disimpan ke database lokal dan siap diperiksa
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
          {/* Pilih Kategori */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Kategori Pasien
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleCategoryChange('BALITA')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all ${
                  category === 'BALITA'
                    ? 'bg-[#0D5C46] text-white border-[#0D5C46] shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Baby className="w-4 h-4" />
                Balita (0.5 - 5 Thn)
              </button>
              <button
                type="button"
                onClick={() => handleCategoryChange('IBU_HAMIL')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all ${
                  category === 'IBU_HAMIL'
                    ? 'bg-[#0D5C46] text-white border-[#0D5C46] shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Heart className="w-4 h-4" />
                Ibu Hamil (Trimester)
              </button>
            </div>
          </div>

          {/* Nama Lengkap */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Lengkap Pasien <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={category === 'BALITA' ? 'Contoh: Ananda Rizky Ramadhan' : 'Contoh: Ibu Siti Maryam'}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5C46] focus:border-transparent text-slate-900"
            />
          </div>

          {/* Umur & Nama Wali / Suami */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {category === 'BALITA' ? 'Umur (Tahun)' : 'Usia Kandungan (Minggu)'} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={category === 'BALITA' ? 0.5 : 4}
                max={category === 'BALITA' ? 5.0 : 42}
                step={category === 'BALITA' ? 0.1 : 1}
                value={ageValue}
                onChange={(e) => setAgeValue(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5C46] focus:border-transparent text-slate-900"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                {category === 'BALITA' ? 'Rentang 0.5 s/d 5.0 Tahun' : 'Rentang 4 s/d 42 Minggu'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                {category === 'BALITA' ? 'Nama Orang Tua / Wali' : 'Nama Suami / Wali'}
              </label>
              <input
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder={category === 'BALITA' ? 'Contoh: Ny. Fatimah' : 'Contoh: Tn. Ridwan'}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5C46] focus:border-transparent text-slate-900"
              />
            </div>
          </div>

          {/* Pengukuran Perdana */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Hasil Pengukuran Perdana (Awal)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-600 flex items-center gap-1 mb-1">
                  <Ruler className="w-3.5 h-3.5 text-[#0D5C46]" />
                  Tinggi Badan (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  min="40"
                  max="200"
                  value={initialTb}
                  onChange={(e) => setInitialTb(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5C46] font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 flex items-center gap-1 mb-1">
                  <Scale className="w-3.5 h-3.5 text-[#0D5C46]" />
                  Berat Badan (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  min="2"
                  max="150"
                  value={initialBb}
                  onChange={(e) => setInitialBb(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5C46] font-semibold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors min-h-[44px]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0D5C46] hover:bg-[#094434] active:scale-[0.98] rounded-lg shadow-sm transition-all min-h-[44px] disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              {isSubmitting ? 'Mendaftarkan...' : 'Daftarkan Warga'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
