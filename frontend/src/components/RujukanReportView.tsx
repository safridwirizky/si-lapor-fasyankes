import React, { useState } from 'react';
import { 
  Share2, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Search,
  Building 
} from 'lucide-react';
import { RujukanRecord, MonthName, PUSKESMAS_LIST, MONTHS } from '../types';

interface RujukanReportViewProps {
  data: RujukanRecord[];
  setData: React.Dispatch<React.SetStateAction<RujukanRecord[]>>;
  onCreateRecord: (payload: Omit<RujukanRecord, 'id'>) => Promise<RujukanRecord>;
  selectedMonth: MonthName | 'Semua';
  selectedPuskesmas: string;
}

const COMMON_FASKES = [
  'RSUD KAB. ROTE NDAO',
  'RSUD PROF DR WZ JOHANNES',
  'RST WIRA SAKTI KUPANG',
  'RS SILOAM KUPANG',
  'PUSKESMAS LAINNYA'
];

export const RujukanReportView: React.FC<RujukanReportViewProps> = ({
  data,
  setData,
  onCreateRecord,
  selectedMonth,
  selectedPuskesmas
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Form state
  const [newPkm, setNewPkm] = useState(PUSKESMAS_LIST[0]);
  const [newMonth, setNewMonth] = useState<MonthName>('Januari');
  // NOTE: nama state tetap "faskesTujuan" demi ringkas, tapi field yang
  // dikirim ke API (dan dibaca dari data) HARUS "namaFaskesTujuan" -- itu
  // nama field asli sesuai types.ts & serializer Django.
  const [faskesTujuan, setFaskesTujuan] = useState(COMMON_FASKES[0]);
  const [umumL, setUmumL] = useState(0);
  const [umumP, setUmumP] = useState(0);
  const [bpjsL, setBpjsL] = useState(0);
  const [bpjsP, setBpjsP] = useState(0);
  const [sktmL, setSktmL] = useState(0);
  const [sktmP, setSktmP] = useState(0);

  const filteredData = data.filter(item => {
    const matchMonth = selectedMonth === 'Semua' || item.month === selectedMonth;
    const matchPkm = selectedPuskesmas === 'Semua' || item.puskesmas === selectedPuskesmas;
    const q = searchQuery.toLowerCase();
    const matchSearch = item.puskesmas.toLowerCase().includes(q) ||
                        item.namaFaskesTujuan.toLowerCase().includes(q);
    return matchMonth && matchPkm && matchSearch;
  });

  const totalUmumL = filteredData.reduce((s, d) => s + d.umumL, 0);
  const totalUmumP = filteredData.reduce((s, d) => s + d.umumP, 0);
  const totalBpjsL = filteredData.reduce((s, d) => s + d.bpjsL, 0);
  const totalBpjsP = filteredData.reduce((s, d) => s + d.bpjsP, 0);
  const totalSktmL = filteredData.reduce((s, d) => s + d.sktmL, 0);
  const totalSktmP = filteredData.reduce((s, d) => s + d.sktmP, 0);

  const grandTotal = totalUmumL + totalUmumP + totalBpjsL + totalBpjsP + totalSktmL + totalSktmP;

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setIsSaving(true);
    try {
      await onCreateRecord({
        puskesmas: newPkm,
        namaFaskesTujuan: faskesTujuan,
        month: newMonth,
        year: 2026,
        umumL: Number(umumL),
        umumP: Number(umumP),
        bpjsL: Number(bpjsL),
        bpjsP: Number(bpjsP),
        sktmL: Number(sktmL),
        sktmP: Number(sktmP),
      });
      setShowAddForm(false);
    } catch (err: any) {
      setSaveError(err.message || 'Gagal menyimpan data ke server.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (id: string, field: keyof RujukanRecord, val: any) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
  };

  const handleDelete = (id: string) => {
    setData(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-purple-600" />
            <span>Laporan 5: Sistem Pelaporan Rujukan Fasyankes</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rekapitulasi Rujukan Pasien Puskesmas berdasarkan Rumah Sakit Rujukan & Skema Pembiayaan (Umum, BPJS/KIS, SKTM)
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari Faskes / Puskesmas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-52"
            />
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Tutup Form' : 'Tambah Rujukan'}</span>
          </button>
        </div>
      </div>

      {/* Add Drawer */}
      {showAddForm && (
        <form onSubmit={handleAddRecord} className="bg-purple-50/70 border border-purple-200 p-5 rounded-xl space-y-4">
          <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider">Entri Laporan Rujukan Pasien Baru</h3>

          {saveError && (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">
              {saveError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Puskesmas Asal</label>
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

            <div className="lg:col-span-2">
              <label className="block text-slate-700 font-medium mb-1">Nama Faskes Tujuan Rujukan</label>
              <input
                type="text"
                list="faskes-presets"
                value={faskesTujuan}
                onChange={e => setFaskesTujuan(e.target.value)}
                className="w-full bg-white border p-2 rounded-lg"
              />
              <datalist id="faskes-presets">
                {COMMON_FASKES.map(f => <option key={f} value={f} />)}
              </datalist>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Pasien UMUM (L / P)</label>
              <div className="flex space-x-2">
                <input type="number" min="0" placeholder="L" value={umumL} onChange={e => setUmumL(Number(e.target.value))} className="w-1/2 p-2 bg-white border rounded-lg" />
                <input type="number" min="0" placeholder="P" value={umumP} onChange={e => setUmumP(Number(e.target.value))} className="w-1/2 p-2 bg-white border rounded-lg" />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Pasien BPJS/KIS (L / P)</label>
              <div className="flex space-x-2">
                <input type="number" min="0" placeholder="L" value={bpjsL} onChange={e => setBpjsL(Number(e.target.value))} className="w-1/2 p-2 bg-white border rounded-lg" />
                <input type="number" min="0" placeholder="P" value={bpjsP} onChange={e => setBpjsP(Number(e.target.value))} className="w-1/2 p-2 bg-white border rounded-lg" />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Pasien SKTM (L / P)</label>
              <div className="flex space-x-2">
                <input type="number" min="0" placeholder="L" value={sktmL} onChange={e => setSktmL(Number(e.target.value))} className="w-1/2 p-2 bg-white border rounded-lg" />
                <input type="number" min="0" placeholder="P" value={sktmP} onChange={e => setSktmP(Number(e.target.value))} className="w-1/2 p-2 bg-white border rounded-lg" />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-3 py-1.5 text-xs text-slate-600 bg-white border rounded-lg">Batal</button>
            <button type="submit" disabled={isSaving} className="px-4 py-1.5 text-xs font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-500 disabled:opacity-60">
              {isSaving ? 'Menyimpan...' : 'Simpan Rujukan'}
            </button>
          </div>
        </form>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-200 border-b border-slate-800">
                <th rowSpan={2} className="p-3 text-center border-r border-slate-800 w-10">NO</th>
                <th rowSpan={2} className="p-3 border-r border-slate-800 min-w-[150px]">PUSKESMAS ASAL</th>
                <th rowSpan={2} className="p-3 border-r border-slate-800 min-w-[180px]">FASKES TUJUAN</th>
                <th rowSpan={2} className="p-3 border-r border-slate-800 w-20 text-center">BULAN</th>
                <th colSpan={2} className="p-2 text-center border-r border-slate-800 bg-slate-800/80">UMUM</th>
                <th colSpan={2} className="p-2 text-center border-r border-slate-800 bg-slate-800/60">BPJS / KIS</th>
                <th colSpan={2} className="p-2 text-center border-r border-slate-800 bg-slate-800/40">SKTM</th>
                <th rowSpan={2} className="p-3 border-r border-slate-800 text-center w-20 bg-slate-800/90 font-bold">TOTAL</th>
                <th rowSpan={2} className="p-3 text-center w-20">AKSI</th>
              </tr>
              <tr className="bg-slate-800/90 text-slate-300 border-b border-slate-700 text-[11px] text-center font-semibold">
                <th className="p-2 border-r border-slate-700 w-12">L</th>
                <th className="p-2 border-r border-slate-700 w-12">P</th>
                <th className="p-2 border-r border-slate-700 w-12">L</th>
                <th className="p-2 border-r border-slate-700 w-12">P</th>
                <th className="p-2 border-r border-slate-700 w-12">L</th>
                <th className="p-2 border-r border-slate-700 w-12">P</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length > 0 ? (
                filteredData.map((row, idx) => {
                  const isEditing = editingId === row.id;
                  const total = Number(row.umumL) + Number(row.umumP) + 
                                Number(row.bpjsL) + Number(row.bpjsP) + 
                                Number(row.sktmL) + Number(row.sktmP);

                  return (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 text-center font-medium text-slate-500 border-r border-slate-100">{idx + 1}</td>
                      <td className="p-2.5 border-r border-slate-100 font-bold text-slate-800">{row.puskesmas}</td>
                      <td className="p-2.5 border-r border-slate-100 font-semibold text-purple-900 flex items-center space-x-1.5">
                        <Building className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                        <span>{row.namaFaskesTujuan}</span>
                      </td>
                      <td className="p-2.5 border-r border-slate-100 text-center text-slate-600">{row.month}</td>

                      {/* UMUM */}
                      <td className="p-2 border-r border-slate-100 text-center">
                        {isEditing ? <input type="number" min="0" value={row.umumL} onChange={e => handleFieldChange(row.id, 'umumL', Number(e.target.value))} className="w-10 text-center border p-1 rounded" /> : row.umumL}
                      </td>
                      <td className="p-2 border-r border-slate-100 text-center">
                        {isEditing ? <input type="number" min="0" value={row.umumP} onChange={e => handleFieldChange(row.id, 'umumP', Number(e.target.value))} className="w-10 text-center border p-1 rounded" /> : row.umumP}
                      </td>

                      {/* BPJS */}
                      <td className="p-2 border-r border-slate-100 text-center">
                        {isEditing ? <input type="number" min="0" value={row.bpjsL} onChange={e => handleFieldChange(row.id, 'bpjsL', Number(e.target.value))} className="w-10 text-center border p-1 rounded" /> : row.bpjsL}
                      </td>
                      <td className="p-2 border-r border-slate-100 text-center">
                        {isEditing ? <input type="number" min="0" value={row.bpjsP} onChange={e => handleFieldChange(row.id, 'bpjsP', Number(e.target.value))} className="w-10 text-center border p-1 rounded" /> : row.bpjsP}
                      </td>

                      {/* SKTM */}
                      <td className="p-2 border-r border-slate-100 text-center">
                        {isEditing ? <input type="number" min="0" value={row.sktmL} onChange={e => handleFieldChange(row.id, 'sktmL', Number(e.target.value))} className="w-10 text-center border p-1 rounded" /> : row.sktmL}
                      </td>
                      <td className="p-2 border-r border-slate-100 text-center">
                        {isEditing ? <input type="number" min="0" value={row.sktmP} onChange={e => handleFieldChange(row.id, 'sktmP', Number(e.target.value))} className="w-10 text-center border p-1 rounded" /> : row.sktmP}
                      </td>

                      <td className="p-2 border-r border-slate-100 text-center font-bold text-purple-800 bg-purple-50/50">
                        {total}
                      </td>

                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {isEditing ? (
                            <button onClick={() => setEditingId(null)} className="p-1 text-purple-600 hover:bg-purple-50 rounded"><Check className="w-3.5 h-3.5" /></button>
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
                  <td colSpan={12} className="p-6 text-center text-slate-400">Tidak ada data rujukan terdaftar.</td>
                </tr>
              )}
            </tbody>

            {filteredData.length > 0 && (
              <tfoot>
                <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-800">
                  <td colSpan={4} className="p-3 text-right uppercase tracking-wider text-xs border-r border-slate-800">
                    TOTAL KABUPATEN ROTE NDAO
                  </td>
                  <td className="p-2 text-center border-r border-slate-800 text-slate-300">{totalUmumL}</td>
                  <td className="p-2 text-center border-r border-slate-800 text-slate-300">{totalUmumP}</td>
                  <td className="p-2 text-center border-r border-slate-800 text-teal-300">{totalBpjsL}</td>
                  <td className="p-2 text-center border-r border-slate-800 text-teal-300">{totalBpjsP}</td>
                  <td className="p-2 text-center border-r border-slate-800 text-amber-300">{totalSktmL}</td>
                  <td className="p-2 text-center border-r border-slate-800 text-amber-300">{totalSktmP}</td>
                  <td className="p-2 text-center border-r border-slate-800 bg-purple-950 text-purple-300 font-extrabold">{grandTotal}</td>
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
