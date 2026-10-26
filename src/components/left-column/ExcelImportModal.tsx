import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Users,
  Baby,
  Heart,
  HelpCircle
} from 'lucide-react';
import { ResidentCategory } from '../../types';

export interface ImportedResidentRow {
  name: string;
  category: ResidentCategory;
  ageValue: number;
  guardianName: string;
  initialTb: number;
  initialBb: number;
}

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (imported: ImportedResidentRow[]) => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [parsedRows, setParsedRows] = useState<ImportedResidentRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 1. Download Template Excel Bawaan Standar Posyandu
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Nama Warga': 'Ahmad Fauzan',
        'Kategori': 'BALITA',
        'Umur': 2.5,
        'Nama Wali': 'Ibu Nurhayati',
        'Tinggi Badan (cm)': 86.5,
        'Berat Badan (kg)': 12.4
      },
      {
        'Nama Warga': 'Siti Aisyah',
        'Kategori': 'BALITA',
        'Umur': 4.0,
        'Nama Wali': 'Bapak Hendra',
        'Tinggi Badan (cm)': 98.0,
        'Berat Badan (kg)': 14.5
      },
      {
        'Nama Warga': 'Ibu Ratna Dewi',
        'Kategori': 'IBU_HAMIL',
        'Umur': 28,
        'Nama Wali': 'Bapak Surya (Suami)',
        'Tinggi Badan (cm)': 155.0,
        'Berat Badan (kg)': 61.5
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Format Data Warga TIMPOS');
    XLSX.writeFile(workbook, 'Template_Data_Warga_TIMPOS.xlsx');
  };

  // 2. Parser Fleksibel: Menemukan nama kolom secara cerdas
  const normalizeRow = (rawRow: Record<string, any>): ImportedResidentRow | null => {
    const keys = Object.keys(rawRow);
    const findValue = (...patterns: string[]) => {
      for (const pattern of patterns) {
        const foundKey = keys.find((k) => k.toLowerCase().replace(/[^a-z0-9]/g, '').includes(pattern));
        if (foundKey && rawRow[foundKey] !== undefined && rawRow[foundKey] !== null && String(rawRow[foundKey]).trim() !== '') {
          return rawRow[foundKey];
        }
      }
      return undefined;
    };

    const rawName = findValue('nama', 'name');
    if (!rawName) return null;

    const rawCategory = findValue('kategori', 'category', 'tipe', 'status');
    const catStr = String(rawCategory || '').toUpperCase();
    const category: ResidentCategory = catStr.includes('HAMIL') || catStr.includes('IBU') || catStr.includes('BML')
      ? 'IBU_HAMIL'
      : 'BALITA';

    const rawAge = findValue('umur', 'usia', 'age', 'minggu', 'tahun');
    const ageValue = rawAge !== undefined && !isNaN(Number(rawAge)) ? Number(rawAge) : (category === 'BALITA' ? 2 : 24);

    const rawGuardian = findValue('wali', 'orangtua', 'ibu', 'suami', 'guardian');
    const guardianName = rawGuardian ? String(rawGuardian).trim() : (category === 'BALITA' ? 'Orang Tua' : 'Keluarga');

    const rawTb = findValue('tb', 'tinggi', 'height');
    const initialTb = rawTb !== undefined && !isNaN(Number(rawTb)) ? Number(rawTb) : (category === 'BALITA' ? 85.0 : 155.0);

    const rawBb = findValue('bb', 'berat', 'weight');
    const initialBb = rawBb !== undefined && !isNaN(Number(rawBb)) ? Number(rawBb) : (category === 'BALITA' ? 12.0 : 55.0);

    return {
      name: String(rawName).trim(),
      category,
      ageValue,
      guardianName,
      initialTb,
      initialBb
    };
  };

  // 3. Handle File Upload (Mendukung .xlsx, .xls, .csv)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet);

      if (!jsonRows || jsonRows.length === 0) {
        setErrorMsg('File Excel/CSV ini kosong. Pastikan ada baris data di sheet pertama.');
        setIsProcessing(false);
        return;
      }

      const validRows: ImportedResidentRow[] = [];
      for (const row of jsonRows) {
        const normalized = normalizeRow(row);
        if (normalized && normalized.name.length > 0) {
          validRows.push(normalized);
        }
      }

      if (validRows.length === 0) {
        setErrorMsg('Tidak ditemukan kolom nama warga yang valid. Silakan gunakan format template yang disediakan.');
        setIsProcessing(false);
        return;
      }

      setParsedRows(validRows);
    } catch (err: any) {
      console.error('Error parsing excel:', err);
      setErrorMsg(err?.message || 'Gagal membaca file Excel. Pastikan format file adalah .xlsx, .xls, atau .csv');
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. Konfirmasi Simpan Seluruh Warga ke Database
  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;
    onImportSuccess(parsedRows);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#0D5C46] flex items-center justify-center border border-emerald-200">
              <FileSpreadsheet className="w-5 h-5 text-[#0D5C46]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Import Data Warga dari Excel / CSV
              </h2>
              <p className="text-xs text-slate-500">
                Tambah puluhan data balita &amp; ibu hamil sekaligus tanpa input manual satu per satu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Tombol Unduh Template */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-[#0D5C46] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-[#0D5C46]">Belum punya format tabel Excel?</h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Unduh template resmi TIMPOS dengan kolom Nama, Kategori, Umur, Wali, TB, dan BB yang sudah terstruktur.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0D5C46] bg-white hover:bg-emerald-100/60 border border-emerald-300 rounded-lg shadow-2xs transition-colors flex-shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Template</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-[#0D5C46] bg-slate-50/60 hover:bg-emerald-50/30 rounded-xl p-6 text-center cursor-pointer transition-colors"
          >
            <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-xs sm:text-sm font-semibold text-slate-800">
              {fileName ? `File terpilih: ${fileName}` : 'Klik untuk memilih file Excel atau CSV'}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Mendukung format <strong>.xlsx, .xls, atau .csv</strong> dari Microsoft Excel atau Google Spreadsheet
            </p>
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".xlsx, .xls, .csv" 
              onChange={handleFileChange}
              className="hidden" 
            />
          </div>

          {/* Feedback Error */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Pratinjau Data yang Berhasil Dibaca */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Pratinjau: Berhasil mendeteksi {parsedRows.length} Warga</span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Siap disimpan ke database
                </span>
              </div>

              <div className="max-h-[220px] overflow-y-auto rounded-lg border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2 px-3">No</th>
                      <th className="py-2 px-3">Nama</th>
                      <th className="py-2 px-3">Kategori</th>
                      <th className="py-2 px-3">Umur</th>
                      <th className="py-2 px-3">Wali</th>
                      <th className="py-2 px-3">TB / BB Awal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((row, idx) => (
                      <tr key={`import-row-${idx}`} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{row.name}</td>
                        <td className="py-2 px-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            row.category === 'BALITA' 
                              ? 'bg-sky-50 text-sky-700 border border-sky-200' 
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {row.category === 'BALITA' ? <Baby className="w-3 h-3" /> : <Heart className="w-3 h-3" />}
                            {row.category}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-600">
                          {row.category === 'BALITA' ? `${row.ageValue} Thn` : `${row.ageValue} Mgg`}
                        </td>
                        <td className="py-2 px-3 text-slate-600">{row.guardianName}</td>
                        <td className="py-2 px-3 font-mono text-slate-700">
                          {row.initialTb} cm / {row.initialBb} kg
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            {parsedRows.length > 0 ? `${parsedRows.length} data akan ditambahkan` : 'Pilih file excel terlebih dahulu'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={parsedRows.length === 0 || isProcessing}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#0D5C46] hover:bg-[#094434] active:scale-95 rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              <Users className="w-4 h-4" />
              <span>Simpan Semua ke Data Warga</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
