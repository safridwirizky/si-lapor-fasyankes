from django.contrib import admin
from .models import (
    Puskesmas,
    KunjunganPasien,
    KesehatanGigiMulut,
    PenyakitTerbanyak,
    PemeriksaanLaboratorium,
    Rujukan,
    IcdCode,
)


@admin.register(Puskesmas)
class PuskesmasAdmin(admin.ModelAdmin):
    list_display = ["nama", "kode", "kecamatan", "aktif"]
    search_fields = ["nama", "kode"]


@admin.register(KunjunganPasien)
class KunjunganPasienAdmin(admin.ModelAdmin):
    list_display = ["puskesmas", "bulan", "tahun", "rajal_l", "rajal_p", "ranap_l", "ranap_p"]
    list_filter = ["tahun", "bulan", "puskesmas"]


@admin.register(KesehatanGigiMulut)
class KesehatanGigiMulutAdmin(admin.ModelAdmin):
    list_display = ["puskesmas", "bulan", "tahun", "tumpatan_gigi_tetap", "pencabutan_gigi_tetap"]
    list_filter = ["tahun", "bulan", "puskesmas"]


@admin.register(PenyakitTerbanyak)
class PenyakitTerbanyakAdmin(admin.ModelAdmin):
    list_display = ["puskesmas", "bulan", "tahun", "peringkat", "icd10", "diagnosa"]
    list_filter = ["tahun", "bulan", "puskesmas"]
    ordering = ["puskesmas", "tahun", "bulan", "peringkat"]


@admin.register(PemeriksaanLaboratorium)
class PemeriksaanLaboratoriumAdmin(admin.ModelAdmin):
    list_display = ["puskesmas", "bulan", "tahun", "elemen_data", "sub_kategori", "jumlah_l", "jumlah_p"]
    list_filter = ["tahun", "bulan", "puskesmas"]


@admin.register(Rujukan)
class RujukanAdmin(admin.ModelAdmin):
    list_display = ["puskesmas", "bulan", "tahun", "nama_faskes_tujuan", "umum_l", "umum_p"]
    list_filter = ["tahun", "bulan", "puskesmas"]


@admin.register(IcdCode)
class IcdCodeAdmin(admin.ModelAdmin):
    list_display = ["code", "display"]
    search_fields = ["code", "display"]
