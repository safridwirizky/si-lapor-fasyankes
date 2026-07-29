import React from 'react';
import { 
  Building2, 
  FileSpreadsheet, 
  Sparkles, 
  Upload, 
  Download, 
  Activity
} from 'lucide-react';
import { MonthName, MONTHS, PUSKESMAS_LIST } from '../types';

interface HeaderProps {
  selectedMonth: MonthName | 'Semua';
  setSelectedMonth: (m: MonthName | 'Semua') => void;
  selectedPuskesmas: string;
  setSelectedPuskesmas: (p: string) => void;
  onOpenImportModal: () => void;
  onExportCurrent: () => void;
  onTriggerAiAnalysis: () => void;
  isAiLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  selectedMonth,
  setSelectedMonth,
  selectedPuskesmas,
  setSelectedPuskesmas,
  onOpenImportModal,
  onExportCurrent,
  onTriggerAiAnalysis,
  isAiLoading
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Brand & System Title */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-900/30 ring-1 ring-white/10">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Dinas Kesehatan Kab. Rote Ndao
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
                SI LAPOR FASYANKES
              </h1>
              <p className="text-xs text-slate-400">
                Sistem Informasi Pelaporan Pelayanan Kesehatan Puskesmas
              </p>
            </div>
          </div>

          {/* Action Bar & Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Filter Month */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700/80 rounded-lg px-2.5 py-1.5">
              <span className="text-xs text-slate-400 mr-2 font-medium">Bulan:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value as MonthName | 'Semua')}
                className="bg-transparent text-xs text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="Semua" className="bg-slate-800 text-white">Semua Bulan</option>
                {MONTHS.map(m => (
                  <option key={m} value={m} className="bg-slate-800 text-white">{m}</option>
                ))}
              </select>
            </div>

            {/* Filter Puskesmas */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700/80 rounded-lg px-2.5 py-1.5">
              <span className="text-xs text-slate-400 mr-2 font-medium">Puskesmas:</span>
              <select
                value={selectedPuskesmas}
                onChange={(e) => setSelectedPuskesmas(e.target.value)}
                className="bg-transparent text-xs text-slate-200 font-semibold focus:outline-none cursor-pointer max-w-[140px] truncate"
              >
                <option value="Semua" className="bg-slate-800 text-white">Seluruh Kab. Rote Ndao</option>
                {PUSKESMAS_LIST.map(p => (
                  <option key={p} value={p} className="bg-slate-800 text-white">{p}</option>
                ))}
              </select>
            </div>

            {/* Import Excel */}
            <button
              onClick={onOpenImportModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors shadow-sm"
              title="Import file Excel (.xlsx)"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>Import Excel</span>
            </button>

            {/* Export Excel */}
            <button
              onClick={onExportCurrent}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg transition-colors shadow-sm"
              title="Unduh laporan ke format Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Ekspor Excel</span>
            </button>

            {/* AI Health Analysis */}
            <button
              onClick={onTriggerAiAnalysis}
              disabled={isAiLoading}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-lg transition-all shadow-md shadow-emerald-950/40 disabled:opacity-50 ring-1 ring-emerald-400/30"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : 'text-amber-300'}`} />
              <span>{isAiLoading ? 'Menganalisis...' : 'Analisis AI Gemini'}</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
