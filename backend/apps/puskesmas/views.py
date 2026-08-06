from rest_framework import viewsets, filters, permissions
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    Puskesmas,
    KunjunganPasien,
    KesehatanGigiMulut,
    PenyakitTerbanyak,
    PemeriksaanLaboratorium,
    Rujukan,
    IcdCode,
)
from .serializers import (
    PuskesmasSerializer,
    KunjunganRecordSerializer,
    GigiRecordSerializer,
    PenyakitRecordSerializer,
    LabRecordSerializer,
    RujukanRecordSerializer,
    IcdCodeSerializer,
)


class PuskesmasViewSet(viewsets.ModelViewSet):
    # CATATAN: dibuka publik (AllowAny) khusus di sini, bukan ubah
    # DEFAULT_PERMISSION_CLASSES global -- supaya endpoint lain yang memang
    # butuh JWT (kalau ada) tetap aman/tidak kebuka.
    permission_classes = [permissions.AllowAny]
    queryset = Puskesmas.objects.all()
    serializer_class = PuskesmasSerializer


class BaseLaporanViewSet(viewsets.ModelViewSet):
    """Semua endpoint laporan bisa difilter lewat query param, contoh:
    /api/kunjungan/?bulan=Januari&puskesmas__nama=Baa&tahun=2026
    """
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["tahun", "bulan", "puskesmas__nama"]


class KunjunganViewSet(BaseLaporanViewSet):
    queryset = KunjunganPasien.objects.select_related("puskesmas").all()
    serializer_class = KunjunganRecordSerializer


class GigiViewSet(BaseLaporanViewSet):
    queryset = KesehatanGigiMulut.objects.select_related("puskesmas").all()
    serializer_class = GigiRecordSerializer


class PenyakitViewSet(BaseLaporanViewSet):
    # peringkat dihitung otomatis lewat signal post_save/post_delete di
    # models.py (PenyakitTerbanyak.recalculate_rankings) -- berlaku untuk
    # semua jalur (API ini, Django Admin, manage.py shell), jadi ViewSet ini
    # tidak perlu override perform_create/update/destroy secara manual.
    queryset = PenyakitTerbanyak.objects.select_related("puskesmas").all()
    serializer_class = PenyakitRecordSerializer


class LaboratoriumViewSet(BaseLaporanViewSet):
    queryset = PemeriksaanLaboratorium.objects.select_related("puskesmas").all()
    serializer_class = LabRecordSerializer


class RujukanViewSet(BaseLaporanViewSet):
    queryset = Rujukan.objects.select_related("puskesmas").all()
    serializer_class = RujukanRecordSerializer
    

class IcdCodeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Referensi ~18.500 kode ICD-10 (sumber: e-klaim BPJS), read-only.
    Dipakai frontend untuk fitur cari/autocomplete saat entri diagnosa di
    laporan Penyakit -- listnya sengaja TIDAK boleh full-load (kepagingnya
    default 50/halaman), jadi frontend WAJIB kirim ?search=<kata kunci>.

    Contoh: GET /api/icd10/?search=gastritis
            GET /api/icd10/?search=K29
    """
    permission_classes = [permissions.AllowAny]
    queryset = IcdCode.objects.all()
    serializer_class = IcdCodeSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["code", "display"]
