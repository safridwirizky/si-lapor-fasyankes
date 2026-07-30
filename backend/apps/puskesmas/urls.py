from rest_framework.routers import DefaultRouter
from .views import (
    PuskesmasViewSet,
    KunjunganViewSet,
    GigiViewSet,
    PenyakitViewSet,
    LaboratoriumViewSet,
    RujukanViewSet,
)

router = DefaultRouter()
router.register("puskesmas", PuskesmasViewSet)
router.register("kunjungan", KunjunganViewSet)
router.register("gigi", GigiViewSet)
router.register("penyakit", PenyakitViewSet)
router.register("laboratorium", LaboratoriumViewSet)
router.register("rujukan", RujukanViewSet)

urlpatterns = router.urls

# Daftar di proyek utama (mis. config/urls.py):
#
#   from django.urls import path, include
#   urlpatterns = [
#       ...
#       path("api/", include("puskesmas.urls")),
#   ]
#
# Hasil akhirnya persis dengan endpoint yang sudah dipanggil App.tsx:
#   /api/kunjungan/  /api/gigi/  /api/penyakit/  /api/laboratorium/  /api/rujukan/
