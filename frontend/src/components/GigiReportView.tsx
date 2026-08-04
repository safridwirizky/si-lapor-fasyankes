import React, { useState } from 'react';
import { 
  Smile, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Search,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { GigiRecord, MonthName, PUSKESMAS_LIST, MONTHS } from '../types';

interface GigiReportViewProps {
  data: GigiRecord[];
  setData: React.Dispatch<React.SetStateAction<GigiRecord[]>>;
  onCreateRecord: (payload: Omit<GigiRecord, 'id' | 'rasioTumpatanPencabutan' | 'persenKasusDirujuk'>) => Promise<GigiRecord>;
  onUpdateRecord: (id: number, patch: Partial<GigiRecord>) => Promise<GigiRecord>;
  onDeleteRecord: (id: number) => Promise<void>;
  selectedMonth: MonthName | 'Semua';
  selectedPuskesmas: string;
}

export const GigiReportView: React.FC<GigiReportViewProps> = ({
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
  const [tumpatan, setTumpatan] = useState(0);
  const [pencabutan, setPencabutan] = useState(0);
  const [kunjungan, setKunjungan] = useState(0);
  const [kasus, setKasus] = useState(0);
  const [rujuk, setRujuk] = useState(0);

  const filteredData = data.filter(item => {
    const matchMonth = selectedMonth === 'Semua' || item.month === selectedMonth;
    const matchPkm = selectedPuskesmas === 'Semua' || item.puskesmas === selectedPuskesmas;
    const matchSearch = item.puskesmas.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.month.toLowerCase().includes(searchQuery.toLowerCase());
    return matchMonth && matchPkm && matchSearch;
  });

  const totalTumpatan = filteredData.reduce((s, d) => s + d.tumpatanGigiTetap, 0);
  const totalPencabutan = filteredData.reduce((s, d) => s + d.pencabutanGigiTetap, 0);
  const totalKunjungan = filteredData.reduce((s, d) => s + d.jumlahKunjungan, 0);
  const totalKasus = filteredData.reduce((s, d) => s + d.jumlahKasusGigi, 0);
  const totalRujuk = filteredData.reduce((s, d) => s + d.jumlahKasusDirujuk, 0);

  const overallRatio = totalPencabutan > 0 ? (totalTumpatan / totalPencabutan).toFixed(2) : totalTumpatan.toFixed(2);
  const overallRujukanPct = totalKasus > 0 ? ((totalRujuk / totalKasus) * 100).toFixed(1) + '%' : '0%';

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setIsSaving(true);
    try {
      await onCreateRecord({
        puskesmas: newPkm,
        month: newMonth,
        year: 2026,
        tumpatanGigiTetap: Number(tumpatan),
        pencabutanGigiTetap: Number(pencabutan),
        jumlahKunjungan: Number(kunjungan || Number(tumpatan) + Number(pencabutan)),
        jumlahKasusGigi: Number(kasus || Number(kunjungan)),
        jumlahKasusDirujuk: Number(rujuk),
      });
      setShowAddForm(false);
      setTumpatan(0); setPencabutan(0); setKunjungan(0); setKasus(0); setRujuk(0);
    } catch (err: any) {
      setSaveError(err.message || 'Gagal menyimpan data ke server.');
    } finally {
      setIsSaving(false);
    }
  };

  // handleFieldChange tetap update state lokal secara instan (biar UI terasa
  // responsif saat mengetik), baru saat tombol centang (selesai edit) diklik,
  // handleSaveEdit yang benar-benar kirim PATCH ke Django dengan isi baris
  // terkini. Kalau PATCH gagal, baris TIDAK keluar dari mode edit supaya
  // orang bisa coba lagi / lihat pesan errornya.
  const handleFieldChange = (id: number, field: keyof GigiRecord, val: any) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
  };

  const handleSaveEdit = async (row: GigiRecord) => {
    setEditError(null);
    setEditSavingId(row.id);
    try {
      // rasioTumpatanPencabutan & persenKasusDirujuk dihitung backend
      // (read-only di serializer), jadi tidak perlu -- dan tidak boleh --
      // ikut dikirim di body PATCH.
      const { id, rasioTumpatanPencabutan, persenKasusDirujuk, ...patch } = row;
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
    if (!window.confirm('Hapus data laporan gigi ini secara permanen?')) return;
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
            <Smile className="w-5 h-5 text-teal-600" />
            <span>Laporan 2: Pelayanan Kesehatan Gigi & Mulut</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluasi Mutu Pelayanan Gigi: Rasio Tumpatan vs Pencabutan Gigi Tetap (Target Standar Kemenkes ≥ 1.0)
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
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-48"
            />
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Tutup Form' : 'Tambah Data'}</span>
          </button>
        </div>
      </div>

      {/* Add Record Form */}
      {showAddForm && (
        <form onSubmit={handleAddRecord} className="bg-teal-50/70 border border-teal-200 p-5 rounded-xl space-y-4">
          <h3 className="text-xs font-bold text-teal-900 uppercase tracking-wider">Input Laporan Kesehatan Gigi Baru</h3>

          {saveError && (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">
              {saveError}
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
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

            <div>
              <label className="block text-slate-700 font-medium mb-1">Tumpatan Gigi Tetap</label>
              <input type="number" min="0" value={tumpatan} onChange={e => setTumpatan(Number(e.target.value))} className="w-full bg-white border p-2 rounded-lg" />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Pencabutan Gigi Tetap</label>
              <input type="number" min="0" value={pencabutan} onChange={e => setPencabutan(Number(e.target.value))} className="w-full bg-white border p-2 rounded-lg" />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Jumlah Kasus Gigi</label>
              <input type="number" min="0" value={kasus} onChange={e => setKasus(Number(e.target.value))} className="w-full bg-white border p-2 rounded-lg" />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Jumlah Kasus Dirujuk</label>
              <input type="number" min="0" value={rujuk} onChange={e => setRujuk(Number(e.target.value))} className="w-full bg-white border p-2 rounded-lg" />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-3 py-1.5 text-xs text-slate-600 bg-white border rounded-lg">Batal</button>
            <button type="submit" disabled={isSaving} className="px-4 py-1.5 text-xs font-semibold bg-teal-600 text-white rounded-lg hover:bg-teal-500 disabled:opacity-60">
              {isSaving ? 'Menyimpan...' : 'Simpan Laporan'}
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
                <th className="p-3 text-center border-r border-slate-800 w-10">NO</th>
                <th className="p-3 border-r border-slate-800 min-w-[160px]">PUSKESMAS</th>
                <th className="p-3 border-r border-slate-800 w-24">BULAN</th>
                <th className="p-3 border-r border-slate-800 text-center">TUMPATAN GIGI TETAP</th>
                <th className="p-3 border-r border-slate-800 text-center">PENCABUTAN GIGI TETAP</th>
                <th className="p-3 border-r border-slate-800 text-center bg-slate-800/80">JUMLAH KUNJUNGAN</th>
                <th className="p-3 border-r border-slate-800 text-center bg-slate-800/60">RASIO (TUMPATAN/CABUT)</th>
                <th className="p-3 border-r border-slate-800 text-center">JUMLAH KASUS GIGI</th>
                <th className="p-3 border-r border-slate-800 text-center">KASUS DIRUJUK</th>
                <th className="p-3 border-r border-slate-800 text-center">% DIRUJUK</th>
                <th className="p-3 text-center w-20">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length > 0 ? (
                filteredData.map((row, idx) => {
                  const isEditing = editingId === row.id;
                  const ratioVal = row.pencabutanGigiTetap > 0 
                    ? (row.tumpatanGigiTetap / row.pencabutanGigiTetap) 
                    : row.tumpatanGigiTetap;
                  const ratioFormatted = ratioVal.toFixed(2);
                  const isRatioGood = ratioVal >= 1.0;

                  const rujukanPct = row.jumlahKasusGigi > 0 
                    ? ((row.jumlahKasusDirujuk / row.jumlahKasusGigi) * 100).toFixed(1) + '%' 
                    : '0%';

                  return (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 text-center font-medium text-slate-500 border-r border-slate-100">{idx + 1}</td>
                      <td className="p-2.5 font-bold text-slate-800 border-r border-slate-100">{row.puskesmas}</td>
                      <td className="p-2.5 border-r border-slate-100 font-medium text-slate-600">{row.month}</td>

                      <td className="p-2 border-r border-slate-100 text-center font-semibold text-emerald-700">
                        {isEditing ? (
                          <input type="number" min="0" value={row.tumpatanGigiTetap} onChange={e => handleFieldChange(row.id, 'tumpatanGigiTetap', Number(e.target.value))} className="w-16 text-center p-1 border rounded" />
                        ) : row.tumpatanGigiTetap}
                      </td>

                      <td className="p-2 border-r border-slate-100 text-center font-semibold text-amber-700">
                        {isEditing ? (
                          <input type="number" min="0" value={row.pencabutanGigiTetap} onChange={e => handleFieldChange(row.id, 'pencabutanGigiTetap', Number(e.target.value))} className="w-16 text-center p-1 border rounded" />
                        ) : row.pencabutanGigiTetap}
                      </td>

                      <td className="p-2 border-r border-slate-100 text-center font-bold text-slate-800 bg-slate-50">
                        {row.jumlahKunjungan || (row.tumpatanGigiTetap + row.pencabutanGigiTetap)}
                      </td>

                      <td className="p-2 border-r border-slate-100 text-center">
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full font-bold text-xs ${
                          isRatioGood 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {isRatioGood ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <AlertTriangle className="w-3 h-3 text-amber-600" />}
                          <span>{ratioFormatted}</span>
                        </span>
                      </td>

                      <td className="p-2 border-r border-slate-100 text-center">
                        {isEditing ? (
                          <input type="number" min="0" value={row.jumlahKasusGigi} onChange={e => handleFieldChange(row.id, 'jumlahKasusGigi', Number(e.target.value))} className="w-16 text-center p-1 border rounded" />
                        ) : row.jumlahKasusGigi}
                      </td>

                      <td className="p-2 border-r border-slate-100 text-center">
                        {isEditing ? (
                          <input type="number" min="0" value={row.jumlahKasusDirujuk} onChange={e => handleFieldChange(row.id, 'jumlahKasusDirujuk', Number(e.target.value))} className="w-16 text-center p-1 border rounded" />
                        ) : row.jumlahKasusDirujuk}
                      </td>

                      <td className="p-2 border-r border-slate-100 text-center font-medium text-slate-600">
                        {rujukanPct}
                      </td>

                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {isEditing ? (
                            <button onClick={() => handleSaveEdit(row)} disabled={editSavingId === row.id} className="p-1 text-teal-600 hover:bg-teal-50 rounded disabled:opacity-50"><Check className="w-3.5 h-3.5" /></button>
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
                  <td colSpan={11} className="p-6 text-center text-slate-400">Tidak ada data kesehatan gigi terdata.</td>
                </tr>
              )}
            </tbody>

            {filteredData.length > 0 && (
              <tfoot>
                <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-800">
                  <td colSpan={3} className="p-3 text-right uppercase tracking-wider text-xs border-r border-slate-800">
                    TOTAL KABUPATEN ROTE NDAO
                  </td>
                  <td className="p-2 text-center border-r border-slate-800 text-emerald-300">{totalTumpatan}</td>
                  <td className="p-2 text-center border-r border-slate-800 text-amber-300">{totalPencabutan}</td>
                  <td className="p-2 text-center border-r border-slate-800 text-slate-200">{totalKunjungan}</td>
                  <td className="p-2 text-center border-r border-slate-800 text-teal-300 font-extrabold">{overallRatio}</td>
                  <td className="p-2 text-center border-r border-slate-800 text-slate-200">{totalKasus}</td>
                  <td className="p-2 text-center border-r border-slate-800 text-rose-300">{totalRujuk}</td>
                  <td className="p-2 text-center border-r border-slate-800 text-slate-300">{overallRujukanPct}</td>
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
