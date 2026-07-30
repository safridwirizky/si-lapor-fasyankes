from rest_framework import viewsets, filters, permissions
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    Puskesmas,
    KunjunganPasien,
    KesehatanGigiMulut,
    PenyakitTerbanyak,
    PemeriksaanLaboratorium,
    Rujukan,
)
from .serializers import (
    PuskesmasSerializer,
    KunjunganRecordSerializer,
    GigiRecordSerializer,
    PenyakitRecordSerializer,
    LabRecordSerializer,
    RujukanRecordSerializer,
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
    queryset = PenyakitTerbanyak.objects.select_related("puskesmas").all()
    serializer_class = PenyakitRecordSerializer


class LaboratoriumViewSet(BaseLaporanViewSet):
    queryset = PemeriksaanLaboratorium.objects.select_related("puskesmas").all()
    serializer_class = LabRecordSerializer


class RujukanViewSet(BaseLaporanViewSet):
    queryset = Rujukan.objects.select_related("puskesmas").all()
    serializer_class = RujukanRecordSerializer
    