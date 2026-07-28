export type ReportType = 'overview' | 'kunjungan' | 'gigi' | 'penyakit' | 'laboratorium' | 'rujukan';

export type PuskesmasName = 
  | 'PKM BAA'
  | 'PKM BATUTUA'
  | 'PKM BUSALANGGA'
  | 'PKM DELHA'
  | 'PKM EAHUN'
  | 'PKM FEAPOPI'
  | 'PKM KORBAFO'
  | 'PKM NDAO'
  | 'PKM OELABA'
  | 'PKM OELE'
  | 'PKM SONIMANU'
  | 'PKM SOTIMORI';

export const PUSKESMAS_LIST: PuskesmasName[] = [
  'PKM BAA',
  'PKM BATUTUA',
  'PKM BUSALANGGA',
  'PKM DELHA',
  'PKM EAHUN',
  'PKM FEAPOPI',
  'PKM KORBAFO',
  'PKM NDAO',
  'PKM OELABA',
  'PKM OELE',
  'PKM SONIMANU',
  'PKM SOTIMORI'
];

export const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
] as const;

export type MonthName = typeof MONTHS[number];

// 1. Kunjungan Rajal, Ranap, Jiwa
export interface KunjunganRecord {
  id: string;
  puskesmas: PuskesmasName;
  month: MonthName;
  year: number;
  rajalL: number;
  rajalP: number;
  ranapL: number;
  ranapP: number;
  jiwaL: number;
  jiwaP: number;
}

// 2. Kesehatan Gigi & Mulut
export interface GigiRecord {
  id: string;
  puskesmas: PuskesmasName;
  month: MonthName;
  year: number;
  tumpatanGigiTetap: number;
  pencabutanGigiTetap: number;
  jumlahKunjungan: number;
  jumlahKasusGigi: number;
  jumlahKasusDirujuk: number;
}

// 3. 15 Besar Penyakit
export interface PenyakitRecord {
  id: string;
  puskesmas: PuskesmasName;
  month: MonthName;
  year: number;
  rank: number;
  icd10: string;
  diagnosa: string;
  kasusL: number;
  kasusP: number;
}

// 4. Laboratorium
export interface LabRecord {
  id: string;
  puskesmas: PuskesmasName;
  month: MonthName;
  year: number;
  elemenData: string;
  kasusL: number;
  kasusP: number;
}

// 5. Rujukan
export interface RujukanRecord {
  id: string;
  puskesmas: PuskesmasName;
  faskesTujuan: string; // e.g. "RSUD KAB. ROTE NDAO", "RSUD PROF DR WZ JOHANNES"
  month: MonthName;
  year: number;
  umumL: number;
  umumP: number;
  bpjsL: number;
  bpjsP: number;
  sktmL: number;
  sktmP: number;
}

// AI Analysis Request & Response
export interface AiAnalysisRequest {
  reportType: ReportType;
  month?: string;
  puskesmas?: string;
  dataSummary: string;
}

export interface AiAnalysisResponse {
  title: string;
  summary: string;
  keyInsights: string[];
  anomaliesOrAlerts: string[];
  recommendations: string[];
}
