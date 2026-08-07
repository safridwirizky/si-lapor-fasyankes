import React, { useState, useEffect, useRef } from 'react';
import { 
  TestTube2, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Search,
  ChevronDown
} from 'lucide-react';
import { LabRecord, MonthName, PUSKESMAS_LIST, MONTHS } from '../types';

interface LaboratoriumReportViewProps {
  data: LabRecord[];
  setData: React.Dispatch<React.SetStateAction<LabRecord[]>>;
  onCreateRecord: (payload: Omit<LabRecord, 'id'>) => Promise<LabRecord>;
  onUpdateRecord: (id: number, patch: Partial<LabRecord>) => Promise<LabRecord>;
  onDeleteRecord: (id: number) => Promise<void>;
  selectedMonth: MonthName | 'Semua';
  selectedPuskesmas: string;
}

const COMMON_LAB_TESTS = [
  'Total Kunjungan Laboratorium',
  'Pemeriksaan Hemoglobin (Hb)',
  'Pemeriksaan Leukosit',
  'Pemeriksaan Trombosit',
  'Pemeriksaan Gula Darah (GDA/GDP)',
  'Pemeriksaan Kolesterol Total',
  'Pemeriksaan Asam Urat',
  'Pemeriksaan Urin Rutin',
  'Pemeriksaan BTA Sputum',
  'Pemeriksaan Malaria (RDT / Mikroskopis)',
  'Pemeriksaan HIV (RDT)',
  'Pemeriksaan Syphilis (RDT)',
  'Pemeriksaan HBsAg'
];

export const LaboratoriumReportView: React.FC<LaboratoriumReportViewProps> = ({
  data,
  setData,
  onCreateRecord,
  onUpdateRecord,
  onDeleteRecord,
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
  const [elemenData, setElemenData] = useState('');
  const [kasusL, setKasusL] = useState(0);
  const [kasusP, setKasusP] = useState(0);

  // Combobox custom (ganti <input list>+<datalist> bawaan browser yang
  // tampilannya kaku & tidak bisa distyle) -- ketik bebas ATAU pilih dari
  // daftar preset, hasil filter otomatis sesuai ketikan.
  const [elemenDropdownOpen, setElemenDropdownOpen] = useState(false);
  const elemenBoxRef = useRef<HTMLDivElement>(null);
  const filteredLabTests = COMMON_LAB_TESTS.filter(t =>
    t.toLowerCase().includes(elemenData.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (elemenBoxRef.current && !elemenBoxRef.current.contains(e.target as Node)) {
        setElemenDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredData = data.filter(item => {
    const matchMonth = selectedMonth === 'Semua' || item.month === selectedMonth;
    const matchPkm = selectedPuskesmas === 'Semua' || item.puskesmas === selectedPuskesmas;
    const q = searchQuery.toLowerCase();
    const matchSearch = item.puskesmas.toLowerCase().includes(q) ||
                        item.elemenData.toLowerCase().includes(q);
    return matchMonth && matchPkm && matchSearch;
  });

  const totalL = filteredData.reduce((s, d) => s + d.jumlahL, 0);
  const totalP = filteredData.reduce((s, d) => s + d.jumlahP, 0);

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!elemenData.trim()) {
      setSaveError('Jenis Pemeriksaan (Elemen Data) tidak boleh kosong.');
      return;
    }
    setSaveError(null);
    setIsSaving(true);
    try {
      await onCreateRecord({
        puskesmas: newPkm,
        month: newMonth,
        year: 2026,
        elemenData,
        jumlahL: Number(kasusL),
        jumlahP: Number(kasusP),
      });
      setShowAddForm(false);
      setElemenData('');
      setKasusL(0);
      setKasusP(0);
    } catch (err: any) {
      setSaveError(err.message || 'Gagal menyimpan data ke server.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (id: number, field: keyof LabRecord, val: any) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
  };

  const handleSaveEdit = async (row: LabRecord) => {
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
    if (!window.confirm('Hapus data pemeriksaan laboratorium ini secara permanen?')) return;
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
            <TestTube2 className="w-5 h-5 text-blue-600" />
            <span>Laporan 4: Pelayanan Laboratorium Puskesmas</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rekapitulasi Volume Pemeriksaan Spesimen & Laboratorium Klinik per Jenis Elemen Data
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari Jenis Pemeriksaan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
            />
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Tutup Form' : 'Tambah Pemeriksaan'}</span>
          </button>
        </div>
      </div>

      {/* Add Drawer */}
      {showAddForm && (
        <form onSubmit={handleAddRecord} className="bg-blue-50/70 border border-blue-200 p-5 rounded-xl space-y-4">
          <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Entri Hasil Pemeriksaan Laboratorium</h3>

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

            <div className="lg:col-span-2 relative" ref={elemenBoxRef}>
              <label className="block text-slate-700 font-medium mb-1">Jenis Pemeriksaan (Elemen Data)</label>
              <div className="relative">
                <input
                  type="text"
                  value={elemenData}
                  onChange={e => { setElemenData(e.target.value); setElemenDropdownOpen(true); }}
                  onFocus={() => setElemenDropdownOpen(true)}
                  placeholder="Ketik atau pilih dari daftar..."
                  className="w-full bg-white border p-2 pr-8 rounded-lg"
                  autoComplete="off"
                />
                <ChevronDown
                  onClick={() => setElemenDropdownOpen(o => !o)}
                  className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                />
              </div>

              {elemenDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                  {filteredLabTests.length > 0 ? (
                    filteredLabTests.map(t => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => { setElemenData(t); setElemenDropdownOpen(false); }}
                        className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-slate-100 last:border-b-0 text-slate-700"
                      >
                        {t}
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-slate-400">Tidak ada preset cocok -- teks yang kamu ketik tetap dipakai.</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Jumlah Laki-laki (L)</label>
              <input type="number" min="0" value={kasusL} onChange={e => setKasusL(Number(e.target.value))} className="w-full bg-white border p-2 rounded-lg" />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Jumlah Perempuan (P)</label>
              <input type="number" min="0" value={kasusP} onChange={e => setKasusP(Number(e.target.value))} className="w-full bg-white border p-2 rounded-lg" />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-3 py-1.5 text-xs text-slate-600 bg-white border rounded-lg">Batal</button>
            <button type="submit" disabled={isSaving} className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-60">
              {isSaving ? 'Menyimpan...' : 'Simpan Data Lab'}
            </button>
          </div>
        </form>
      )}

      {/* Main Table */}
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
                <th className="p-3 text-center border-r border-slate-800 w-10">NO</th>
                <th className="p-3 border-r border-slate-800 min-w-[220px]">ELEMEN DATA / PEMERIKSAAN</th>
                <th className="p-3 border-r border-slate-800 min-w-[160px]">PUSKESMAS</th>
                <th className="p-3 border-r border-slate-800 w-24 text-center">BULAN</th>
                <th className="p-3 border-r border-slate-800 text-center w-24">LAKI-LAKI</th>
                <th className="p-3 border-r border-slate-800 text-center w-24">PEREMPUAN</th>
                <th className="p-3 border-r border-slate-800 text-center w-28 bg-slate-800/80 font-bold">TOTAL</th>
                <th className="p-3 text-center w-20">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length > 0 ? (
                filteredData.map((row, idx) => {
                  const isEditing = editingId === row.id;
                  const total = Number(row.jumlahL) + Number(row.jumlahP);
                  const isTotalRow = row.elemenData.toLowerCase().includes('total kunjungan');

                  return (
                    <tr key={row.id} className={`hover:bg-slate-50 transition-colors ${isTotalRow ? 'bg-blue-50/30 font-semibold' : ''}`}>
                      <td className="p-2.5 text-center font-medium text-slate-500 border-r border-slate-100">{idx + 1}</td>
                      <td className="p-2.5 border-r border-slate-100 font-semibold text-slate-900">
                        {isEditing ? (
                          <input type="text" value={row.elemenData} onChange={e => handleFieldChange(row.id, 'elemenData', e.target.value)} className="w-full p-1 border rounded" />
                        ) : row.elemenData}
                      </td>
                      <td className="p-2.5 border-r border-slate-100 text-slate-600">{row.puskesmas}</td>
                      <td className="p-2.5 border-r border-slate-100 text-center text-slate-600">{row.month}</td>

                      <td className="p-2 border-r border-slate-100 text-center">
                        {isEditing ? (
                          <input type="number" min="0" value={row.jumlahL} onChange={e => handleFieldChange(row.id, 'jumlahL', Number(e.target.value))} className="w-16 text-center p-1 border rounded" />
                        ) : row.jumlahL}
                      </td>

                      <td className="p-2 border-r border-slate-100 text-center">
                        {isEditing ? (
                          <input type="number" min="0" value={row.jumlahP} onChange={e => handleFieldChange(row.id, 'jumlahP', Number(e.target.value))} className="w-16 text-center p-1 border rounded" />
                        ) : row.jumlahP}
                      </td>

                      <td className="p-2 border-r border-slate-100 text-center font-bold text-blue-800 bg-blue-50/50">
                        {total}
                      </td>

                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {isEditing ? (
                            <button onClick={() => handleSaveEdit(row)} disabled={editSavingId === row.id} className="p-1 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"><Check className="w-3.5 h-3.5" /></button>
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
                  <td colSpan={8} className="p-6 text-center text-slate-400">Tidak ada data laboratorium terdata.</td>
                </tr>
              )}
            </tbody>

            {filteredData.length > 0 && (
              <tfoot>
                <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-800">
                  <td colSpan={4} className="p-3 text-right uppercase tracking-wider text-xs border-r border-slate-800">
                    TOTAL KESELURUHAN
                  </td>
                  <td className="p-2 text-center border-r border-slate-800 text-slate-200">{totalL}</td>
                  <td className="p-2 text-center border-r border-slate-800 text-slate-200">{totalP}</td>
                  <td className="p-2 text-center border-r border-slate-800 bg-blue-950 text-blue-300 font-extrabold">{totalL + totalP}</td>
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
