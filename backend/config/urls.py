from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/token/", TokenObtainPairView.as_view()),
    path("api/auth/token/refresh/", TokenRefreshView.as_view()),
    path("api/", include("apps.puskesmas.urls")),
]

# CATATAN:
# - apps/kunjungan (KunjunganRecord dengan field jumlah_kunjungan_baru/lama/
#   bpjs/umum) adalah data dummy hasil generate Gemini AI, TIDAK dipakai lagi.
#   Baris "api/kunjungan/" -> apps.kunjungan sengaja dihapus dari sini.
# - Endpoint kunjungan yang dipakai App.tsx sekarang datang dari model
#   KunjunganPasien di apps/puskesmas (field rajalL/ranapL/jiwaL dst),
#   otomatis ter-route lewat DefaultRouter di apps/puskesmas/urls.py sebagai
#   "kunjungan" -> jadi endpoint akhirnya tetap /api/kunjungan/, cuma nunjuk
#   ke model yang benar.
# - Hasil akhir endpoint yang aktif:
#     /api/puskesmas/  /api/kunjungan/  /api/gigi/
#     /api/penyakit/   /api/laboratorium/  /api/rujukan/
