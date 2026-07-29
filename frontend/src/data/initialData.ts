import { 
  KunjunganRecord, 
  GigiRecord, 
  PenyakitRecord, 
  LabRecord, 
  RujukanRecord,
  PUSKESMAS_LIST 
} from '../types';

export const INITIAL_KUNJUNGAN: KunjunganRecord[] = [
  // BAA
  { id: 'k1', puskesmas: 'PKM BAA', month: 'Januari', year: 2026, rajalL: 1420, rajalP: 1850, ranapL: 45, ranapP: 62, jiwaL: 18, jiwaP: 12 },
  { id: 'k2', puskesmas: 'PKM BAA', month: 'Februari', year: 2026, rajalL: 1380, rajalP: 1790, ranapL: 38, ranapP: 55, jiwaL: 15, jiwaP: 10 },
  { id: 'k3', puskesmas: 'PKM BAA', month: 'Maret', year: 2026, rajalL: 1510, rajalP: 1920, ranapL: 50, ranapP: 68, jiwaL: 20, jiwaP: 14 },
  
  // BATUTUA
  { id: 'k4', puskesmas: 'PKM BATUTUA', month: 'Januari', year: 2026, rajalL: 890, rajalP: 1120, ranapL: 28, ranapP: 34, jiwaL: 8, jiwaP: 6 },
  { id: 'k5', puskesmas: 'PKM BATUTUA', month: 'Februari', year: 2026, rajalL: 850, rajalP: 1080, ranapL: 24, ranapP: 30, jiwaL: 7, jiwaP: 5 },
  { id: 'k6', puskesmas: 'PKM BATUTUA', month: 'Maret', year: 2026, rajalL: 920, rajalP: 1180, ranapL: 30, ranapP: 38, jiwaL: 9, jiwaP: 7 },

  // BUSALANGGA
  { id: 'k7', puskesmas: 'PKM BUSALANGGA', month: 'Januari', year: 2026, rajalL: 740, rajalP: 960, ranapL: 18, ranapP: 22, jiwaL: 5, jiwaP: 4 },
  { id: 'k8', puskesmas: 'PKM BUSALANGGA', month: 'Februari', year: 2026, rajalL: 710, rajalP: 920, ranapL: 15, ranapP: 20, jiwaL: 6, jiwaP: 3 },
  { id: 'k9', puskesmas: 'PKM BUSALANGGA', month: 'Maret', year: 2026, rajalL: 780, rajalP: 1010, ranapL: 22, ranapP: 26, jiwaL: 7, jiwaP: 5 },

  // DELHA
  { id: 'k10', puskesmas: 'PKM DELHA', month: 'Januari', year: 2026, rajalL: 520, rajalP: 680, ranapL: 12, ranapP: 16, jiwaL: 3, jiwaP: 2 },
  { id: 'k11', puskesmas: 'PKM DELHA', month: 'Februari', year: 2026, rajalL: 490, rajalP: 640, ranapL: 10, ranapP: 14, jiwaL: 3, jiwaP: 2 },

  // EAHUN
  { id: 'k12', puskesmas: 'PKM EAHUN', month: 'Januari', year: 2026, rajalL: 610, rajalP: 790, ranapL: 14, ranapP: 18, jiwaL: 4, jiwaP: 3 },
  { id: 'k13', puskesmas: 'PKM EAHUN', month: 'Februari', year: 2026, rajalL: 580, rajalP: 750, ranapL: 12, ranapP: 15, jiwaL: 4, jiwaP: 3 },

  // FEAPOPI
  { id: 'k14', puskesmas: 'PKM FEAPOPI', month: 'Januari', year: 2026, rajalL: 430, rajalP: 560, ranapL: 8, ranapP: 10, jiwaL: 2, jiwaP: 1 },

  // KORBAFO
  { id: 'k15', puskesmas: 'PKM KORBAFO', month: 'Januari', year: 2026, rajalL: 680, rajalP: 870, ranapL: 16, ranapP: 20, jiwaL: 5, jiwaP: 3 },

  // NDAO
  { id: 'k16', puskesmas: 'PKM NDAO', month: 'Januari', year: 2026, rajalL: 310, rajalP: 410, ranapL: 5, ranapP: 7, jiwaL: 1, jiwaP: 1 },

  // OELABA
  { id: 'k17', puskesmas: 'PKM OELABA', month: 'Januari', year: 2026, rajalL: 590, rajalP: 760, ranapL: 11, ranapP: 15, jiwaL: 3, jiwaP: 2 },

  // OELE
  { id: 'k18', puskesmas: 'PKM OELE', month: 'Januari', year: 2026, rajalL: 640, rajalP: 820, ranapL: 13, ranapP: 17, jiwaL: 4, jiwaP: 3 },

  // SONIMANU
  { id: 'k19', puskesmas: 'PKM SONIMANU', month: 'Januari', year: 2026, rajalL: 380, rajalP: 490, ranapL: 6, ranapP: 8, jiwaL: 2, jiwaP: 1 },

  // SOTIMORI
  { id: 'k20', puskesmas: 'PKM SOTIMORI', month: 'Januari', year: 2026, rajalL: 450, rajalP: 580, ranapL: 9, ranapP: 12, jiwaL: 3, jiwaP: 2 },
];

export const INITIAL_GIGI: GigiRecord[] = [
  { id: 'g1', puskesmas: 'PKM EAHUN', month: 'Januari', year: 2026, tumpatanGigiTetap: 36, pencabutanGigiTetap: 36, jumlahKunjungan: 72, jumlahKasusGigi: 72, jumlahKasusDirujuk: 0 },
  { id: 'g2', puskesmas: 'PKM EAHUN', month: 'Februari', year: 2026, tumpatanGigiTetap: 15, pencabutanGigiTetap: 26, jumlahKunjungan: 41, jumlahKasusGigi: 41, jumlahKasusDirujuk: 0 },
  { id: 'g3', puskesmas: 'PKM EAHUN', month: 'Maret', year: 2026, tumpatanGigiTetap: 50, pencabutanGigiTetap: 35, jumlahKunjungan: 85, jumlahKasusGigi: 85, jumlahKasusDirujuk: 0 },

  { id: 'g4', puskesmas: 'PKM BAA', month: 'Januari', year: 2026, tumpatanGigiTetap: 85, pencabutanGigiTetap: 42, jumlahKunjungan: 127, jumlahKasusGigi: 127, jumlahKasusDirujuk: 3 },
  { id: 'g5', puskesmas: 'PKM BAA', month: 'Februari', year: 2026, tumpatanGigiTetap: 78, pencabutanGigiTetap: 38, jumlahKunjungan: 116, jumlahKasusGigi: 116, jumlahKasusDirujuk: 2 },

  { id: 'g6', puskesmas: 'PKM BATUTUA', month: 'Januari', year: 2026, tumpatanGigiTetap: 42, pencabutanGigiTetap: 30, jumlahKunjungan: 72, jumlahKasusGigi: 72, jumlahKasusDirujuk: 1 },
  { id: 'g7', puskesmas: 'PKM BUSALANGGA', month: 'Januari', year: 2026, tumpatanGigiTetap: 30, pencabutanGigiTetap: 25, jumlahKunjungan: 55, jumlahKasusGigi: 55, jumlahKasusDirujuk: 1 },
  { id: 'g8', puskesmas: 'PKM DELHA', month: 'Januari', year: 2026, tumpatanGigiTetap: 18, pencabutanGigiTetap: 22, jumlahKunjungan: 40, jumlahKasusGigi: 40, jumlahKasusDirujuk: 0 },
  { id: 'g9', puskesmas: 'PKM FEAPOPI', month: 'Januari', year: 2026, tumpatanGigiTetap: 12, pencabutanGigiTetap: 16, jumlahKunjungan: 28, jumlahKasusGigi: 28, jumlahKasusDirujuk: 0 },
  { id: 'g10', puskesmas: 'PKM KORBAFO', month: 'Januari', year: 2026, tumpatanGigiTetap: 24, pencabutanGigiTetap: 28, jumlahKunjungan: 52, jumlahKasusGigi: 52, jumlahKasusDirujuk: 2 },
  { id: 'g11', puskesmas: 'PKM OELE', month: 'Januari', year: 2026, tumpatanGigiTetap: 20, pencabutanGigiTetap: 24, jumlahKunjungan: 44, jumlahKasusGigi: 44, jumlahKasusDirujuk: 1 },
];

export const INITIAL_PENYAKIT: PenyakitRecord[] = [
  // PKM BATUTUA - JANUARI (Actual data from repo file)
  { id: 'p1', puskesmas: 'PKM BATUTUA', month: 'Januari', year: 2026, rank: 1, icd10: 'J00', diagnosa: 'Acute nasopharyngitis [common cold]', kasusL: 148, kasusP: 165 },
  { id: 'p2', puskesmas: 'PKM BATUTUA', month: 'Januari', year: 2026, rank: 2, icd10: 'I10', diagnosa: 'Essential (primary) hypertension', kasusL: 112, kasusP: 145 },
  { id: 'p3', puskesmas: 'PKM BATUTUA', month: 'Januari', year: 2026, rank: 3, icd10: 'K29.7', diagnosa: 'Gastritis, unspecified', kasusL: 85, kasusP: 104 },
  { id: 'p4', puskesmas: 'PKM BATUTUA', month: 'Januari', year: 2026, rank: 4, icd10: 'M79.1', diagnosa: 'Myalgia', kasusL: 62, kasusP: 78 },
  { id: 'p5', puskesmas: 'PKM BATUTUA', month: 'Januari', year: 2026, rank: 5, icd10: 'E11', diagnosa: 'Non-insulin-dependent diabetes mellitus', kasusL: 45, kasusP: 58 },
  { id: 'p6', puskesmas: 'PKM BATUTUA', month: 'Januari', year: 2026, rank: 6, icd10: 'L03', diagnosa: 'Cellulitis', kasusL: 38, kasusP: 42 },
  { id: 'p7', puskesmas: 'PKM BATUTUA', month: 'Januari', year: 2026, rank: 7, icd10: 'R50.9', diagnosa: 'Fever, unspecified', kasusL: 35, kasusP: 40 },
  { id: 'p8', puskesmas: 'PKM BATUTUA', month: 'Januari', year: 2026, rank: 8, icd10: 'J02.9', diagnosa: 'Acute pharyngitis, unspecified', kasusL: 30, kasusP: 36 },
  { id: 'p9', puskesmas: 'PKM BATUTUA', month: 'Januari', year: 2026, rank: 9, icd10: 'A09', diagnosa: 'Infectious gastroenteritis and colitis', kasusL: 28, kasusP: 32 },
  { id: 'p10', puskesmas: 'PKM BATUTUA', month: 'Januari', year: 2026, rank: 10, icd10: 'K02', diagnosa: 'Dental caries', kasusL: 25, kasusP: 31 },
  { id: 'p11', puskesmas: 'PKM BATUTUA', month: 'Januari', year: 2026, rank: 11, icd10: 'H10.9', diagnosa: 'Conjunctivitis, unspecified', kasusL: 22, kasusP: 26 },
  { id: 'p12', puskesmas: 'PKM BATUTUA', month: 'Januari', year: 2026, rank: 12, icd10: 'B35.9', diagnosa: 'Dermatophytosis, unspecified', kasusL: 20, kasusP: 24 },
  { id: 'p13', puskesmas: 'PKM BATUTUA', month: 'Januari', year: 2026, rank: 13, icd10: 'J45', diagnosa: 'Asthma', kasusL: 18, kasusP: 22 },
  { id: 'p14', puskesmas: 'PKM BATUTUA', month: 'Januari', year: 2026, rank: 14, icd10: 'N39.0', diagnosa: 'Urinary tract infection, site not specified', kasusL: 12, kasusP: 25 },
  { id: 'p15', puskesmas: 'PKM BATUTUA', month: 'Januari', year: 2026, rank: 15, icd10: 'E78.5', diagnosa: 'Hyperlipidemia, unspecified', kasusL: 15, kasusP: 18 },

  // PKM BAA - JANUARI
  { id: 'p16', puskesmas: 'PKM BAA', month: 'Januari', year: 2026, rank: 1, icd10: 'I10', diagnosa: 'Essential (primary) hypertension', kasusL: 210, kasusP: 280 },
  { id: 'p17', puskesmas: 'PKM BAA', month: 'Januari', year: 2026, rank: 2, icd10: 'J00', diagnosa: 'Acute nasopharyngitis [common cold]', kasusL: 195, kasusP: 230 },
  { id: 'p18', puskesmas: 'PKM BAA', month: 'Januari', year: 2026, rank: 3, icd10: 'K29.7', diagnosa: 'Gastritis, unspecified', kasusL: 140, kasusP: 185 },
  { id: 'p19', puskesmas: 'PKM BAA', month: 'Januari', year: 2026, rank: 4, icd10: 'E11', diagnosa: 'Non-insulin-dependent diabetes mellitus', kasusL: 95, kasusP: 130 },
  { id: 'p20', puskesmas: 'PKM BAA', month: 'Januari', year: 2026, rank: 5, icd10: 'M79.1', diagnosa: 'Myalgia', kasusL: 88, kasusP: 110 },
];

export const INITIAL_LAB: LabRecord[] = [
  // BAA
  { id: 'l1', puskesmas: 'PKM BAA', month: 'Januari', year: 2026, elemenData: 'Total Kunjungan Laboratorium', kasusL: 163, kasusP: 778 },
  { id: 'l2', puskesmas: 'PKM BAA', month: 'Januari', year: 2026, elemenData: 'Pemeriksaan Hemoglobin (Hb)', kasusL: 45, kasusP: 320 },
  { id: 'l3', puskesmas: 'PKM BAA', month: 'Januari', year: 2026, elemenData: 'Pemeriksaan Gula Darah (GDA/GDP)', kasusL: 68, kasusP: 145 },
  { id: 'l4', puskesmas: 'PKM BAA', month: 'Januari', year: 2026, elemenData: 'Pemeriksaan Kolesterol Total', kasusL: 52, kasusP: 98 },
  { id: 'l5', puskesmas: 'PKM BAA', month: 'Januari', year: 2026, elemenData: 'Pemeriksaan Asam Urat', kasusL: 40, kasusP: 75 },
  { id: 'l6', puskesmas: 'PKM BAA', month: 'Januari', year: 2026, elemenData: 'Pemeriksaan Urin Rutin', kasusL: 30, kasusP: 110 },
  { id: 'l7', puskesmas: 'PKM BAA', month: 'Januari', year: 2026, elemenData: 'Pemeriksaan Malaria (RDT / Mikroskopis)', kasusL: 15, kasusP: 18 },

  // BATUTUA
  { id: 'l8', puskesmas: 'PKM BATUTUA', month: 'Januari', year: 2026, elemenData: 'Total Kunjungan Laboratorium', kasusL: 276, kasusP: 622 },
  { id: 'l9', puskesmas: 'PKM BATUTUA', month: 'Januari', year: 2026, elemenData: 'Pemeriksaan Hemoglobin (Hb)', kasusL: 80, kasusP: 280 },
  { id: 'l10', puskesmas: 'PKM BATUTUA', month: 'Januari', year: 2026, elemenData: 'Pemeriksaan Gula Darah (GDA/GDP)', kasusL: 75, kasusP: 120 },

  // BUSALANGGA
  { id: 'l11', puskesmas: 'PKM BUSALANGGA', month: 'Januari', year: 2026, elemenData: 'Total Kunjungan Laboratorium', kasusL: 174, kasusP: 450 },
];

export const INITIAL_RUJUKAN: RujukanRecord[] = [
  // REKAP JANUARI (Actual repo data from REKAP sheet)
  { id: 'r1', puskesmas: 'PKM KORBAFO', faskesTujuan: 'RSUD KAB. ROTE NDAO', month: 'Januari', year: 2026, umumL: 2, umumP: 1, bpjsL: 5, bpjsP: 20, sktmL: 0, sktmP: 0 },
  { id: 'r2', puskesmas: 'PKM OELE', faskesTujuan: 'RSUD KAB. ROTE NDAO', month: 'Januari', year: 2026, umumL: 0, umumP: 12, bpjsL: 10, bpjsP: 32, sktmL: 0, sktmP: 0 },
  { id: 'r3', puskesmas: 'PKM SONIMANU', faskesTujuan: 'RSUD KAB. ROTE NDAO', month: 'Januari', year: 2026, umumL: 0, umumP: 0, bpjsL: 3, bpjsP: 3, sktmL: 0, sktmP: 0 },
  { id: 'r4', puskesmas: 'PKM SOTIMORI', faskesTujuan: 'RSUD KAB. ROTE NDAO', month: 'Januari', year: 2026, umumL: 0, umumP: 0, bpjsL: 10, bpjsP: 8, sktmL: 0, sktmP: 0 },
  { id: 'r5', puskesmas: 'PKM BAA', faskesTujuan: 'RSUD KAB. ROTE NDAO', month: 'Januari', year: 2026, umumL: 4, umumP: 13, bpjsL: 79, bpjsP: 121, sktmL: 0, sktmP: 0 },
  { id: 'r6', puskesmas: 'PKM BATUTUA', faskesTujuan: 'RSUD KAB. ROTE NDAO', month: 'Januari', year: 2026, umumL: 2, umumP: 5, bpjsL: 25, bpjsP: 42, sktmL: 0, sktmP: 0 },

  // Referral to RSUD PROF DR WZ JOHANNES (Provincial Kupang Referral)
  { id: 'r7', puskesmas: 'PKM BAA', faskesTujuan: 'RSUD PROF DR WZ JOHANNES', month: 'Januari', year: 2026, umumL: 0, umumP: 0, bpjsL: 3, bpjsP: 8, sktmL: 0, sktmP: 0 },
  { id: 'r8', puskesmas: 'PKM SONIMANU', faskesTujuan: 'RSUD PROF DR WZ JOHANNES', month: 'Januari', year: 2026, umumL: 0, umumP: 0, bpjsL: 1, bpjsP: 0, sktmL: 0, sktmP: 0 },
];
