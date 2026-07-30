from django.db import models


BULAN_CHOICES = [
    ("Januari", "Januari"), ("Februari", "Februari"), ("Maret", "Maret"),
    ("April", "April"), ("Mei", "Mei"), ("Juni", "Juni"),
    ("Juli", "Juli"), ("Agustus", "Agustus"), ("September", "September"),
    ("Oktober", "Oktober"), ("November", "November"), ("Desember", "Desember"),
]


class Puskesmas(models.Model):
    kode = models.CharField(max_length=20, unique=True)
    nama = models.CharField(max_length=100)
    kecamatan = models.CharField(max_length=100, blank=True)
    aktif = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["nama"]
        verbose_name_plural = "Puskesmas"

    def __str__(self):
        return self.nama


class LaporanBulananBase(models.Model):
    """Kolom bersama untuk semua tabel laporan bulanan per Puskesmas."""
    puskesmas = models.ForeignKey(Puskesmas, on_delete=models.CASCADE, related_name="%(class)s_set")
    tahun = models.PositiveSmallIntegerField()
    bulan = models.CharField(max_length=10, choices=BULAN_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


# 1. LAP. KUNJUNGAN RAJAL, RANAP, & JIWA
class KunjunganPasien(LaporanBulananBase):
    rajal_l = models.PositiveIntegerField(default=0)
    rajal_p = models.PositiveIntegerField(default=0)
    ranap_l = models.PositiveIntegerField(default=0)
    ranap_p = models.PositiveIntegerField(default=0)
    jiwa_l = models.PositiveIntegerField(default=0)
    jiwa_p = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("puskesmas", "tahun", "bulan")
        verbose_name = "Laporan Kunjungan Pasien"
        verbose_name_plural = "Laporan Kunjungan Pasien"

    def __str__(self):
        return f"Kunjungan {self.puskesmas} - {self.bulan} {self.tahun}"


# 2. LAP. KESEHATAN GIGI & MULUT
class KesehatanGigiMulut(LaporanBulananBase):
    tumpatan_gigi_tetap = models.PositiveIntegerField(default=0)
    pencabutan_gigi_tetap = models.PositiveIntegerField(default=0)
    jumlah_kunjungan = models.PositiveIntegerField(default=0)
    jumlah_kasus_gigi = models.PositiveIntegerField(default=0)
    jumlah_kasus_dirujuk = models.PositiveIntegerField(default=0)
    # rasio & % kasus dirujuk sengaja TIDAK disimpan -> dihitung on-the-fly
    # (lihat properti di bawah & field serializer), supaya tidak ada data
    # turunan yang bisa "basi" kalau angka sumbernya diedit.

    class Meta:
        unique_together = ("puskesmas", "tahun", "bulan")
        verbose_name = "Laporan Kesehatan Gigi & Mulut"
        verbose_name_plural = "Laporan Kesehatan Gigi & Mulut"

    @property
    def rasio_tumpatan_pencabutan(self):
        if self.pencabutan_gigi_tetap == 0:
            return None
        return round(self.tumpatan_gigi_tetap / self.pencabutan_gigi_tetap, 2)

    @property
    def persen_kasus_dirujuk(self):
        if self.jumlah_kasus_gigi == 0:
            return 0
        return round(self.jumlah_kasus_dirujuk / self.jumlah_kasus_gigi * 100, 1)

    def __str__(self):
        return f"Gigi {self.puskesmas} - {self.bulan} {self.tahun}"


# 3. LAP. 15 BESAR PENYAKIT (1 baris = 1 penyakit dalam ranking 1-15)
class PenyakitTerbanyak(LaporanBulananBase):
    peringkat = models.PositiveSmallIntegerField()  # 1..15
    icd10 = models.CharField(max_length=20)
    diagnosa = models.CharField(max_length=255)
    kasus_l = models.PositiveIntegerField(default=0)
    kasus_p = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("puskesmas", "tahun", "bulan", "peringkat")
        ordering = ["tahun", "bulan", "peringkat"]
        verbose_name = "Laporan 15 Besar Penyakit"
        verbose_name_plural = "Laporan 15 Besar Penyakit"

    def __str__(self):
        return f"{self.icd10} - {self.diagnosa} ({self.puskesmas}, {self.bulan} {self.tahun})"


# 4. LAP. LABORATORIUM (elemen data & sub kategori dinormalisasi jadi baris,
#    karena di Excel aslinya berbentuk wide-table: elemen x puskesmas)
class PemeriksaanLaboratorium(LaporanBulananBase):
    elemen_data = models.CharField(max_length=255)      # mis. "Peminta Tes Laboratorium"
    sub_kategori = models.CharField(max_length=255, blank=True, null=True)  # mis. "Poli umum"
    jumlah_l = models.PositiveIntegerField(default=0)
    jumlah_p = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "Laporan Pemeriksaan Laboratorium"
        verbose_name_plural = "Laporan Pemeriksaan Laboratorium"

    def __str__(self):
        label = self.sub_kategori or self.elemen_data
        return f"{label} - {self.puskesmas} ({self.bulan} {self.tahun})"


# 5. LAP. RUJUKAN (1 baris = 1 fasilitas tujuan rujukan per bulan)
class Rujukan(LaporanBulananBase):
    nama_faskes_tujuan = models.CharField(max_length=255)  # mis. "RSUD KAB. ROTE NDAO"
    umum_l = models.PositiveIntegerField(default=0)
    umum_p = models.PositiveIntegerField(default=0)
    bpjs_l = models.PositiveIntegerField(default=0)
    bpjs_p = models.PositiveIntegerField(default=0)
    sktm_l = models.PositiveIntegerField(default=0)
    sktm_p = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "Laporan Rujukan"
        verbose_name_plural = "Laporan Rujukan"

    def __str__(self):
        return f"Rujukan {self.puskesmas} ke {self.nama_faskes_tujuan} ({self.bulan} {self.tahun})"
