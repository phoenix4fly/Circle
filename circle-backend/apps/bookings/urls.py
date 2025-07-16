from rest_framework.routers import DefaultRouter
from . import api

router = DefaultRouter()
router.register(r'bookings', api.BookingViewSet, basename='booking')

urlpatterns = router.urls