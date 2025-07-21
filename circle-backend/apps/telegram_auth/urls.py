from django.urls import path
from . import views

app_name = 'telegram_auth'

urlpatterns = [
    # Основная аутентификация через Telegram
    path('telegram/', views.telegram_auth, name='telegram-auth'),
    
    # Обновление токенов
    path('refresh/', views.token_refresh, name='token-refresh'),
    
    # Получение данных текущего пользователя
    path('me/', views.me, name='user-me'),
    
    # Выход из системы
    path('logout/', views.logout, name='logout'),
] 