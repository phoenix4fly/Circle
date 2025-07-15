from rest_framework.routers import DefaultRouter
from .api import MediaViewSet

router = DefaultRouter()
router.register(r'media', MediaViewSet, basename='media')

urlpatterns = router.urls