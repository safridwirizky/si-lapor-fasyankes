from rest_framework.routers import DefaultRouter
from .views import PuskesmasViewSet

router = DefaultRouter()
router.register("", PuskesmasViewSet, basename="puskesmas")

urlpatterns = router.urls
