import React, { useState, useMemo } from 'react';
import { usePosyandu } from '../../context/PosyanduContext';
import { NewResidentModal } from './NewResidentModal';
import { 
  Search, 
  X, 
  UserPlus, 
  Baby, 
  Heart, 
  ChevronRight, 
  Users,
  Trash2
} from 'lucide-react';
import { ResidentCategory } from '../../types';

export const Card1ResidentList: React.FC = () => {
  const { 
    residents, 
    activeResidentId, 
    setActiveResidentId, 
    addNewResident,
    deleteResident,
    clearAllResidents,
    setActiveTab
  } = usePosyandu();



  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'ALL' | ResidentCategory>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter residents based on search and category
  const filteredResidents = useMemo(() => {
    return residents.filter((resident) => {
      // 1. Kategori Filter
      if (filterCategory !== 'ALL' && resident.category !== filterCategory) {
        return false;
      }
      // 2. Search Query (Nama, ID, atau Wali)
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        resident.name.toLowerCase().includes(q) ||
        resident.id.toLowerCase().includes(q) ||
        resident.guardianName.toLowerCase().includes(q)
      );
    });
  }, [residents, filterCategory, searchQuery]);

  // Hitung jumlah tiap kategori
  const counts = useMemo(() => {
    const balitaCount = residents.filter((r) => r.category === 'BALITA').length;
    const ibuHamilCount = residents.filter((r) => r.category === 'IBU_HAMIL').length;
    return {
      all: residents.length,
      balita: balitaCount,
      ibuHamil: ibuHamilCount,
    };
  }, [residents]);

  const handleSelect = (id: string) => {
    setActiveResidentId(id);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'NORMAL':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-green-100 text-green-800 border border-green-300">
            NORMAL
          </span>
        );
      case 'WASPADA':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            WASPADA
          </span>
        );
      case 'BAHAYA':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
            BAHAYA
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
            TERDAFTAR
          </span>
        );
    }
  };

  return (
    <section 
      id="card-1-resident-list" 
      className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5 transition-all"
    >
      {/* Header Kartu */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0D5C46] flex items-center justify-center border border-emerald-200">
            <Users className="w-4 h-4 text-[#0D5C46]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-none">
              Kartu 1: Cari &amp; Daftar Warga
            </h2>
            <p className="text-[11px] text-slate-500 mt-1">
              Pilih warga yang sedang naik ke timbangan IoT
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#0D5C46] hover:bg-[#094434] active:scale-95 rounded-lg shadow-sm transition-all min-h-[40px] flex-shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Warga Baru</span>
        </button>
      </div>

      {/* Input Search Real-Time */}
      <div className="mt-3.5 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama balita, ibu hamil, nama wali, atau ID..."
          className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5C46] focus:border-transparent text-slate-900 placeholder:text-slate-400 transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
            aria-label="Hapus pencarian"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Tabs Kategori */}
      <div className="mt-3 flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-lg border border-slate-200">
        <button
          type="button"
          onClick={() => setFilterCategory('ALL')}
          className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
            filterCategory === 'ALL'
              ? 'bg-white text-[#0D5C46] shadow-sm font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Semua</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            filterCategory === 'ALL' ? 'bg-emerald-100 text-[#0D5C46]' : 'bg-slate-200 text-slate-600'
          }`}>
            {counts.all}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterCategory('BALITA')}
          className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
            filterCategory === 'BALITA'
              ? 'bg-white text-[#0D5C46] shadow-sm font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Baby className="w-3.5 h-3.5" />
          <span>Balita</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            filterCategory === 'BALITA' ? 'bg-emerald-100 text-[#0D5C46]' : 'bg-slate-200 text-slate-600'
          }`}>
            {counts.balita}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterCategory('IBU_HAMIL')}
          className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
            filterCategory === 'IBU_HAMIL'
              ? 'bg-white text-[#0D5C46] shadow-sm font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Ibu Hamil</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            filterCategory === 'IBU_HAMIL' ? 'bg-emerald-100 text-[#0D5C46]' : 'bg-slate-200 text-slate-600'
          }`}>
            {counts.ibuHamil}
          </span>
        </button>
      </div>

      {/* List Warga Scrollable */}
      <div className="mt-3.5 max-h-[360px] overflow-y-auto space-y-2 pr-1">
        {filteredResidents.length > 0 ? (
          filteredResidents.map((res) => {
            const isSelected = res.id === activeResidentId;
            const latestRecord = res.records[res.records.length - 1];

            return (
              <div
                key={res.id}
                onClick={() => handleSelect(res.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-2 border-[#0D5C46] bg-emerald-50/40 shadow-sm ring-1 ring-[#0D5C46]/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      res.category === 'BALITA' 
                        ? 'bg-sky-50 text-sky-700 border border-sky-200' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {res.category === 'BALITA' ? (
                        <Baby className="w-4 h-4" />
                      ) : (
                        <Heart className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {res.name}
                        </h4>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                          {res.id}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {res.category === 'BALITA' ? `Umur: ${res.ageValue} Thn` : `Usia: ${res.ageValue} Mgg`} &bull; Wali: {res.guardianName}
                      </p>
                    </div>
                  </div>

                  {/* Badge Status Terakhir & Aksi Hapus */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {getStatusBadge(latestRecord?.status)}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Hapus warga "${res.name}" (${res.id}) dari daftar?`)) {
                          deleteResident(res.id);
                        }
                      }}
                      className="p-1 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Hapus warga ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className={`w-4 h-4 transition-transform ${
                      isSelected ? 'text-[#0D5C46] translate-x-0.5' : 'text-slate-300'
                    }`} />
                  </div>
                </div>

                {/* Baris TB & BB Terakhir */}
                {latestRecord && (
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                    <span className="text-slate-500">
                      Ukur Terakhir: <strong>{latestRecord.periodLabel}</strong>
                    </span>
                    <span className="font-medium text-slate-800">
                      TB: <strong className="text-slate-900">{latestRecord.tb_cm} cm</strong> &bull; BB: <strong className="text-slate-900">{latestRecord.bb_kg} kg</strong>
                    </span>
                  </div>
                )}

                {/* Tombol Aksi Cepat jika Pasien Sedang Dipilih */}
                {isSelected && (
                  <div className="mt-2.5 pt-2 border-t border-emerald-200/60 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab('MEASUREMENT');
                      }}
                      className="flex-1 py-1.5 px-2 bg-[#0D5C46] hover:bg-[#094434] text-white text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 shadow-2xs transition-colors"
                    >
                      <span>📟 Timbang Pasien Ini</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab('HISTORY');
                      }}
                      className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 text-[#0D5C46] border border-emerald-300 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 shadow-2xs transition-colors"
                    >
                      <span>📊 Buka Riwayat &amp; Grafik</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })

        ) : residents.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">Daftar Warga Masih Kosong</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Data demo telah dibersihkan. Siap untuk mengisi data riil Posyandu.
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0D5C46] hover:bg-[#094434] rounded-lg shadow-sm transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              + Daftarkan Warga Baru
            </button>
          </div>
        ) : (
          <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">Warga tidak ditemukan</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Coba kata kunci pencarian lain atau pilih filter &quot;Semua&quot;
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilterCategory('ALL');
              }}
              className="mt-3 px-3 py-1.5 text-xs font-medium text-[#0D5C46] bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
            >
              Reset Filter Pencarian
            </button>
          </div>
        )}
      </div>

      {/* Footer Info & Aksi Bersihkan */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <span>Menampilkan {filteredResidents.length} dari {residents.length} warga</span>
        {residents.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Kosongkan semua data warga untuk memulai pencatatan baru yang bersih?')) {
                clearAllResidents();
              }
            }}
            className="text-red-500 hover:text-red-700 inline-flex items-center gap-1 hover:underline transition-colors"
            title="Kosongkan semua data dan mulai dari nol"
          >
            <Trash2 className="w-3 h-3" />
            Kosongkan Semua Data
          </button>
        )}
      </div>



      {/* Modal Pendaftaran Warga Baru */}
      <NewResidentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={addNewResident}
      />
    </section>
  );
};
