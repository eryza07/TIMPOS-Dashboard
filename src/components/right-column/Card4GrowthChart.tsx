import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { usePosyandu } from '../../context/PosyanduContext';
import { getBalitaThresholds, getPregnancyThresholds } from '../../services/nutritionEngine';
import { 
  TrendingUp, 
  Table, 
  Scale, 
  Ruler, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon 
} from 'lucide-react';

export const Card4GrowthChart: React.FC = () => {
  const { 
    activeResident, 
    chartMetric, 
    setChartMetric, 
    activeMode 
  } = usePosyandu();

  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Render Grafik Garis Plotly (3 Garis: Aktual, Standar Normal Min, Batas Bahaya)
  useEffect(() => {
    if (!chartContainerRef.current || !activeResident || activeResident.records.length === 0) {
      return;
    }

    const records = activeResident.records;
    const xLabels = records.map((r) => `${r.periodLabel} (${r.ageLabel})`);

    // 1. Data Garis Aktual
    const yActual = records.map((r) => chartMetric === 'BB' ? r.bb_kg : r.tb_cm);

    // 2. Data Garis Standar Normal Min & Batas Bahaya
    const yNormalMin: number[] = [];
    const yDangerLimit: number[] = [];

    records.forEach((r) => {
      if (activeResident.category === 'BALITA') {
        const bench = getBalitaThresholds(r.ageValue);
        if (chartMetric === 'BB') {
          yNormalMin.push(bench.bbMinNormal);
          yDangerLimit.push(bench.bbDangerLimit);
        } else {
          yNormalMin.push(bench.tbMinNormal);
          yDangerLimit.push(bench.tbDangerLimit);
        }
      } else {
        // IBU_HAMIL
        const bench = getPregnancyThresholds(r.ageValue);
        if (chartMetric === 'BB') {
          yNormalMin.push(bench.bbMinNormal);
          yDangerLimit.push(bench.bbDangerLimit);
        } else {
          yNormalMin.push(bench.tbMinNormal);
          yDangerLimit.push(bench.tbDangerLimit);
        }
      }
    });

    const unit = chartMetric === 'BB' ? 'kg' : 'cm';
    const metricTitle = chartMetric === 'BB' ? 'Berat Badan' : 'Tinggi Badan';

    // Trace 1: Data Aktual Warga (Hijau Tua Tebal)
    const traceActual: Plotly.Data = {
      x: xLabels,
      y: yActual,
      type: 'scatter',
      mode: 'lines+markers',
      name: `${activeResident.name} (${metricTitle})`,
      line: {
        color: '#0D5C46',
        width: 3.5,
      },
      marker: {
        color: '#0D5C46',
        size: 8,
        symbol: 'circle',
      },
      hovertemplate: `<b>%{x}</b><br>Aktual: <b>%{y:.1f} ${unit}</b><extra></extra>`,
    };

    // Trace 2: Batas Normal Minimum Kemenkes (Garis Hijau Putus-putus)
    const traceNormalMin: Plotly.Data = {
      x: xLabels,
      y: yNormalMin,
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Standar Normal Min (Kemenkes)',
      line: {
        color: '#16A34A',
        width: 2,
        dash: 'dash',
      },
      marker: {
        color: '#16A34A',
        size: 5,
        symbol: 'square',
      },
      hovertemplate: `Normal Min: <b>%{y:.1f} ${unit}</b><extra></extra>`,
    };

    // Trace 3: Batas Bahaya Stunting / KEK (Garis Merah Titik-titik)
    const traceDangerLimit: Plotly.Data = {
      x: xLabels,
      y: yDangerLimit,
      type: 'scatter',
      mode: 'lines+markers',
      name: activeMode === 'BALITA' ? 'Batas Bahaya Stunting / Gizi Kurang' : 'Batas Bahaya KEK',
      line: {
        color: '#DC2626',
        width: 2,
        dash: 'dot',
      },
      marker: {
        color: '#DC2626',
        size: 5,
        symbol: 'diamond',
      },
      hovertemplate: `Batas Bahaya: <b>%{y:.1f} ${unit}</b><extra></extra>`,
    };

    const layout: Partial<Plotly.Layout> = {
      title: {
        text: `Kurva Perkembangan ${metricTitle} — ${activeResident.name}`,
        font: {
          family: 'Inter, system-ui, sans-serif',
          size: 13,
          color: '#0F172A',
        },
        x: 0.02,
        y: 0.98,
      },
      margin: {
        l: 45,
        r: 20,
        t: 40,
        b: 55,
      },
      legend: {
        orientation: 'h',
        x: 0,
        y: -0.22,
        font: {
          family: 'Inter, sans-serif',
          size: 11,
          color: '#475569',
        },
      },
      xaxis: {
        showgrid: true,
        gridcolor: '#F1F5F9',
        tickfont: {
          family: 'Inter, sans-serif',
          size: 11,
          color: '#64748B',
        },
      },
      yaxis: {
        title: {
          text: `${metricTitle} (${unit})`,
          font: {
            family: 'Inter, sans-serif',
            size: 11,
            color: '#475569',
          },
        },
        showgrid: true,
        gridcolor: '#E2E8F0',
        tickfont: {
          family: 'Inter, sans-serif',
          size: 11,
          color: '#64748B',
        },
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      autosize: true,
      hovermode: 'closest',
    };

    const config: Partial<Plotly.Config> = {
      responsive: true,
      displayModeBar: false, // Menghilangkan modebar untuk tampilan clean clinical
    };

    Plotly.react(chartContainerRef.current, [traceActual, traceNormalMin, traceDangerLimit], layout, config);

    const handleResize = () => {
      if (chartContainerRef.current) {
        Plotly.Plots.resize(chartContainerRef.current);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [activeResident, chartMetric, activeMode]);

  return (
    <section 
      id="card-4-growth-chart" 
      className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5 transition-all"
    >
      {/* Header Kartu & Toggle Sakelar Metrik */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0D5C46] flex items-center justify-center border border-emerald-200">
            <TrendingUp className="w-4 h-4 text-[#0D5C46]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              Grafik Pertumbuhan Pasien
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Catatan pertumbuhan bulanan sesuai acuan Kemenkes RI
            </p>
          </div>
        </div>

        {/* Sakelar Switch Metrik BB vs TB (Satu Grafik Sesuai Aturan Anti-AI Slop) */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setChartMetric('BB')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all min-h-[34px] ${
              chartMetric === 'BB'
                ? 'bg-white text-[#0D5C46] shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Berat Badan (kg)</span>
          </button>
          <button
            type="button"
            onClick={() => setChartMetric('TB')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all min-h-[34px] ${
              chartMetric === 'TB'
                ? 'bg-white text-[#0D5C46] shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>Tinggi Badan (cm)</span>
          </button>
        </div>
      </div>

      {/* Kontainer Plotly Chart */}
      <div className="mt-2 w-full relative">
        {(!activeResident || activeResident.records.length === 0) && (
          <div className="w-full h-[320px] sm:h-[350px] flex flex-col items-center justify-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200 text-center p-6">
            <TrendingUp className="w-10 h-10 text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">Belum Ada Kurva Grafik</p>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              {!activeResident
                ? 'Daftar warga masih kosong atau belum ada warga yang dipilih. Silakan daftarkan warga baru di Kartu 1.'
                : 'Belum ada riwayat ukur untuk warga ini. Tarik data dari alat IoT lalu klik "Simpan Hasil Ukur".'}
            </p>
          </div>
        )}
        <div 
          ref={chartContainerRef} 
          className={`w-full h-[320px] sm:h-[350px] ${!activeResident || activeResident.records.length === 0 ? 'hidden' : 'block'}`}
        />
      </div>

      {/* Tabel Riwayat Pemeriksaan Warga */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <Table className="w-4 h-4 text-[#0D5C46]" />
            <span>Tabel Riwayat Pemeriksaan: {activeResident?.name || 'Belum Ada Warga Terpilih'}</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Total {activeResident?.records.length || 0} Pemeriksaan Tercatat
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-3 w-12 text-center">No</th>
                <th className="py-2.5 px-3">Periode</th>
                <th className="py-2.5 px-3">Umur</th>
                <th className="py-2.5 px-3">Tinggi (TB)</th>
                <th className="py-2.5 px-3">Berat (BB)</th>
                <th className="py-2.5 px-3">Status Kemenkes</th>
                <th className="py-2.5 px-3 min-w-[200px]">Catatan Medis Posyandu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeResident && activeResident.records.length > 0 ? (
                activeResident.records.map((rec, index) => {
                  return (
                    <tr 
                      key={rec.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        index === activeResident.records.length - 1 ? 'bg-emerald-50/30 font-medium' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                        {index + 1}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                        {rec.periodLabel}
                        <span className="text-[10px] text-slate-400 block font-normal">{rec.date}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                        {rec.ageLabel}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                        {rec.tb_cm.toFixed(1)} cm
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                        {rec.bb_kg.toFixed(1)} kg
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {rec.status === 'NORMAL' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-green-100 text-green-800 border border-green-300">
                            <CheckCircle2 className="w-3 h-3 text-green-600" />
                            NORMAL
                          </span>
                        )}
                        {rec.status === 'WASPADA' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            WASPADA
                          </span>
                        )}
                        {rec.status === 'BAHAYA' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
                            <AlertOctagon className="w-3 h-3 text-red-600" />
                            BAHAYA
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px] leading-relaxed">
                        {rec.statusNote || '-'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    Belum ada riwayat pemeriksaan untuk warga ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
