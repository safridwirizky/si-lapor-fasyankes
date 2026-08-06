from rest_framework import serializers
from .models import (
    Puskesmas,
    KunjunganPasien,
    KesehatanGigiMulut,
    PenyakitTerbanyak,
    PemeriksaanLaboratorium,
    Rujukan,
    IcdCode,
)


class PuskesmasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Puskesmas
        fields = ["id", "kode", "nama", "kecamatan", "aktif"]


class KunjunganRecordSerializer(serializers.ModelSerializer):
    # nama field di sini SENGAJA camelCase supaya persis sama dengan
    # interface KunjunganRecord di frontend/src/types.ts
    puskesmas = serializers.SlugRelatedField(slug_field="nama", queryset=Puskesmas.objects.all())
    year = serializers.IntegerField(source="tahun")
    month = serializers.CharField(source="bulan")
    rajalL = serializers.IntegerField(source="rajal_l")
    rajalP = serializers.IntegerField(source="rajal_p")
    ranapL = serializers.IntegerField(source="ranap_l")
    ranapP = serializers.IntegerField(source="ranap_p")
    jiwaL = serializers.IntegerField(source="jiwa_l")
    jiwaP = serializers.IntegerField(source="jiwa_p")

    class Meta:
        model = KunjunganPasien
        fields = ["id", "puskesmas", "year", "month", "rajalL", "rajalP", "ranapL", "ranapP", "jiwaL", "jiwaP"]


class GigiRecordSerializer(serializers.ModelSerializer):
    puskesmas = serializers.SlugRelatedField(slug_field="nama", queryset=Puskesmas.objects.all())
    year = serializers.IntegerField(source="tahun")
    month = serializers.CharField(source="bulan")
    tumpatanGigiTetap = serializers.IntegerField(source="tumpatan_gigi_tetap")
    pencabutanGigiTetap = serializers.IntegerField(source="pencabutan_gigi_tetap")
    jumlahKunjungan = serializers.IntegerField(source="jumlah_kunjungan")
    jumlahKasusGigi = serializers.IntegerField(source="jumlah_kasus_gigi")
    jumlahKasusDirujuk = serializers.IntegerField(source="jumlah_kasus_dirujuk")
    rasioTumpatanPencabutan = serializers.FloatField(source="rasio_tumpatan_pencabutan", read_only=True)
    persenKasusDirujuk = serializers.FloatField(source="persen_kasus_dirujuk", read_only=True)

    class Meta:
        model = KesehatanGigiMulut
        fields = [
            "id", "puskesmas", "year", "month",
            "tumpatanGigiTetap", "pencabutanGigiTetap", "jumlahKunjungan",
            "jumlahKasusGigi", "jumlahKasusDirujuk",
            "rasioTumpatanPencabutan", "persenKasusDirujuk",
        ]


class PenyakitRecordSerializer(serializers.ModelSerializer):
    puskesmas = serializers.SlugRelatedField(slug_field="nama", queryset=Puskesmas.objects.all())
    year = serializers.IntegerField(source="tahun")
    month = serializers.CharField(source="bulan")
    kasusL = serializers.IntegerField(source="kasus_l")
    kasusP = serializers.IntegerField(source="kasus_p")

    class Meta:
        model = PenyakitTerbanyak
        fields = ["id", "puskesmas", "year", "month", "peringkat", "icd10", "diagnosa", "kasusL", "kasusP"]
        # peringkat DIHITUNG OTOMATIS oleh PenyakitViewSet (lihat views.py) dari
        # jumlah kasus terbanyak dalam grup Puskesmas+Bulan+Tahun -- bukan input
        # manual, supaya tidak ada urutan ranking yang salah/duplikat.
        read_only_fields = ["peringkat"]


class LabRecordSerializer(serializers.ModelSerializer):
    puskesmas = serializers.SlugRelatedField(slug_field="nama", queryset=Puskesmas.objects.all())
    year = serializers.IntegerField(source="tahun")
    month = serializers.CharField(source="bulan")
    elemenData = serializers.CharField(source="elemen_data")
    subKategori = serializers.CharField(source="sub_kategori", allow_null=True, required=False)
    jumlahL = serializers.IntegerField(source="jumlah_l")
    jumlahP = serializers.IntegerField(source="jumlah_p")

    class Meta:
        model = PemeriksaanLaboratorium
        fields = ["id", "puskesmas", "year", "month", "elemenData", "subKategori", "jumlahL", "jumlahP"]


class RujukanRecordSerializer(serializers.ModelSerializer):
    puskesmas = serializers.SlugRelatedField(slug_field="nama", queryset=Puskesmas.objects.all())
    year = serializers.IntegerField(source="tahun")
    month = serializers.CharField(source="bulan")
    namaFaskesTujuan = serializers.CharField(source="nama_faskes_tujuan")
    umumL = serializers.IntegerField(source="umum_l")
    umumP = serializers.IntegerField(source="umum_p")
    bpjsL = serializers.IntegerField(source="bpjs_l")
    bpjsP = serializers.IntegerField(source="bpjs_p")
    sktmL = serializers.IntegerField(source="sktm_l")
    sktmP = serializers.IntegerField(source="sktm_p")

    class Meta:
        model = Rujukan
        fields = [
            "id", "puskesmas", "year", "month", "namaFaskesTujuan",
            "umumL", "umumP", "bpjsL", "bpjsP", "sktmL", "sktmP",
        ]


class IcdCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = IcdCode
        fields = ["code", "display"]
