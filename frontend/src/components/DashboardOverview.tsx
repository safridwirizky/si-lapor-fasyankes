import React from 'react';
import { 
  Users, 
  Smile, 
  AlertCircle, 
  TestTube2, 
  Share2, 
  TrendingUp,
  Activity,
  Award
} from 'lucide-react';
import { 
  KunjunganRecord, 
  GigiRecord, 
  PenyakitRecord, 
  LabRecord, 
  RujukanRecord,
  MonthName
} from '../types';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

interface DashboardOverviewProps {
  kunjunganData: KunjunganRecord[];
  gigiData: GigiRecord[];
  penyakitData: PenyakitRecord[];
  labData: LabRecord[];
  rujukanData: RujukanRecord[];
  selectedMonth: MonthName | 'Semua';
  selectedPuskesmas: string;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  kunjunganData,
  gigiData,
  penyakitData,
  labData,
  rujukanData,
  selectedMonth,
  selectedPuskesmas
}) => {
  // Filter semua dataset sesuai dropdown Bulan & Puskesmas di header, SEBELUM
  // dipakai untuk hitung KPI/chart apapun di bawah -- ini yang bikin seluruh
  // dashboard (termasuk "Penyakit Terbanyak") ikut update begitu filter
  // berubah, bukan cuma menampilkan agregat seluruh Kabupaten setiap saat.
  const matchesFilter = (item: { month: MonthName; puskesmas: string }) => {
    const matchMonth = selectedMonth === 'Semua' || item.month === selectedMonth;
    const matchPkm = selectedPuskesmas === 'Semua' || item.puskesmas === selectedPuskesmas;
    return matchMonth && matchPkm;
  };

  kunjunganData = kunjunganData.filter(matchesFilter);
  gigiData = gigiData.filter(matchesFilter);
  penyakitData = penyakitData.filter(matchesFilter);
  labData = labData.filter(matchesFilter);
  rujukanData = rujukanData.filter(matchesFilter);

  // Aggregate KPIs
  const totalRajal = kunjunganData.reduce((acc, curr) => acc + curr.rajalL + curr.rajalP, 0);
  const totalRanap = kunjunganData.reduce((acc, curr) => acc + curr.ranapL + curr.ranapP, 0);
  const totalJiwa = kunjunganData.reduce((acc, curr) => acc + curr.jiwaL + curr.jiwaP, 0);

  const totalTumpatan = gigiData.reduce((acc, curr) => acc + curr.tumpatanGigiTetap, 0);
  const totalPencabutan = gigiData.reduce((acc, curr) => acc + curr.pencabutanGigiTetap, 0);
  const rasioGigi = totalPencabutan > 0 ? (totalTumpatan / totalPencabutan).toFixed(2) : totalTumpatan.toFixed(2);

  const totalLabKunjungan = labData
    .filter(l => l.elemenData.toLowerCase().includes('total kunjungan'))
    .reduce((acc, curr) => acc + curr.jumlahL + curr.jumlahP, 0);

  const totalRujukan = rujukanData.reduce(
    (acc, curr) => acc + curr.umumL + curr.umumP + curr.bpjsL + curr.bpjsP + curr.sktmL + curr.sktmP, 
    0
  );

  // Puskesmas Kunjungan Ranking
  const pkmVisitMap: { [key: string]: number } = {};
  kunjunganData.forEach(k => {
    const name = k.puskesmas.replace('PKM ', '');
    pkmVisitMap[name] = (pkmVisitMap[name] || 0) + k.rajalL + k.rajalP + k.ranapL + k.ranapP;
  });
  const visitChartData = Object.keys(pkmVisitMap).map(pkm => ({
    puskesmas: pkm,
    kunjungan: pkmVisitMap[pkm]
  })).sort((a, b) => b.kunjungan - a.kunjungan);

  // Top Diseases aggregated across Rote Ndao
  const diseaseMap: { [key: string]: { code: string; name: string; total: number } } = {};
  penyakitData.forEach(p => {
    const key = p.icd10;
    if (!diseaseMap[key]) {
      diseaseMap[key] = { code: p.icd10, name: p.diagnosa, total: 0 };
    }
    diseaseMap[key].total += p.kasusL + p.kasusP;
  });
  const topDiseasesChart = Object.values(diseaseMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 7);

  // Referral Destination distribution
  const rujukanFaskesMap: { [key: string]: number } = {};
  rujukanData.forEach(r => {
    const total = r.umumL + r.umumP + r.bpjsL + r.bpjsP + r.sktmL + r.sktmP;
    rujukanFaskesMap[r.namaFaskesTujuan] = (rujukanFaskesMap[r.namaFaskesTujuan] || 0) + total;
  });
  const rujukanPieData = Object.keys(rujukanFaskesMap).map(faskes => ({
    name: faskes,
    value: rujukanFaskesMap[faskes]
  }));

  const COLORS = ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

  return (
    <div className="space-y-6">
      
      {/* Banner / Title Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 rounded-2xl border border-slate-800 shadow-xl text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Dashboard Eksekutif Pelaporan Fasyankes
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight mt-2 text-slate-100">
              Profil Pelayanan Kesehatan Kab. Rote Ndao
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Integrasi 5 laporan utama seluruh Puskesmas: Kunjungan Pasien, Kesehatan Gigi & Mulut, 15 Besar Penyakit, Pemeriksaan Laboratorium, dan Rujukan Fasyankes.
            </p>
          </div>
          <div className="flex items-center space-x-3 bg-slate-800/80 backdrop-blur px-4 py-3 rounded-xl border border-slate-700">
            <Activity className="w-8 h-8 text-emerald-400 animate-pulse" />
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Status Pengiriman Laporan</p>
              <p className="text-sm font-bold text-emerald-300">12 / 12 Puskesmas Aktif</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Total Kunjungan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Kunjungan Pasien</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{(totalRajal + totalRanap).toLocaleString('id-ID')}</p>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mt-2">
            <span className="text-emerald-600 font-medium">{totalRajal.toLocaleString('id-ID')} Rajal</span>
            <span>•</span>
            <span>{totalRanap} Ranap</span>
          </div>
        </div>

        {/* Card 2: Gigi Ratio */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Rasio Gigi (T/P)</span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
              <Smile className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{rasioGigi}</p>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mt-2">
            <span>{totalTumpatan} Tumpatan</span>
            <span>/</span>
            <span>{totalPencabutan} Cabut</span>
          </div>
        </div>

        {/* Card 3: Top Penyakit Utama */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Penyakit Utama</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-bold text-slate-900 mt-2 truncate">
            {topDiseasesChart[0] ? `${topDiseasesChart[0].code} - ${topDiseasesChart[0].name.split('[')[0]}` : 'ISPA / Nasopharyngitis'}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Top 1 Kasus Tertinggi di Rote Ndao
          </p>
        </div>

        {/* Card 4: Laboratorium */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Pemeriksaan Lab</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <TestTube2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalLabKunjungan.toLocaleString('id-ID')}</p>
          <p className="text-xs text-slate-500 mt-2">
            Total Kunjungan Lab Terdata
          </p>
        </div>

        {/* Card 5: Total Rujukan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Rujukan</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Share2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalRujukan.toLocaleString('id-ID')}</p>
          <p className="text-xs text-slate-500 mt-2">
            Pasien Dirujuk ke RSUD
          </p>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Kunjungan per Puskesmas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Total Kunjungan Pasien per Puskesmas</h3>
              <p className="text-xs text-slate-500">Perbandingan volume pelayanan kesehatan di 12 Puskesmas</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visitChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="puskesmas" angle={-35} textAnchor="end" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  formatter={(val: any) => [`${Number(val).toLocaleString('id-ID')} pasien`, 'Total Kunjungan']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="kunjungan" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Top Penyakit di Kabupaten Rote Ndao */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Penyakit Terbanyak (Surveilans 15 Besar)</h3>
              <p className="text-xs text-slate-500">Total kasus yang terdiagnosis di fasilitas pelayanan kesehatan</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topDiseasesChart} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="code" type="category" tick={{ fontSize: 11, fontWeight: 'bold', fill: '#334155' }} />
                <Tooltip 
                  formatter={(val: any, name: any, props: any) => [
                    `${val} kasus`, 
                    props.payload.name
                  ]}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="total" fill="#0284c7" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Rujukan Fasyankes Tujuan */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">Distribusi Faskes Tujuan Rujukan</h3>
              <p className="text-xs text-slate-500">Proporsi rujukan pasien ke Rumah Sakit Rujukan</p>
            </div>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {rujukanPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={rujukanPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name.replace('RSUD KAB. ', '').replace('RSUD PROF DR ', '')} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {rujukanPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [`${val} Pasien`, 'Jumlah Rujukan']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">Belum ada data rujukan</p>
            )}
          </div>
        </div>

        {/* Chart 4: Pelayanan Jiwa & Ranap */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Indikator Khusus Kategori Kesehatan</h3>
            <p className="text-xs text-slate-500">Cakupan kesehatan jiwa dan keterisian rawat inap</p>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-semibold text-slate-500">Kunjungan Jiwa</span>
                <p className="text-2xl font-black text-slate-800 mt-1">{totalJiwa} <span className="text-xs font-normal text-slate-500">pasien</span></p>
                <p className="text-[11px] text-emerald-600 mt-1 font-medium">Pelayanan ODGJ / Kesehatan Jiwa</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-semibold text-slate-500">Total Rawat Inap</span>
                <p className="text-2xl font-black text-slate-800 mt-1">{totalRanap} <span className="text-xs font-normal text-slate-500">pasien</span></p>
                <p className="text-[11px] text-teal-600 mt-1 font-medium">Puskesmas Perawatan</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center space-x-3">
            <Award className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="text-xs text-emerald-900">
              <strong className="font-semibold">Sistem Si Lapor Fasyankes:</strong> Seluruh data siap diekspor ke format resmi Excel Dinas Kesehatan Kab. Rote Ndao.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
