import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Search,
  Filter
} from 'lucide-react';
import { KunjunganRecord, MonthName, PUSKESMAS_LIST, MONTHS } from '../types';

interface KunjunganReportViewProps {
  data: KunjunganRecord[];
  setData: React.Dispatch<React.SetStateAction<KunjunganRecord[]>>;
  onCreateRecord: (payload: Omit<KunjunganRecord, 'id'>) => Promise<KunjunganRecord>;
  onUpdateRecord: (id: number, patch: Partial<KunjunganRecord>) => Promise<KunjunganRecord>;
  onDeleteRecord: (id: number) => Promise<void>;
  selectedMonth: MonthName | 'Semua';
  selectedPuskesmas: string;
}

export const KunjunganReportView: React.FC<KunjunganReportViewProps> = ({
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

  // New Record Form State
  const [newPkm, setNewPkm] = useState(PUSKESMAS_LIST[0]);
  const [newMonth, setNewMonth] = useState<MonthName>('Januari');
  const [rajalL, setRajalL] = useState(0);
  const [rajalP, setRajalP] = useState(0);
  const [ranapL, setRanapL] = useState(0);
  const [ranapP, setRanapP] = useState(0);
  const [jiwaL, setJiwaL] = useState(0);
  const [jiwaP, setJiwaP] = useState(0);

  // Filter records
  const filteredData = data.filter(item => {
    const matchMonth = selectedMonth === 'Semua' || item.month === selectedMonth;
    const matchPkm = selectedPuskesmas === 'Semua' || item.puskesmas === selectedPuskesmas;
    const matchSearch = item.puskesmas.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.month.toLowerCase().includes(searchQuery.toLowerCase());
    return matchMonth && matchPkm && matchSearch;
  });

  // Calculate totals
  const totalRajalL = filteredData.reduce((sum, d) => sum + d.rajalL, 0);
  const totalRajalP = filteredData.reduce((sum, d) => sum + d.rajalP, 0);
  const totalRanapL = filteredData.reduce((sum, d) => sum + d.ranapL, 0);
  const totalRanapP = filteredData.reduce((sum, d) => sum + d.ranapP, 0);
  const totalJiwaL = filteredData.reduce((sum, d) => sum + d.jiwaL, 0);
  const totalJiwaP = filteredData.reduce((sum, d) => sum + d.jiwaP, 0);

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setIsSaving(true);
    try {
      await onCreateRecord({
        puskesmas: newPkm,
        month: newMonth,
        year: 2026,
        rajalL: Number(rajalL),
        rajalP: Number(rajalP),
        ranapL: Number(ranapL),
        ranapP: Number(ranapP),
        jiwaL: Number(jiwaL),
        jiwaP: Number(jiwaP),
      });
      setShowAddForm(false);
      // Reset
      setRajalL(0); setRajalP(0); setRanapL(0); setRanapP(0); setJiwaL(0); setJiwaP(0);
    } catch (err: any) {
      setSaveError(err.message || 'Gagal menyimpan data ke server.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (id: number, field: keyof KunjunganRecord, val: any) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
  };

  const handleSaveEdit = async (row: KunjunganRecord) => {
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
    if (!window.confirm('Hapus data kunjungan ini secara permanen?')) return;
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
            <Users className="w-5 h-5 text-emerald-600" />
            <span>Laporan 1: Kunjungan Rawat Jalan, Rawat Inap, & Jiwa</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Format Pelaporan Resmi Pasien Baru Rawat Jalan (Rajal), Rawat Inap (Ranap), dan Kunjungan Gangguan Jiwa
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari Puskesmas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48"
            />
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Tutup Form' : 'Tambah Data'}</span>
          </button>
        </div>
      </div>

      {/* Add Record Drawer Form */}
      {showAddForm && (
        <form onSubmit={handleAddRecord} className="bg-emerald-50/70 border border-emerald-200 p-5 rounded-xl space-y-4">
          <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Input Data Kunjungan Baru</h3>

          {saveError && (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">
              {saveError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Puskesmas</label>
              <select 
                value={newPkm} 
                onChange={(e) => setNewPkm(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2"
              >
                {PUSKESMAS_LIST.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Bulan Pelaporan</label>
              <select 
                value={newMonth} 
                onChange={(e) => setNewMonth(e.target.value as MonthName)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2"
              >
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Rawat Jalan (L / P)</label>
              <div className="flex space-x-2">
                <input type="number" min="0" placeholder="Laki-laki" value={rajalL} onChange={e => setRajalL(Number(e.target.value))} className="w-1/2 p-2 bg-white border rounded-lg" />
                <input type="number" min="0" placeholder="Perempuan" value={rajalP} onChange={e => setRajalP(Number(e.target.value))} className="w-1/2 p-2 bg-white border rounded-lg" />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Rawat Inap (L / P)</label>
              <div className="flex space-x-2">
                <input type="number" min="0" placeholder="Laki-laki" value={ranapL} onChange={e => setRanapL(Number(e.target.value))} className="w-1/2 p-2 bg-white border rounded-lg" />
                <input type="number" min="0" placeholder="Perempuan" value={ranapP} onChange={e => setRanapP(Number(e.target.value))} className="w-1/2 p-2 bg-white border rounded-lg" />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Gangguan Jiwa (L / P)</label>
              <div className="flex space-x-2">
                <input type="number" min="0" placeholder="Laki-laki" value={jiwaL} onChange={e => setJiwaL(Number(e.target.value))} className="w-1/2 p-2 bg-white border rounded-lg" />
                <input type="number" min="0" placeholder="Perempuan" value={jiwaP} onChange={e => setJiwaP(Number(e.target.value))} className="w-1/2 p-2 bg-white border rounded-lg" />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-slate-600 bg-white border rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 disabled:opacity-60"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Entri'}
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
                <th rowSpan={2} className="p-3 text-center border-r border-slate-800 w-10">NO</th>
                <th rowSpan={2} className="p-3 border-r border-slate-800 min-w-[160px]">PUSKESMAS</th>
                <th rowSpan={2} className="p-3 border-r border-slate-800 w-24">BULAN</th>
                <th colSpan={3} className="p-2 text-center border-r border-slate-800 bg-slate-800/80">RAWAT JALAN</th>
                <th colSpan={3} className="p-2 text-center border-r border-slate-800 bg-slate-800/60">RAWAT INAP</th>
                <th colSpan={3} className="p-2 text-center border-r border-slate-800 bg-slate-800/40">GANGGUAN JIWA</th>
                <th rowSpan={2} className="p-3 text-center w-20">AKSI</th>
              </tr>
              <tr className="bg-slate-800/90 text-slate-300 border-b border-slate-700 text-[11px] text-center font-semibold">
                <th className="p-2 border-r border-slate-700 w-14">L</th>
                <th className="p-2 border-r border-slate-700 w-14">P</th>
                <th className="p-2 border-r border-slate-700 bg-slate-700/50 w-16">TOTAL</th>
                <th className="p-2 border-r border-slate-700 w-14">L</th>
                <th className="p-2 border-r border-slate-700 w-14">P</th>
                <th className="p-2 border-r border-slate-700 bg-slate-700/50 w-16">TOTAL</th>
                <th className="p-2 border-r border-slate-700 w-14">L</th>
                <th className="p-2 border-r border-slate-700 w-14">P</th>
                <th className="p-2 border-r border-slate-700 bg-slate-700/50 w-16">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length > 0 ? (
                filteredData.map((row, idx) => {
                  const isEditing = editingId === row.id;
                  const totalRajal = Number(row.rajalL) + Number(row.rajalP);
                  const totalRanap = Number(row.ranapL) + Number(row.ranapP);
                  const totalJiwa = Number(row.jiwaL) + Number(row.jiwaP);

                  return (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 text-center font-medium text-slate-500 border-r border-slate-100">{idx + 1}</td>
                      <td className="p-2.5 font-bold text-slate-800 border-r border-slate-100">{row.puskesmas}</td>
                      <td className="p-2.5 border-r border-slate-100 font-medium text-slate-600">{row.month}</td>

                      {/* Rajal L/P */}
                      <td className="p-2 border-r border-slate-100 text-center">
                        {isEditing ? (
                          <input type="number" min="0" value={row.rajalL} onChange={e => handleFieldChange(row.id, 'rajalL', Number(e.target.value))} className="w-12 text-center p-1 border rounded" />
                        ) : row.rajalL}
                      </td>
                      <td className="p-2 border-r border-slate-100 text-center">
                        {isEditing ? (
                          <input type="number" min="0" value={row.rajalP} onChange={e => handleFieldChange(row.id, 'rajalP', Number(e.target.value))} className="w-12 text-center p-1 border rounded" />
                        ) : row.rajalP}
                      </td>
                      <td className="p-2 border-r border-slate-100 text-center font-bold text-emerald-700 bg-emerald-50/40">{totalRajal}</td>

                      {/* Ranap L/P */}
                      <td className="p-2 border-r border-slate-100 text-center">
                        {isEditing ? (
                          <input type="number" min="0" value={row.ranapL} onChange={e => handleFieldChange(row.id, 'ranapL', Number(e.target.value))} className="w-12 text-center p-1 border rounded" />
                        ) : row.ranapL}
                      </td>
                      <td className="p-2 border-r border-slate-100 text-center">
                        {isEditing ? (
                          <input type="number" min="0" value={row.ranapP} onChange={e => handleFieldChange(row.id, 'ranapP', Number(e.target.value))} className="w-12 text-center p-1 border rounded" />
                        ) : row.ranapP}
                      </td>
                      <td className="p-2 border-r border-slate-100 text-center font-bold text-teal-700 bg-teal-50/40">{totalRanap}</td>

                      {/* Jiwa L/P */}
                      <td className="p-2 border-r border-slate-100 text-center">
                        {isEditing ? (
                          <input type="number" min="0" value={row.jiwaL} onChange={e => handleFieldChange(row.id, 'jiwaL', Number(e.target.value))} className="w-12 text-center p-1 border rounded" />
                        ) : row.jiwaL}
                      </td>
                      <td className="p-2 border-r border-slate-100 text-center">
                        {isEditing ? (
                          <input type="number" min="0" value={row.jiwaP} onChange={e => handleFieldChange(row.id, 'jiwaP', Number(e.target.value))} className="w-12 text-center p-1 border rounded" />
                        ) : row.jiwaP}
                      </td>
                      <td className="p-2 border-r border-slate-100 text-center font-bold text-purple-700 bg-purple-50/40">{totalJiwa}</td>

                      {/* Actions */}
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {isEditing ? (
                            <button onClick={() => handleSaveEdit(row)} disabled={editSavingId === row.id} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded disabled:opacity-50" title="Selesai Edit">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button onClick={() => setEditingId(row.id)} className="p-1 text-slate-400 hover:text-slate-600 rounded" title="Edit Baris">
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button onClick={() => handleDelete(row.id)} className="p-1 text-rose-400 hover:text-rose-600 rounded" title="Hapus">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={13} className="p-6 text-center text-slate-400">
                    Tidak ada data kunjungan yang sesuai kriteria filter.
                  </td>
                </tr>
              )}
            </tbody>

            {/* Total Footer Row */}
            {filteredData.length > 0 && (
              <tfoot>
                <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-800">
                  <td colSpan={3} className="p-3 text-right uppercase tracking-wider text-xs border-r border-slate-800">
                    TOTAL KABUPATEN ROTE NDAO
                  </td>
                  <td className="p-2 text-center border-r border-slate-800 text-emerald-300">{totalRajalL}</td>
                  <td className="p-2 text-center border-r border-slate-800 text-emerald-300">{totalRajalP}</td>
                  <td className="p-2 text-center border-r border-slate-800 bg-emerald-950 text-emerald-200">{totalRajalL + totalRajalP}</td>

                  <td className="p-2 text-center border-r border-slate-800 text-teal-300">{totalRanapL}</td>
                  <td className="p-2 text-center border-r border-slate-800 text-teal-300">{totalRanapP}</td>
                  <td className="p-2 text-center border-r border-slate-800 bg-teal-950 text-teal-200">{totalRanapL + totalRanapP}</td>

                  <td className="p-2 text-center border-r border-slate-800 text-purple-300">{totalJiwaL}</td>
                  <td className="p-2 text-center border-r border-slate-800 text-purple-300">{totalJiwaP}</td>
                  <td className="p-2 text-center border-r border-slate-800 bg-purple-950 text-purple-200">{totalJiwaL + totalJiwaP}</td>
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
