from rest_framework.routers import DefaultRouter
from .api import BookingViewSet

router = DefaultRouter()
router.register(r'bookings', BookingViewSet, basename='booking')

urlpatterns = router.urls