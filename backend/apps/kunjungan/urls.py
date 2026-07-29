from rest_framework.routers import DefaultRouter
from .views import KunjunganRecordViewSet

router = DefaultRouter()
router.register("", KunjunganRecordViewSet, basename="kunjungan")

urlpatterns = router.urls
