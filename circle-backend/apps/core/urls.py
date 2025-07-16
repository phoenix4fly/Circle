# apps/core/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import api

router = DefaultRouter()
router.register(r'configs', api.SystemConfigViewSet, basename='system-config')
router.register(r'logs', api.SystemLogEntryViewSet, basename='system-log')

urlpatterns = router.urls