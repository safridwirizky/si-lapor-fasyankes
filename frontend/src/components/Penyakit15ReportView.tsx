import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Search,
  BookOpen,
  Loader2
} from 'lucide-react';
import { PenyakitRecord, MonthName, PUSKESMAS_LIST, MONTHS } from '../types';

interface Penyakit15ReportViewProps {
  data: PenyakitRecord[];
  setData: React.Dispatch<React.SetStateAction<PenyakitRecord[]>>;
  onCreateRecord: (payload: Omit<PenyakitRecord, 'id' | 'peringkat'>) => Promise<PenyakitRecord>;
  onUpdateRecord: (id: number, patch: Partial<PenyakitRecord>) => Promise<PenyakitRecord>;
  onDeleteRecord: (id: number) => Promise<void>;
  onSearchIcd10: (query: string) => Promise<{ code: string; display: string }[]>;
  selectedMonth: MonthName | 'Semua';
  selectedPuskesmas: string;
}

export const Penyakit15ReportView: React.FC<Penyakit15ReportViewProps> = ({
  data,
  setData,
  onCreateRecord,
  onUpdateRecord,
  onDeleteRecord,
  onSearchIcd10,
  selectedMonth,
  selectedPuskesmas
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editSavingId, setEditSavingId] = useState<number | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  // Form state
  const [newPkm, setNewPkm] = useState(PUSKESMAS_LIST[0]);
  const [newMonth, setNewMonth] = useState<MonthName>('Januari');
  // Peringkat TIDAK diminta dari user -- dihitung otomatis oleh backend
  // berdasarkan total kasus terbanyak dalam grup Puskesmas+Bulan+Tahun
  // (lihat PenyakitViewSet.perform_create/update di Django).
  const [icd10, setIcd10] = useState('');
  const [diagnosa, setDiagnosa] = useState('');
  const [kasusL, setKasusL] = useState(0);
  const [kasusP, setKasusP] = useState(0);

  // Pencarian ICD-10 (live, dari ~18.500 kode di database Django, sumber
  // e-klaim BPJS -- BUKAN 10 preset hardcoded lagi). Ketik minimal 2
  // karakter, hasil di-debounce 300ms supaya tidak nembak API tiap huruf.
  const [icdQuery, setIcdQuery] = useState('');
  const [icdResults, setIcdResults] = useState<{ code: string; display: string }[]>([]);
  const [icdSearching, setIcdSearching] = useState(false);
  const [icdDropdownOpen, setIcdDropdownOpen] = useState(false);
  const icdBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (icdQuery.trim().length < 2) {
      setIcdResults([]);
      return;
    }
    setIcdSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await onSearchIcd10(icdQuery);
        setIcdResults(results);
      } catch {
        setIcdResults([]);
      } finally {
        setIcdSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [icdQuery, onSearchIcd10]);

  // Klik di luar box pencarian ICD-10 -> tutup dropdown hasil
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (icdBoxRef.current && !icdBoxRef.current.contains(e.target as Node)) {
        setIcdDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePickIcd = (item: { code: string; display: string }) => {
    setIcd10(item.code);
    setDiagnosa(item.display);
    setIcdQuery(`${item.code} - ${item.display}`);
    setIcdDropdownOpen(false);
  };

  const filteredData = data.filter(item => {
    const matchMonth = selectedMonth === 'Semua' || item.month === selectedMonth;
    const matchPkm = selectedPuskesmas === 'Semua' || item.puskesmas === selectedPuskesmas;
    const q = searchQuery.toLowerCase();
    const matchSearch = item.puskesmas.toLowerCase().includes(q) ||
                        item.icd10.toLowerCase().includes(q) ||
                        item.diagnosa.toLowerCase().includes(q);
    return matchMonth && matchPkm && matchSearch;
  });

  const totalL = filteredData.reduce((s, d) => s + d.kasusL, 0);
  const totalP = filteredData.reduce((s, d) => s + d.kasusP, 0);

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!icd10.trim() || !diagnosa.trim()) {
      setSaveError('Cari dan pilih diagnosa ICD-10 dari daftar terlebih dahulu.');
      return;
    }
    setSaveError(null);
    setIsSaving(true);
    try {
      await onCreateRecord({
        puskesmas: newPkm,
        month: newMonth,
        year: 2026,
        icd10,
        diagnosa,
        kasusL: Number(kasusL),
        kasusP: Number(kasusP),
      });
      setShowAddForm(false);
      setIcd10('');
      setDiagnosa('');
      setIcdQuery('');
      setIcdResults([]);
      setKasusL(0);
      setKasusP(0);
    } catch (err: any) {
      setSaveError(err.message || 'Gagal menyimpan data ke server.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (id: number, field: keyof PenyakitRecord, val: any) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
  };

  const handleSaveEdit = async (row: PenyakitRecord) => {
    setEditError(null);
    setEditSavingId(row.id);
    try {
      const { id, ...patch } = row;
      const saved = await onUpdateRecord(id, patch);
      setData(prev => prev.map(item => (item.id === id ? saved : item)));
      setEditingId(null);
    } catch (err: any) {
      setEditError(err.message || 'Gagal menyimpan perubahan ke server.');
    } finally {
      setEditSavingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Hapus data diagnosa ini secara permanen?')) return;
    setEditError(null);
    try {
      await onDeleteRecord(id);
    } catch (err: any) {
      setEditError(err.message || 'Gagal menghapus data di server.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <span>Laporan 3: Surveilans 15 Besar Penyakit (ICD-10)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Laporan Bulanan Peringkat Kasus Penyakit Terbanyak berdasarkan Klasifikasi Kodifikasi Diagnosa ICD-10
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari ICD-10 / Diagnosa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 w-52"
            />
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Tutup Form' : 'Tambah Diagnosa'}</span>
          </button>
        </div>
      </div>

      {/* Add Form Drawer */}
      {showAddForm && (
        <form onSubmit={handleAddRecord} className="bg-amber-50/70 border border-amber-200 p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Entri Diagnosa 15 Besar Penyakit</h3>
          </div>

          {saveError && (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">
              {saveError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Puskesmas</label>
              <select value={newPkm} onChange={(e) => setNewPkm(e.target.value as any)} className="w-full bg-white border rounded-lg p-2">
                {PUSKESMAS_LIST.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Bulan</label>
              <select value={newMonth} onChange={(e) => setNewMonth(e.target.value as MonthName)} className="w-full bg-white border rounded-lg p-2">
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="lg:col-span-2 relative" ref={icdBoxRef}>
              <label className="block text-slate-700 font-medium mb-1">
                Cari Diagnosa (ICD-10) <span className="text-slate-400 font-normal">-- database e-klaim, ~18.500 kode</span>
              </label>
              <div className="relative">
                <BookOpen className="w-3.5 h-3.5 text-amber-600 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={icdQuery}
                  onChange={e => {
                    setIcdQuery(e.target.value);
                    setIcdDropdownOpen(true);
                    // Kalau orang ngetik ulang setelah pernah pilih, anggap
                    // pilihan lama tidak berlaku lagi sampai dia pilih baru.
                    setIcd10('');
                    setDiagnosa('');
                  }}
                  onFocus={() => setIcdDropdownOpen(true)}
                  placeholder="Ketik kode atau nama penyakit, mis. 'gastritis' atau 'K29'"
                  className="w-full bg-white border p-2 pl-8 rounded-lg"
                  autoComplete="off"
                />
                {icdSearching && (
                  <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin absolute right-2.5 top-1/2 -translate-y-1/2" />
                )}
              </div>

              {icdDropdownOpen && icdQuery.trim().length >= 2 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {icdResults.length > 0 ? (
                    icdResults.map(item => (
                      <button
                        type="button"
                        key={item.code}
                        onClick={() => handlePickIcd(item)}
                        className="w-full text-left px-3 py-2 hover:bg-amber-50 border-b border-slate-100 last:border-b-0"
                      >
                        <span className="font-mono font-bold text-amber-700">{item.code}</span>
                        <span className="text-slate-600"> - {item.display}</span>
                      </button>
                    ))
                  ) : !icdSearching ? (
                    <p className="px-3 py-2 text-slate-400">Tidak ditemukan, coba kata kunci lain.</p>
                  ) : null}
                </div>
              )}

              {icd10 && (
                <p className="mt-1 text-[11px] text-emerald-700">
                  Terpilih: <span className="font-mono font-bold">{icd10}</span> - {diagnosa}
                </p>
              )}
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Kasus Laki-laki (L)</label>
              <input type="number" min="0" value={kasusL} onChange={e => setKasusL(Number(e.target.value))} className="w-full bg-white border p-2 rounded-lg" />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Kasus Perempuan (P)</label>
              <input type="number" min="0" value={kasusP} onChange={e => setKasusP(Number(e.target.value))} className="w-full bg-white border p-2 rounded-lg" />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-3 py-1.5 text-xs text-slate-600 bg-white border rounded-lg">Batal</button>
            <button type="submit" disabled={isSaving} className="px-4 py-1.5 text-xs font-semibold bg-amber-600 text-white rounded-lg hover:bg-amber-500 disabled:opacity-60">
              {isSaving ? 'Menyimpan...' : 'Simpan Diagnosa'}
            </button>
          </div>
        </form>
      )}

      {/* Main Data Table */}
      {editError && (
        <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3">
          {editError}
        </div>
      )}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-200 border-b border-slate-800">
                <th className="p-3 text-center border-r border-slate-800 w-12">RANK</th>
                <th className="p-3 border-r border-slate-800 w-24 text-center">KODE ICD-10</th>
                <th className="p-3 border-r border-slate-800 min-w-[220px]">DIAGNOSA PENYAKIT</th>
                <th className="p-3 border-r border-slate-800 min-w-[150px]">PUSKESMAS</th>
                <th className="p-3 border-r border-slate-800 w-20 text-center">BULAN</th>
                <th className="p-3 border-r border-slate-800 text-center w-20">KASUS L</th>
                <th className="p-3 border-r border-slate-800 text-center w-20">KASUS P</th>
                <th className="p-3 border-r border-slate-800 text-center w-24 bg-slate-800/80 font-bold">TOTAL KASUS</th>
                <th className="p-3 text-center w-20">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length > 0 ? (
                filteredData.map((row, idx) => {
                  const isEditing = editingId === row.id;
                  const total = Number(row.kasusL) + Number(row.kasusP);

                  return (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 text-center font-extrabold text-slate-800 border-r border-slate-100">
                        <span className="w-6 h-6 rounded-full bg-slate-100 inline-flex items-center justify-center text-xs text-slate-700">
                          {row.peringkat || idx + 1}
                        </span>
                      </td>
                      <td className="p-2.5 border-r border-slate-100 text-center font-mono font-bold text-amber-700">
                        {isEditing ? (
                          <input type="text" value={row.icd10} onChange={e => handleFieldChange(row.id, 'icd10', e.target.value)} className="w-16 p-1 border rounded text-center font-mono" />
                        ) : row.icd10}
                      </td>
                      <td className="p-2.5 border-r border-slate-100 font-semibold text-slate-900">
                        {isEditing ? (
                          <input type="text" value={row.diagnosa} onChange={e => handleFieldChange(row.id, 'diagnosa', e.target.value)} className="w-full p-1 border rounded" />
                        ) : row.diagnosa}
                      </td>
                      <td className="p-2.5 border-r border-slate-100 text-slate-600 font-medium">{row.puskesmas}</td>
                      <td className="p-2.5 border-r border-slate-100 text-center text-slate-600">{row.month}</td>

                      <td className="p-2 border-r border-slate-100 text-center">
                        {isEditing ? (
                          <input type="number" min="0" value={row.kasusL} onChange={e => handleFieldChange(row.id, 'kasusL', Number(e.target.value))} className="w-14 text-center p-1 border rounded" />
                        ) : row.kasusL}
                      </td>

                      <td className="p-2 border-r border-slate-100 text-center">
                        {isEditing ? (
                          <input type="number" min="0" value={row.kasusP} onChange={e => handleFieldChange(row.id, 'kasusP', Number(e.target.value))} className="w-14 text-center p-1 border rounded" />
                        ) : row.kasusP}
                      </td>

                      <td className="p-2 border-r border-slate-100 text-center font-bold text-amber-800 bg-amber-50/50">
                        {total}
                      </td>

                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {isEditing ? (
                            <button onClick={() => handleSaveEdit(row)} disabled={editSavingId === row.id} className="p-1 text-amber-600 hover:bg-amber-50 rounded disabled:opacity-50"><Check className="w-3.5 h-3.5" /></button>
                          ) : (
                            <button onClick={() => setEditingId(row.id)} className="p-1 text-slate-400 hover:text-slate-600 rounded"><Edit3 className="w-3.5 h-3.5" /></button>
                          )}
                          <button onClick={() => handleDelete(row.id)} className="p-1 text-rose-400 hover:text-rose-600 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-slate-400">Tidak ada data surveilans penyakit terdaftar.</td>
                </tr>
              )}
            </tbody>

            {filteredData.length > 0 && (
              <tfoot>
                <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-800">
                  <td colSpan={5} className="p-3 text-right uppercase tracking-wider text-xs border-r border-slate-800">
                    TOTAL KASUS
                  </td>
                  <td className="p-2 text-center border-r border-slate-800 text-slate-200">{totalL}</td>
                  <td className="p-2 text-center border-r border-slate-800 text-slate-200">{totalP}</td>
                  <td className="p-2 text-center border-r border-slate-800 bg-amber-950 text-amber-300 font-extrabold">{totalL + totalP}</td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

    </div>
  );
};
