import React from 'react';
import { usePosyandu, ActiveMenuTab } from '../../context/PosyanduContext';
import { 
  Scale, 
  TrendingUp, 
  Users, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const NavigationTabs: React.FC = () => {
  const { activeTab, setActiveTab, residents, activeResident } = usePosyandu();

  const tabs: {
    id: ActiveMenuTab;
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
  }[] = [
    {
      id: 'MEASUREMENT',
      label: 'Meja Timbangan & IoT',
      sublabel: 'Alat ukur live & simpan hasil',
      icon: Scale,
      badge: 'Live',
    },
    {
      id: 'HISTORY',
      label: 'Riwayat & Grafik Pasien',
      sublabel: activeResident ? activeResident.name : 'Rekap data & kurva Kemenkes',
      icon: TrendingUp,
      badge: activeResident?.records.length ? `${activeResident.records.length} Data` : undefined,
    },
    {
      id: 'RESIDENTS',
      label: 'Data Warga',
      sublabel: 'Daftar balita & ibu hamil',
      icon: Users,
      badge: residents.length,
    },
    {
      id: 'AI_CONSULTATION',
      label: 'Konsultasi AI',
      sublabel: 'Asisten edukasi & stunting',
      icon: Sparkles,
      badge: 'Beta',
    },
  ];

  return (
    <nav className="mb-6 bg-white border border-slate-200 rounded-2xl shadow-xs p-1.5 sm:p-2 overflow-x-auto">
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2.5 rounded-xl text-left transition-all min-h-[50px] relative ${
                isActive
                  ? 'bg-[#0D5C46] text-white shadow-sm ring-2 ring-[#0D5C46]/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                isActive
                  ? 'bg-white/15 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="min-w-0 pr-1">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs sm:text-sm font-bold truncate ${isActive ? 'text-white' : 'text-slate-900'}`}>
                    {tab.label}
                  </span>
                  {tab.badge !== undefined && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full leading-tight ${
                      isActive
                        ? 'bg-emerald-400/25 text-emerald-100 border border-emerald-300/30'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </div>
                <p className={`text-[11px] truncate max-w-[150px] sm:max-w-[200px] ${
                  isActive ? 'text-emerald-100/80' : 'text-slate-400'
                }`}>
                  {tab.sublabel}
                </p>
              </div>

              {isActive && (
                <ChevronRight className="w-4 h-4 text-emerald-200/80 hidden sm:block ml-auto" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
