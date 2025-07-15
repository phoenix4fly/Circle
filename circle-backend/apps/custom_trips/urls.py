from rest_framework.routers import DefaultRouter
from . import api

router = DefaultRouter()
# Когда создадим ViewSets, добавим их здесь
# router.register(r'requests', api.CustomTripRequestViewSet, basename='custom-trip-request')

urlpatterns = router.urls 