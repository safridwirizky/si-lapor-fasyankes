import React, { useState } from 'react';
import { Upload, X, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (parsedData: any, reportCategory: string) => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [detectedCategory, setDetectedCategory] = useState<string>('kunjungan');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setErrorMsg('');

      // Auto detect category from filename
      const fn = f.name.toLowerCase();
      if (fn.includes('kunjungan') || fn.includes('rajal') || fn.includes('ranap') || fn.includes('jiwa')) {
        setDetectedCategory('kunjungan');
      } else if (fn.includes('gigi') || fn.includes('mulut')) {
        setDetectedCategory('gigi');
      } else if (fn.includes('15') || fn.includes('penyakit') || fn.includes('besar')) {
        setDetectedCategory('penyakit');
      } else if (fn.includes('lab') || fn.includes('laboratorium')) {
        setDetectedCategory('laboratorium');
      } else if (fn.includes('rujukan')) {
        setDetectedCategory('rujukan');
      }
    }
  };

  const handleProcessImport = () => {
    if (!file) {
      setErrorMsg('Pilih file Excel terlebih dahulu.');
      return;
    }

    setStatus('Membaca file Excel...');
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const wb = XLSX.read(buffer, { type: 'array' });

        setStatus(`Berhasil membaca ${wb.SheetNames.length} sheet. Memproses data...`);

        const parsedRecords: any[] = [];

        wb.SheetNames.forEach(sheetName => {
          const ws = wb.Sheets[sheetName];
          const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

          // Basic sheet parser logic
          rows.forEach((row, idx) => {
            if (!row || row.length < 2) return;
            // Skip title header rows
            const firstCell = String(row[0] || '').trim();
            const secondCell = String(row[1] || '').trim();

            if (firstCell.startsWith('LAPORAN') || firstCell.startsWith('DI PUSKESMAS') || firstCell.startsWith('TAHUN') || firstCell === 'NO' || firstCell === 'No.') {
              return;
            }

            if (detectedCategory === 'kunjungan' && secondCell && secondCell.toLowerCase().includes('pkm') || secondCell.toLowerCase().includes('puskesmas') || secondCell.toLowerCase().includes('rsud')) {
              parsedRecords.push({
                id: `imp-k-${Date.now()}-${Math.random()}`,
                puskesmas: secondCell.toUpperCase().startsWith('PKM') ? secondCell : `PKM ${secondCell}`,
                month: sheetName.length > 2 ? sheetName : 'Januari',
                year: 2026,
                rajalL: Number(row[2]) || 0,
                rajalP: Number(row[3]) || 0,
                ranapL: Number(row[5]) || 0,
                ranapP: Number(row[6]) || 0,
                jiwaL: Number(row[8]) || 0,
                jiwaP: Number(row[9]) || 0,
              });
            } else if (detectedCategory === 'gigi' && secondCell) {
              parsedRecords.push({
                id: `imp-g-${Date.now()}-${Math.random()}`,
                puskesmas: secondCell.toUpperCase().startsWith('PKM') ? secondCell : `PKM ${secondCell}`,
                month: sheetName.length > 2 ? sheetName : 'Januari',
                year: 2026,
                tumpatanGigiTetap: Number(row[2]) || 0,
                pencabutanGigiTetap: Number(row[3]) || 0,
                jumlahKunjungan: Number(row[4]) || 0,
                jumlahKasusGigi: Number(row[6]) || 0,
                jumlahKasusDirujuk: Number(row[7]) || 0,
              });
            } else if (detectedCategory === 'penyakit' && row[1] && row[2]) {
              parsedRecords.push({
                id: `imp-p-${Date.now()}-${Math.random()}`,
                puskesmas: sheetName.toUpperCase().includes('PKM') ? sheetName : `PKM ${sheetName}`,
                month: 'Januari',
                year: 2026,
                rank: Number(row[0]) || idx,
                icd10: String(row[1]),
                diagnosa: String(row[2]),
                kasusL: Number(row[3]) || 0,
                kasusP: Number(row[4]) || 0,
              });
            } else if (detectedCategory === 'laboratorium' && secondCell) {
              parsedRecords.push({
                id: `imp-l-${Date.now()}-${Math.random()}`,
                puskesmas: 'PKM BAA',
                month: sheetName,
                year: 2026,
                elemenData: secondCell,
                kasusL: Number(row[3]) || 0,
                kasusP: Number(row[4]) || 0,
              });
            } else if (detectedCategory === 'rujukan' && secondCell) {
              parsedRecords.push({
                id: `imp-r-${Date.now()}-${Math.random()}`,
                puskesmas: sheetName.toUpperCase().startsWith('PKM') ? sheetName : `PKM ${sheetName}`,
                faskesTujuan: secondCell,
                month: 'Januari',
                year: 2026,
                umumL: Number(row[2]) || 0,
                umumP: Number(row[3]) || 0,
                bpjsL: Number(row[4]) || 0,
                bpjsP: Number(row[5]) || 0,
                sktmL: Number(row[6]) || 0,
                sktmP: Number(row[7]) || 0,
              });
            }
          });
        });

        if (parsedRecords.length > 0) {
          onImportSuccess(parsedRecords, detectedCategory);
          setStatus(`Selesai! Berhasil mengimpor ${parsedRecords.length} baris data.`);
          setTimeout(() => {
            onClose();
          }, 1200);
        } else {
          setErrorMsg('Format file Excel tidak dikenali atau tidak berisi data yang sesuai.');
          setStatus('');
        }
      } catch (err: any) {
        setErrorMsg('Gagal membaca file Excel: ' + err.message);
        setStatus('');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-5">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Import File Excel SI LAPOR FASYANKES</h3>
              <p className="text-xs text-slate-500">Unggah file .xlsx resmi dari repository atau fasyankes</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File Dropzone */}
        <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50 p-6 rounded-xl text-center transition-colors">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="hidden"
            id="excel-upload-input"
          />
          <label htmlFor="excel-upload-input" className="cursor-pointer space-y-2 block">
            <Upload className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="text-xs font-bold text-slate-800">
              {file ? file.name : 'Klik untuk memilih file Excel (.xlsx)'}
            </p>
            <p className="text-[11px] text-slate-400">
              Mendukung format file resmi Kunjungan, Gigi, 15 Besar Penyakit, Lab & Rujukan
            </p>
          </label>
        </div>

        {/* Target Category Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Kategori Modul Target:
          </label>
          <select
            value={detectedCategory}
            onChange={(e) => setDetectedCategory(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium text-slate-800"
          >
            <option value="kunjungan">1. Kunjungan Rajal, Ranap & Jiwa</option>
            <option value="gigi">2. Pelayanan Kesehatan Gigi & Mulut</option>
            <option value="penyakit">3. Surveilans 15 Besar Penyakit</option>
            <option value="laboratorium">4. Pelayanan Laboratorium</option>
            <option value="rujukan">5. Laporan Rujukan Pasien</option>
          </select>
        </div>

        {status && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg flex items-center space-x-2 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{status}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-lg flex items-center space-x-2 border border-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
          >
            Batal
          </button>
          <button
            onClick={handleProcessImport}
            disabled={!file}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg disabled:opacity-50"
          >
            Proses Import Excel
          </button>
        </div>

      </div>
    </div>
  );
};
