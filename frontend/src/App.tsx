import React, { useState } from 'react';
import { Header } from './components/Header';
import { NavigationTabs } from './components/NavigationTabs';
import { DashboardOverview } from './components/DashboardOverview';
import { KunjunganReportView } from './components/KunjunganReportView';
import { GigiReportView } from './components/GigiReportView';
import { Penyakit15ReportView } from './components/Penyakit15ReportView';
import { LaboratoriumReportView } from './components/LaboratoriumReportView';
import { RujukanReportView } from './components/RujukanReportView';
import { ExcelImportModal } from './components/ExcelImportModal';
import { AiAnalysisModal } from './components/AiAnalysisModal';

import { 
  ReportType, 
  MonthName, 
  KunjunganRecord, 
  GigiRecord, 
  PenyakitRecord, 
  LabRecord, 
  RujukanRecord,
  AiAnalysisResponse
} from './types';

import { 
  INITIAL_KUNJUNGAN, 
  INITIAL_GIGI, 
  INITIAL_PENYAKIT, 
  INITIAL_LAB, 
  INITIAL_RUJUKAN 
} from './data/initialData';

import { 
  exportKunjunganToExcel, 
  exportGigiToExcel, 
  exportPenyakitToExcel, 
  exportLabToExcel, 
  exportRujukanToExcel 
} from './utils/excelUtil';

export default function App() {
  // Datasets
  const [kunjunganData, setKunjunganData] = useState<KunjunganRecord[]>(INITIAL_KUNJUNGAN);
  const [gigiData, setGigiData] = useState<GigiRecord[]>(INITIAL_GIGI);
  const [penyakitData, setPenyakitData] = useState<PenyakitRecord[]>(INITIAL_PENYAKIT);
  const [labData, setLabData] = useState<LabRecord[]>(INITIAL_LAB);
  const [rujukanData, setRujukanData] = useState<RujukanRecord[]>(INITIAL_RUJUKAN);

  // Tab & Filters
  const [activeTab, setActiveTab] = useState<ReportType>('overview');
  const [selectedMonth, setSelectedMonth] = useState<MonthName | 'Semua'>('Semua');
  const [selectedPuskesmas, setSelectedPuskesmas] = useState<string>('Semua');

  // Modals & AI State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<AiAnalysisResponse | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Handle Export based on current tab
  const handleExportCurrent = () => {
    if (activeTab === 'kunjungan' || activeTab === 'overview') {
      exportKunjunganToExcel(kunjunganData);
    } else if (activeTab === 'gigi') {
      exportGigiToExcel(gigiData);
    } else if (activeTab === 'penyakit') {
      exportPenyakitToExcel(penyakitData);
    } else if (activeTab === 'laboratorium') {
      exportLabToExcel(labData);
    } else if (activeTab === 'rujukan') {
      exportRujukanToExcel(rujukanData);
    }
  };

  // Handle Import Success
  const handleImportSuccess = (parsedRecords: any[], category: string) => {
    if (category === 'kunjungan') {
      setKunjunganData(prev => [...parsedRecords, ...prev]);
      setActiveTab('kunjungan');
    } else if (category === 'gigi') {
      setGigiData(prev => [...parsedRecords, ...prev]);
      setActiveTab('gigi');
    } else if (category === 'penyakit') {
      setPenyakitData(prev => [...parsedRecords, ...prev]);
      setActiveTab('penyakit');
    } else if (category === 'laboratorium') {
      setLabData(prev => [...parsedRecords, ...prev]);
      setActiveTab('laboratorium');
    } else if (category === 'rujukan') {
      setRujukanData(prev => [...parsedRecords, ...prev]);
      setActiveTab('rujukan');
    }
  };

  // Trigger Gemini AI Analysis via Server Endpoint
  const handleTriggerAiAnalysis = async () => {
    setIsAiModalOpen(true);
    setIsAiLoading(true);
    setAiError(null);
    setAiResponse(null);

    let summaryText = '';
    if (activeTab === 'kunjungan' || activeTab === 'overview') {
      const totalRajal = kunjunganData.reduce((s, d) => s + d.rajalL + d.rajalP, 0);
      const totalRanap = kunjunganData.reduce((s, d) => s + d.ranapL + d.ranapP, 0);
      const totalJiwa = kunjunganData.reduce((s, d) => s + d.jiwaL + d.jiwaP, 0);
      summaryText = `Total Kunjungan Rajal: ${totalRajal}, Ranap: ${totalRanap}, Gangguan Jiwa: ${totalJiwa} dari ${kunjunganData.length} sampel laporan.`;
    } else if (activeTab === 'gigi') {
      const tumpatan = gigiData.reduce((s, d) => s + d.tumpatanGigiTetap, 0);
      const cabut = gigiData.reduce((s, d) => s + d.pencabutanGigiTetap, 0);
      summaryText = `Total Tumpatan Gigi Tetap: ${tumpatan}, Total Pencabutan: ${cabut}, Rasio Tumpatan/Cabut: ${cabut > 0 ? (tumpatan/cabut).toFixed(2) : tumpatan}.`;
    } else if (activeTab === 'penyakit') {
      const top3 = penyakitData.slice(0, 5).map(p => `${p.icd10} (${p.diagnosa}): ${p.kasusL + p.kasusP} kasus`).join('; ');
      summaryText = `Diagnosa Penyakit Terbanyak: ${top3}. Total entri: ${penyakitData.length}.`;
    } else if (activeTab === 'laboratorium') {
      summaryText = `Jumlah entri pemeriksaan lab: ${labData.length}. Pengujian dominan meliputi Darah Rutin, Hb, GDA, BTA, Malaria, dan Urin.`;
    } else if (activeTab === 'rujukan') {
      const total = rujukanData.reduce((s, d) => s + d.umumL + d.umumP + d.bpjsL + d.bpjsP + d.sktmL + d.sktmP, 0);
      summaryText = `Total Rujukan Pasien ke RS Rujukan: ${total} kasus. Dominasi skema BPJS/KIS dan rujukan utama ke RSUD Kab. Rote Ndao.`;
    }

    try {
      const res = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: activeTab,
          month: selectedMonth,
          puskesmas: selectedPuskesmas,
          dataSummary: summaryText
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const json = await res.json();
      setAiResponse(json);
    } catch (err: any) {
      setAiError(err.message || 'Gagal menghubungi layanan Gemini AI.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      
      {/* Top Header */}
      <Header
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedPuskesmas={selectedPuskesmas}
        setSelectedPuskesmas={setSelectedPuskesmas}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onExportCurrent={handleExportCurrent}
        onTriggerAiAnalysis={handleTriggerAiAnalysis}
        isAiLoading={isAiLoading}
      />

      {/* Navigation Tabs */}
      <NavigationTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {activeTab === 'overview' && (
          <DashboardOverview
            kunjunganData={kunjunganData}
            gigiData={gigiData}
            penyakitData={penyakitData}
            labData={labData}
            rujukanData={rujukanData}
          />
        )}

        {activeTab === 'kunjungan' && (
          <KunjunganReportView
            data={kunjunganData}
            setData={setKunjunganData}
            selectedMonth={selectedMonth}
            selectedPuskesmas={selectedPuskesmas}
          />
        )}

        {activeTab === 'gigi' && (
          <GigiReportView
            data={gigiData}
            setData={setGigiData}
            selectedMonth={selectedMonth}
            selectedPuskesmas={selectedPuskesmas}
          />
        )}

        {activeTab === 'penyakit' && (
          <Penyakit15ReportView
            data={penyakitData}
            setData={setPenyakitData}
            selectedMonth={selectedMonth}
            selectedPuskesmas={selectedPuskesmas}
          />
        )}

        {activeTab === 'laboratorium' && (
          <LaboratoriumReportView
            data={labData}
            setData={setLabData}
            selectedMonth={selectedMonth}
            selectedPuskesmas={selectedPuskesmas}
          />
        )}

        {activeTab === 'rujukan' && (
          <RujukanReportView
            data={rujukanData}
            setData={setRujukanData}
            selectedMonth={selectedMonth}
            selectedPuskesmas={selectedPuskesmas}
          />
        )}

      </main>

      {/* App Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-4 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 SI LAPOR FASYANKES - Dinas Kesehatan Kabupaten Rote Ndao, NTT.</p>
          <div className="flex items-center space-x-4">
            <span className="text-emerald-400 font-semibold">12 Puskesmas Terhubung</span>
            <span>•</span>
            <span>Format Resmi Excel (.xlsx)</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      <AiAnalysisModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        data={aiResponse}
        isLoading={isAiLoading}
        error={aiError}
      />

    </div>
  );
}
