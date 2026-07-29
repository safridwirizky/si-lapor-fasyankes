import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { 
  KunjunganRecord, 
  GigiRecord, 
  PenyakitRecord, 
  LabRecord, 
  RujukanRecord,
  MONTHS
} from '../types';

export const exportKunjunganToExcel = (data: KunjunganRecord[], fileName = 'LAP_KUNJUNGAN_RAJAL_RANAP_JIWA.xlsx') => {
  const wb = XLSX.utils.book_new();

  MONTHS.forEach(month => {
    const monthData = data.filter(d => d.month === month);
    const rows: any[][] = [
      ['LAPORAN KUNJUNGAN PASIEN BARU RAWAT JALAN, RAWAT INAP, & KUNJUNGAN GANGGUAN JIWA'],
      ['DI PUSKESMAS KABUPATEN ROTE NDAO'],
      [`${month.toUpperCase()} 2026`],
      [],
      ['NO', 'SARANA PELAYANAN KESEHATAN', 'JUMLAH KUNJUNGAN RAWAT JALAN', '', '', 'JUMLAH KUNJUNGAN RAWAT INAP', '', '', 'KUNJUNGAN GANGGUAN JIWA', ''],
      ['', '', 'L', 'P', 'L+P', 'L', 'P', 'L+P', 'L', 'P']
    ];

    monthData.forEach((rec, index) => {
      rows.push([
        index + 1,
        rec.puskesmas,
        rec.rajalL,
        rec.rajalP,
        rec.rajalL + rec.rajalP,
        rec.ranapL,
        rec.ranapP,
        rec.ranapL + rec.ranapP,
        rec.jiwaL,
        rec.jiwaP
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, month.toUpperCase());
  });

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);
};

export const exportGigiToExcel = (data: GigiRecord[], fileName = 'LAP_KESEHATAN_GIGI_MULUT.xlsx') => {
  const wb = XLSX.utils.book_new();

  MONTHS.forEach(month => {
    const monthData = data.filter(d => d.month === month);
    const rows: any[][] = [
      ['LAPORAN PELAYANAN KESEHATAN GIGI DAN MULUT'],
      ['DI PUSKESMAS KABUPATEN ROTE NDAO'],
      [`${month.toUpperCase()} 2026`],
      ['NO', 'PUSKESMAS', 'TUMPATAN GIGI TETAP', 'PENCABUTAN GIGI TETAP', 'JUMLAH KUNJUNGAN', 'RASIO TUMPATAN/PENCABUTAN', 'JUMLAH KASUS GIGI', 'JUMLAH KASUS DIRUJUK', '% KASUS DIRUJUK']
    ];

    monthData.forEach((rec, index) => {
      const ratio = rec.pencabutanGigiTetap > 0 ? (rec.tumpatanGigiTetap / rec.pencabutanGigiTetap).toFixed(2) : rec.tumpatanGigiTetap;
      const percentRujukan = rec.jumlahKasusGigi > 0 ? ((rec.jumlahKasusDirujuk / rec.jumlahKasusGigi) * 100).toFixed(1) + '%' : '0%';

      rows.push([
        index + 1,
        rec.puskesmas,
        rec.tumpatanGigiTetap,
        rec.pencabutanGigiTetap,
        rec.jumlahKunjungan,
        ratio,
        rec.jumlahKasusGigi,
        rec.jumlahKasusDirujuk,
        percentRujukan
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, month.toUpperCase());
  });

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);
};

export const exportPenyakitToExcel = (data: PenyakitRecord[], fileName = 'LAP_15_BESAR_PENYAKIT.xlsx') => {
  const wb = XLSX.utils.book_new();

  // Group by Puskesmas
  const pkmMap = new Map<string, PenyakitRecord[]>();
  data.forEach(d => {
    if (!pkmMap.has(d.puskesmas)) pkmMap.set(d.puskesmas, []);
    pkmMap.get(d.puskesmas)!.push(d);
  });

  pkmMap.forEach((records, pkmName) => {
    const rows: any[][] = [
      ['LAPORAN 15 BESAR PENYAKIT'],
      [`DI ${pkmName.toUpperCase()}`],
      ['TAHUN 2026'],
      ['No', 'ICD 10', 'DIAGNOSA PENYAKIT', 'BULAN', 'KASUS L', 'KASUS P', 'TOTAL KASUS']
    ];

    records.forEach((rec, idx) => {
      rows.push([
        rec.rank || idx + 1,
        rec.icd10,
        rec.diagnosa,
        rec.month,
        rec.kasusL,
        rec.kasusP,
        rec.kasusL + rec.kasusP
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, pkmName.replace('PKM ', 'PKM_'));
  });

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);
};

export const exportLabToExcel = (data: LabRecord[], fileName = 'LAP_LABORATORIUM.xlsx') => {
  const wb = XLSX.utils.book_new();

  MONTHS.forEach(month => {
    const monthData = data.filter(d => d.month === month);
    const rows: any[][] = [
      ['LAPORAN LABORATORIUM'],
      ['DI PUSKESMAS KABUPATEN ROTE NDAO'],
      [`${month.toUpperCase()} 2026`],
      ['NO', 'ELEMEN DATA / EXAMINATION', 'PUSKESMAS', 'LAKI-LAKI', 'PEREMPUAN', 'TOTAL']
    ];

    monthData.forEach((rec, idx) => {
      rows.push([
        idx + 1,
        rec.elemenData,
        rec.puskesmas,
        rec.kasusL,
        rec.kasusP,
        rec.kasusL + rec.kasusP
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, month.toUpperCase());
  });

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);
};

export const exportRujukanToExcel = (data: RujukanRecord[], fileName = 'LAP_RUJUKAN.xlsx') => {
  const wb = XLSX.utils.book_new();

  const rows: any[][] = [
    ['LAPORAN RUJUKAN FASYANKES KABUPATEN ROTE NDAO'],
    ['TAHUN 2026'],
    ['NO', 'PUSKESMAS ASAL', 'FASKES TUJUAN', 'BULAN', 'UMUM (L)', 'UMUM (P)', 'BPJS (L)', 'BPJS (P)', 'SKTM (L)', 'SKTM (P)', 'TOTAL']
  ];

  data.forEach((rec, idx) => {
    const total = rec.umumL + rec.umumP + rec.bpjsL + rec.bpjsP + rec.sktmL + rec.sktmP;
    rows.push([
      idx + 1,
      rec.puskesmas,
      rec.faskesTujuan,
      rec.month,
      rec.umumL,
      rec.umumP,
      rec.bpjsL,
      rec.bpjsP,
      rec.sktmL,
      rec.sktmP,
      total
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'REKAP_RUJUKAN');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);
};
