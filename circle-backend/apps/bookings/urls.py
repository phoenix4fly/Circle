from rest_framework.routers import DefaultRouter
from . import api

router = DefaultRouter()
# Когда создадим ViewSets, добавим их здесь
# router.register(r'bookings', api.BookingViewSet, basename='booking')

urlpatterns = router.urls