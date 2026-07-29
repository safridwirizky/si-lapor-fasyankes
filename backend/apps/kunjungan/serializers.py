from rest_framework import serializers
from .models import KunjunganRecord


class KunjunganRecordSerializer(serializers.ModelSerializer):
    puskesmas_nama = serializers.CharField(source="puskesmas.nama", read_only=True)

    class Meta:
        model = KunjunganRecord
        fields = [
            "id", "puskesmas", "puskesmas_nama", "bulan", "tahun",
            "jumlah_kunjungan_baru", "jumlah_kunjungan_lama",
            "jumlah_kunjungan_bpjs", "jumlah_kunjungan_umum",
            "created_at", "updated_at",
        ]
