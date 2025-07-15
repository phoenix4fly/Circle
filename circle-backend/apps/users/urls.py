from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import api

router = DefaultRouter()
# Когда создадим ViewSets, добавим их здесь
# router.register(r'users', api.UserViewSet, basename='user')

urlpatterns = router.urls