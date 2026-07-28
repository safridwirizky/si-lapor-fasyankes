import React, { useState } from 'react';
import { 
  AlertCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Search,
  BookOpen
} from 'lucide-react';
import { PenyakitRecord, MonthName, PUSKESMAS_LIST, MONTHS } from '../types';

interface Penyakit15ReportViewProps {
  data: PenyakitRecord[];
  setData: React.Dispatch<React.SetStateAction<PenyakitRecord[]>>;
  selectedMonth: MonthName | 'Semua';
  selectedPuskesmas: string;
}

const COMMON_ICD10 = [
  { code: 'J00', name: 'Acute nasopharyngitis [common cold]' },
  { code: 'I10', name: 'Essential (primary) hypertension' },
  { code: 'K29.7', name: 'Gastritis, unspecified' },
  { code: 'M79.1', name: 'Myalgia' },
  { code: 'E11', name: 'Non-insulin-dependent diabetes mellitus' },
  { code: 'R50.9', name: 'Fever, unspecified' },
  { code: 'A09', name: 'Infectious gastroenteritis and colitis' },
  { code: 'J02.9', name: 'Acute pharyngitis, unspecified' },
  { code: 'L03', name: 'Cellulitis' },
  { code: 'K02', name: 'Dental caries' },
];

export const Penyakit15ReportView: React.FC<Penyakit15ReportViewProps> = ({
  data,
  setData,
  selectedMonth,
  selectedPuskesmas
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [newPkm, setNewPkm] = useState(PUSKESMAS_LIST[0]);
  const [newMonth, setNewMonth] = useState<MonthName>('Januari');
  const [rank, setRank] = useState(1);
  const [icd10, setIcd10] = useState('J00');
  const [diagnosa, setDiagnosa] = useState('Acute nasopharyngitis [common cold]');
  const [kasusL, setKasusL] = useState(0);
  const [kasusP, setKasusP] = useState(0);

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

  const handleSelectPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = COMMON_ICD10.find(c => c.code === e.target.value);
    if (selected) {
      setIcd10(selected.code);
      setDiagnosa(selected.name);
    }
  };

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: PenyakitRecord = {
      id: `p-${Date.now()}`,
      puskesmas: newPkm,
      month: newMonth,
      year: 2026,
      rank: Number(rank),
      icd10,
      diagnosa,
      kasusL: Number(kasusL),
      kasusP: Number(kasusP)
    };
    setData([newRecord, ...data]);
    setShowAddForm(false);
  };

  const handleFieldChange = (id: string, field: keyof PenyakitRecord, val: any) => {
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
            <div className="flex items-center space-x-2 text-xs">
              <BookOpen className="w-3.5 h-3.5 text-amber-700" />
              <span className="text-amber-800 font-medium">Preset ICD-10:</span>
              <select onChange={handleSelectPreset} className="bg-white border p-1 rounded text-xs">
                {COMMON_ICD10.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
              </select>
            </div>
          </div>
          
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

            <div>
              <label className="block text-slate-700 font-medium mb-1">Peringkat (Rank 1-15)</label>
              <input type="number" min="1" max="15" value={rank} onChange={e => setRank(Number(e.target.value))} className="w-full bg-white border p-2 rounded-lg" />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Kode ICD-10</label>
              <input type="text" value={icd10} onChange={e => setIcd10(e.target.value)} className="w-full bg-white border p-2 rounded-lg font-mono uppercase" />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-slate-700 font-medium mb-1">Nama Diagnosa Penyakit</label>
              <input type="text" value={diagnosa} onChange={e => setDiagnosa(e.target.value)} className="w-full bg-white border p-2 rounded-lg" />
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
            <button type="submit" className="px-4 py-1.5 text-xs font-semibold bg-amber-600 text-white rounded-lg hover:bg-amber-500">Simpan Diagnosa</button>
          </div>
        </form>
      )}

      {/* Main Data Table */}
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
                          {row.rank || idx + 1}
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
                            <button onClick={() => setEditingId(null)} className="p-1 text-amber-600 hover:bg-amber-50 rounded"><Check className="w-3.5 h-3.5" /></button>
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
