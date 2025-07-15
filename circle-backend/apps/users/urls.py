from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api import UserMeViewSet, TelegramRegisterAPIView

router = DefaultRouter()
router.register(r'me', UserMeViewSet, basename='user-me')

urlpatterns = [
    path('', include(router.urls)),
    path('telegram-register/', TelegramRegisterAPIView.as_view(), name='telegram-register'),
]