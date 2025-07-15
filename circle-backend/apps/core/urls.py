# apps/core/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api import SystemConfigViewSet, SystemLogEntryViewSet

router = DefaultRouter()
router.register(r'configs', SystemConfigViewSet, basename='system-config')
router.register(r'logs', SystemLogEntryViewSet, basename='system-log')

urlpatterns = [
    path('', include(router.urls)),
]