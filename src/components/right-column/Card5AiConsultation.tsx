import React, { useState } from 'react';
import { Bot, Send, Sparkles, Info, X } from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  'Menu PMT protein hewani untuk balita kurang berat badan',
  'Saran nutrisi Trimester 3 untuk mencegah Berat Badan Lahir Rendah (BBLR)',
  'Tanda bahaya kehamilan dengan Tinggi Badan < 145 cm',
  'Jadwal pemberian Vitamin A & tablet tambah darah (TTD) di Posyandu',
];

export const Card5AiConsultation: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [showResponse, setShowResponse] = useState(false);
  const [submittedQuestion, setSubmittedQuestion] = useState('');

  const handleSelectChip = (qText: string) => {
    setQuestion(qText);
  };

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setSubmittedQuestion(question.trim());
    setShowResponse(true);
  };

  return (
    <section
      id="card-5-ai-mockup"
      className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5 transition-all"
    >
      {/* Header Kartu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0D5C46] flex items-center justify-center border border-emerald-200">
            <Bot className="w-4 h-4 text-[#0D5C46]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 leading-none">
                Kartu 5: Tanya AI — Asisten Konsultasi Gizi &amp; Kehamilan
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Panduan interaktif kader untuk konsultasi keluarga warga binaan
            </p>
          </div>
        </div>

        {/* Badge "Segera Hadir" */}
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Segera Hadir (Tahap Pengembangan)</span>
        </span>
      </div>

      {/* Rekomendasi Pertanyaan Cepat (Chips) */}
      <div className="mt-3.5">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
          Contoh Pertanyaan Cepat:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_QUESTIONS.map((item, idx) => (
            <button
              key={`ai-chip-${idx}`}
              type="button"
              onClick={() => handleSelectChip(item)}
              className="text-left text-xs px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50/70 hover:text-[#0D5C46] text-slate-700 rounded-lg border border-slate-200 hover:border-emerald-200 transition-colors"
            >
              &ldquo;{item}&rdquo;
            </button>
          ))}
        </div>
      </div>

      {/* Form Input Tanya AI */}
      <form onSubmit={handleAsk} className="mt-3.5 space-y-2.5">
        <div className="relative">
          <textarea
            rows={2}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ketik pertanyaan konsultasi gizi atau perawatan balita / ibu hamil di sini..."
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D5C46] focus:border-transparent text-slate-900 placeholder:text-slate-400 resize-none"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] text-slate-400 italic">
            *Modul UI mockup aman bebas konfigurasi API Key eksternal.
          </p>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#0D5C46] hover:bg-[#094434] active:scale-95 rounded-lg shadow-sm transition-all min-h-[40px]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Tanya AI</span>
          </button>
        </div>
      </form>

      {/* Kotak Respon Mockup Informatif */}
      {showResponse && (
        <div className="mt-4 p-4 bg-emerald-50/80 border border-emerald-300 rounded-xl animate-fadeIn relative">
          <button
            type="button"
            onClick={() => setShowResponse(false)}
            className="absolute top-3 right-3 text-emerald-700 hover:text-emerald-900 p-1"
            aria-label="Tutup pesan"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start space-x-3 pr-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-900 block">
                Pertanyaan: &ldquo;{submittedQuestion}&rdquo;
              </span>
              <div className="mt-1.5 text-xs leading-relaxed text-slate-800">
                <p className="font-semibold text-[#0D5C46] flex items-center gap-1 mb-1">
                  <Info className="w-3.5 h-3.5" />
                  Status Pengembangan Asisten AI TIMPOS:
                </p>
                <p>
                  Fitur Konsultasi AI (Integrasi LLM Posyandu) saat ini berada dalam tahap pengembangan berikutnya. Untuk saat ini, silakan gunakan hasil <strong>Indikasi Otomatis Kemenkes (Normal / Waspada / Bahaya)</strong> pada Kartu 3 di atas sebagai acuan utama pemeriksaan Posyandu.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
