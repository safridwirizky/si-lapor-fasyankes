from rest_framework import viewsets
from .models import Puskesmas
from .serializers import PuskesmasSerializer


class PuskesmasViewSet(viewsets.ModelViewSet):
    queryset = Puskesmas.objects.all()
    serializer_class = PuskesmasSerializer
    filterset_fields = ["aktif", "kecamatan"]
    search_fields = ["nama", "kode"]
