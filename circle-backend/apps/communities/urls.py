from rest_framework.routers import DefaultRouter
from . import api

router = DefaultRouter()
# Когда создадим ViewSets, добавим их здесь
# router.register(r'communities', api.CommunityViewSet, basename='community')

urlpatterns = router.urls 