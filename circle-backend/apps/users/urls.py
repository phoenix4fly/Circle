from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import api, views

router = DefaultRouter()
router.register(r'users', api.UserViewSet, basename='user')
router.register(r'spheres', api.SphereViewSet, basename='sphere')
router.register(r'specializations', api.SpecializationViewSet, basename='specialization')

urlpatterns = [
    path('telegram-register/', views.TelegramRegisterView.as_view(), name='telegram-register'),
    
    # Веб авторизация
    path('register/', views.UserRegisterView.as_view(), name='user-register'),
    path('login/', views.UserLoginView.as_view(), name='user-login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # Профиль
    path('me/', views.UserMeView.as_view(), name='user-me'),
] + router.urls