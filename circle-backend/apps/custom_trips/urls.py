from rest_framework.routers import DefaultRouter
from . import api

router = DefaultRouter()
router.register(r'requests', api.CustomTripRequestViewSet, basename='custom-trip-request')
router.register(r'offers', api.CustomTripOfferViewSet, basename='custom-trip-offer')

urlpatterns = router.urls 