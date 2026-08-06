import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { NavigationTabs } from './components/NavigationTabs';
import { DashboardOverview } from './components/DashboardOverview';
import { KunjunganReportView } from './components/KunjunganReportView';
import { GigiReportView } from './components/GigiReportView';
import { Penyakit15ReportView } from './components/Penyakit15ReportView';
import { LaboratoriumReportView } from './components/LaboratoriumReportView';
import { RujukanReportView } from './components/RujukanReportView';

import { 
  ReportType, 
  MonthName, 
  KunjunganRecord, 
  GigiRecord, 
  PenyakitRecord, 
  LabRecord, 
  RujukanRecord
} from './types';

import { 
  exportKunjunganToExcel, 
  exportGigiToExcel, 
  exportPenyakitToExcel, 
  exportLabToExcel, 
  exportRujukanToExcel 
} from './utils/excelUtil';

// Base URL Django REST API. Default ke localhost:8000 untuk dev; override
// lewat VITE_API_BASE_URL di .env kalau backend jalan di host/port lain
// (mis. saat deploy production).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

// Helper: ambil SEMUA data dari endpoint DRF, termasuk yang dipaging (mengikuti "next").
// Kalau endpoint kamu tidak dipaging (langsung array), fungsi ini tetap aman dipakai.
async function fetchAllFromApi<T>(path: string): Promise<T[]> {
  let url: string | null = `${API_BASE_URL}${path}`;
  const results: T[] = [];

  while (url) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Gagal memuat ${path} (HTTP ${res.status})`);
    }
    const json = await res.json();

    if (Array.isArray(json)) {
      // Endpoint tanpa pagination -> langsung array
      results.push(...json);
      url = null;
    } else {
      // Endpoint dengan pagination DRF standar -> { count, next, previous, results }
      results.push(...(json.results ?? []));
      url = json.next;
    }
  }

  return results;
}

// Helper: kirim record baru ke Django lewat POST, balikin record yang sudah
// tersimpan (lengkap dengan id asli dari database).
async function postToApi<T>(path: string, payload: any): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Gagal menyimpan ke ${path} (HTTP ${res.status}): ${errBody}`);
  }
  return res.json();
}

// Helper: kirim perubahan sebagian (partial update) ke Django lewat PATCH,
// balikin record hasil update dari server (bukan hasil merge lokal) --
// supaya field turunan (computed properties, mis. rasio Gigi) selalu ikut
// ter-refresh sesuai perhitungan backend.
async function patchToApi<T>(path: string, payload: any): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Gagal update ${path} (HTTP ${res.status}): ${errBody}`);
  }
  return res.json();
}

// Helper: hapus record di Django lewat DELETE. DRF membalas 204 No Content
// tanpa body kalau berhasil, jadi tidak perlu res.json().
async function deleteFromApi(path: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}${path}`, { method: 'DELETE' });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Gagal menghapus ${path} (HTTP ${res.status}): ${errBody}`);
  }
}

export default function App() {
  // Datasets
  const [kunjunganData, setKunjunganData] = useState<KunjunganRecord[]>([]);
  const [gigiData, setGigiData] = useState<GigiRecord[]>([]);
  const [penyakitData, setPenyakitData] = useState<PenyakitRecord[]>([]);
  const [labData, setLabData] = useState<LabRecord[]>([]);
  const [rujukanData, setRujukanData] = useState<RujukanRecord[]>([]);

  // Status pengambilan data dari API
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Tab & Filters
  const [activeTab, setActiveTab] = useState<ReportType>('overview');
  const [selectedMonth, setSelectedMonth] = useState<MonthName | 'Semua'>('Semua');
  const [selectedPuskesmas, setSelectedPuskesmas] = useState<string>('Semua');

  // Ambil semua data laporan dari backend Django REST Framework.
  // Sesuaikan path endpoint (/kunjungan/, /gigi/, dst.) dengan urls.py backend kamu.
  const loadAllData = useCallback(async () => {
    setIsDataLoading(true);
    setDataError(null);
    try {
      const [kunjungan, gigi, penyakit, lab, rujukan] = await Promise.all([
        fetchAllFromApi<KunjunganRecord>('/kunjungan/'),
        fetchAllFromApi<GigiRecord>('/gigi/'),
        fetchAllFromApi<PenyakitRecord>('/penyakit/'),
        fetchAllFromApi<LabRecord>('/laboratorium/'),
        fetchAllFromApi<RujukanRecord>('/rujukan/'),
      ]);

      setKunjunganData(kunjungan);
      setGigiData(gigi);
      setPenyakitData(penyakit);
      setLabData(lab);
      setRujukanData(rujukan);
    } catch (err: any) {
      setDataError(err.message || 'Gagal memuat data dari server. Pastikan backend Django berjalan.');
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Simpan record Gigi baru ke Django, baru update state pakai hasil dari server
  // (supaya id-nya id asli dari database, bukan id sementara buatan browser).
  // payload TIDAK termasuk id -- backend yang generate.
  const createGigiRecord = async (payload: Omit<GigiRecord, 'id' | 'rasioTumpatanPencabutan' | 'persenKasusDirujuk'>) => {
    const saved = await postToApi<GigiRecord>('/gigi/', payload);
    setGigiData(prev => [saved, ...prev]);
    return saved;
  };

  // Pola yang sama persis diulang untuk 4 laporan lain -- cuma beda endpoint
  // path dan state setter yang dipanggil.
  const createKunjunganRecord = async (payload: Omit<KunjunganRecord, 'id'>) => {
    const saved = await postToApi<KunjunganRecord>('/kunjungan/', payload);
    setKunjunganData(prev => [saved, ...prev]);
    return saved;
  };

  const createPenyakitRecord = async (payload: Omit<PenyakitRecord, 'id'>) => {
    const saved = await postToApi<PenyakitRecord>('/penyakit/', payload);
    setPenyakitData(prev => [saved, ...prev]);
    return saved;
  };

  const createLabRecord = async (payload: Omit<LabRecord, 'id'>) => {
    const saved = await postToApi<LabRecord>('/laboratorium/', payload);
    setLabData(prev => [saved, ...prev]);
    return saved;
  };

  const createRujukanRecord = async (payload: Omit<RujukanRecord, 'id'>) => {
    const saved = await postToApi<RujukanRecord>('/rujukan/', payload);
    setRujukanData(prev => [saved, ...prev]);
    return saved;
  };

  // --- Update (PATCH) & Delete (DELETE) -- pola sama untuk ke-5 laporan ---
  // update: kirim field yang berubah, lalu timpa item lama di state dengan
  // hasil dari server (bukan hasil merge lokal), supaya computed field
  // (kalau ada, mis. rasio di Gigi) selalu konsisten dengan backend.
  const updateGigiRecord = async (id: number, patch: Partial<GigiRecord>) => {
    const saved = await patchToApi<GigiRecord>(`/gigi/${id}/`, patch);
    setGigiData(prev => prev.map(item => (item.id === id ? saved : item)));
    return saved;
  };
  const deleteGigiRecord = async (id: number) => {
    await deleteFromApi(`/gigi/${id}/`);
    setGigiData(prev => prev.filter(item => item.id !== id));
  };

  const updateKunjunganRecord = async (id: number, patch: Partial<KunjunganRecord>) => {
    const saved = await patchToApi<KunjunganRecord>(`/kunjungan/${id}/`, patch);
    setKunjunganData(prev => prev.map(item => (item.id === id ? saved : item)));
    return saved;
  };
  const deleteKunjunganRecord = async (id: number) => {
    await deleteFromApi(`/kunjungan/${id}/`);
    setKunjunganData(prev => prev.filter(item => item.id !== id));
  };

  const updatePenyakitRecord = async (id: number, patch: Partial<PenyakitRecord>) => {
    const saved = await patchToApi<PenyakitRecord>(`/penyakit/${id}/`, patch);
    setPenyakitData(prev => prev.map(item => (item.id === id ? saved : item)));
    return saved;
  };
  const deletePenyakitRecord = async (id: number) => {
    await deleteFromApi(`/penyakit/${id}/`);
    setPenyakitData(prev => prev.filter(item => item.id !== id));
  };

  const updateLabRecord = async (id: number, patch: Partial<LabRecord>) => {
    const saved = await patchToApi<LabRecord>(`/laboratorium/${id}/`, patch);
    setLabData(prev => prev.map(item => (item.id === id ? saved : item)));
    return saved;
  };
  const deleteLabRecord = async (id: number) => {
    await deleteFromApi(`/laboratorium/${id}/`);
    setLabData(prev => prev.filter(item => item.id !== id));
  };

  const updateRujukanRecord = async (id: number, patch: Partial<RujukanRecord>) => {
    const saved = await patchToApi<RujukanRecord>(`/rujukan/${id}/`, patch);
    setRujukanData(prev => prev.map(item => (item.id === id ? saved : item)));
    return saved;
  };
  const deleteRujukanRecord = async (id: number) => {
    await deleteFromApi(`/rujukan/${id}/`);
    setRujukanData(prev => prev.filter(item => item.id !== id));
  };

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

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      
      {/* Top Header */}
      <Header
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedPuskesmas={selectedPuskesmas}
        setSelectedPuskesmas={setSelectedPuskesmas}
        onExportCurrent={handleExportCurrent}
      />

      {/* Navigation Tabs */}
      <NavigationTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {dataError && (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-50 text-red-800 px-4 py-3 flex items-center justify-between gap-4">
            <span className="text-sm">{dataError}</span>
            <button
              onClick={loadAllData}
              className="text-sm font-semibold text-red-700 hover:text-red-900 underline shrink-0"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {isDataLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <div className="h-8 w-8 border-4 border-slate-300 border-t-emerald-500 rounded-full animate-spin mb-3" />
            <p>Memuat data dari server...</p>
          </div>
        ) : (
        <>
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
            onCreateRecord={createKunjunganRecord}
            onUpdateRecord={updateKunjunganRecord}
            onDeleteRecord={deleteKunjunganRecord}
            selectedMonth={selectedMonth}
            selectedPuskesmas={selectedPuskesmas}
          />
        )}

        {activeTab === 'gigi' && (
          <GigiReportView
            data={gigiData}
            setData={setGigiData}
            onCreateRecord={createGigiRecord}
            onUpdateRecord={updateGigiRecord}
            onDeleteRecord={deleteGigiRecord}
            selectedMonth={selectedMonth}
            selectedPuskesmas={selectedPuskesmas}
          />
        )}

        {activeTab === 'penyakit' && (
          <Penyakit15ReportView
            data={penyakitData}
            setData={setPenyakitData}
            onCreateRecord={createPenyakitRecord}
            onUpdateRecord={updatePenyakitRecord}
            onDeleteRecord={deletePenyakitRecord}
            selectedMonth={selectedMonth}
            selectedPuskesmas={selectedPuskesmas}
          />
        )}

        {activeTab === 'laboratorium' && (
          <LaboratoriumReportView
            data={labData}
            setData={setLabData}
            onCreateRecord={createLabRecord}
            onUpdateRecord={updateLabRecord}
            onDeleteRecord={deleteLabRecord}
            selectedMonth={selectedMonth}
            selectedPuskesmas={selectedPuskesmas}
          />
        )}

        {activeTab === 'rujukan' && (
          <RujukanReportView
            data={rujukanData}
            setData={setRujukanData}
            onCreateRecord={createRujukanRecord}
            onUpdateRecord={updateRujukanRecord}
            onDeleteRecord={deleteRujukanRecord}
            selectedMonth={selectedMonth}
            selectedPuskesmas={selectedPuskesmas}
          />
        )}
        </>
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

    </div>
  );
}
