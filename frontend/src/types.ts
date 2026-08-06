export type ReportType =
  | 'overview'
  | 'kunjungan'
  | 'gigi'
  | 'penyakit'
  | 'laboratorium'
  | 'rujukan';

export type MonthName =
  | 'Januari' | 'Februari' | 'Maret' | 'April' | 'Mei' | 'Juni'
  | 'Juli' | 'Agustus' | 'September' | 'Oktober' | 'November' | 'Desember';

export const MONTHS: MonthName[] = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

// Sama persis dengan data seed 12 Puskesmas di backend (lihat 0002_seed_puskesmas.py)
export const PUSKESMAS_LIST: string[] = [
  'Baa', 'Batutua', 'Busalangga', 'Delha', 'Eahun', 'Feapopi',
  'Korbafo', 'Oelaba', 'Oele', 'Ndao', 'Sonimanu', 'Sotimori',
];

// puskesmas dikirim backend sebagai nama (string), lihat serializers.py -> SlugRelatedField
export interface KunjunganRecord {
  id: number;
  puskesmas: string;
  year: number;
  month: MonthName;
  rajalL: number;
  rajalP: number;
  ranapL: number;
  ranapP: number;
  jiwaL: number;
  jiwaP: number;
}

export interface GigiRecord {
  id: number;
  puskesmas: string;
  year: number;
  month: MonthName;
  tumpatanGigiTetap: number;
  pencabutanGigiTetap: number;
  jumlahKunjungan: number;
  jumlahKasusGigi: number;
  jumlahKasusDirujuk: number;
  // dihitung backend (read-only), tidak perlu dihitung ulang di frontend
  rasioTumpatanPencabutan: number | null;
  persenKasusDirujuk: number;
}

export interface PenyakitRecord {
  id: number;
  puskesmas: string;
  year: number;
  month: MonthName;
  peringkat: number; // 1..15
  icd10: string;
  diagnosa: string;
  kasusL: number;
  kasusP: number;
}

export interface LabRecord {
  id: number;
  puskesmas: string;
  year: number;
  month: MonthName;
  elemenData: string;          // mis. "Peminta Tes Laboratorium"
  subKategori: string | null;  // mis. "Poli umum", null kalau baris total
  jumlahL: number;
  jumlahP: number;
}

export interface RujukanRecord {
  id: number;
  puskesmas: string;
  year: number;
  month: MonthName;
  namaFaskesTujuan: string;
  umumL: number;
  umumP: number;
  bpjsL: number;
  bpjsP: number;
  sktmL: number;
  sktmP: number;
}
