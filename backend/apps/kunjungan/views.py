from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser

from .models import KunjunganRecord
from .serializers import KunjunganRecordSerializer
from .services.importer import import_kunjungan_excel
from .services.exporter import export_kunjungan_excel


class KunjunganRecordViewSet(viewsets.ModelViewSet):
    queryset = KunjunganRecord.objects.select_related("puskesmas").all()
    serializer_class = KunjunganRecordSerializer
    filterset_fields = ["puskesmas", "bulan", "tahun"]

    @action(detail=False, methods=["post"], parser_classes=[MultiPartParser], url_path="import")
    def import_excel(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"detail": "File tidak ditemukan."}, status=status.HTTP_400_BAD_REQUEST)

        result = import_kunjungan_excel(file)
        http_status = status.HTTP_200_OK if not result["errors"] else status.HTTP_207_MULTI_STATUS
        return Response(result, status=http_status)

    @action(detail=False, methods=["get"], url_path="export")
    def export_excel(self, request):
        qs = self.filter_queryset(self.get_queryset())
        buffer = export_kunjungan_excel(qs)

        response = HttpResponse(
            buffer.read(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response["Content-Disposition"] = "attachment; filename=kunjungan.xlsx"
        return response
