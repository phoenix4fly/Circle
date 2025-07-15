from rest_framework.routers import DefaultRouter
from .api import TravelAgencyViewSet

router = DefaultRouter()
router.register(r'agencies', TravelAgencyViewSet, basename='agency')

urlpatterns = router.urls