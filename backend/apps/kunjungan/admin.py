from django.contrib import admin
from .models import KunjunganRecord


@admin.register(KunjunganRecord)
class KunjunganRecordAdmin(admin.ModelAdmin):
    list_display = ("puskesmas", "bulan", "tahun", "jumlah_kunjungan_baru", "jumlah_kunjungan_lama")
    list_filter = ("tahun", "bulan", "puskesmas")
