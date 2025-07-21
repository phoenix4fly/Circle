import logging
from typing import Dict, Any

from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .serializers import (
    TelegramAuthSerializer,
    TelegramAuthResponseSerializer,
    UserMeSerializer,
    TokenRefreshSerializer,
    TokenRefreshResponseSerializer
)
from .utils import (
    validate_telegram_init_data,
    get_or_create_user_from_telegram,
    create_jwt_tokens_for_user,
    get_bot_token,
    format_user_data_for_response
)

logger = logging.getLogger(__name__)


@swagger_auto_schema(
    method='post',
    operation_description="Аутентификация через Telegram WebApp",
    request_body=TelegramAuthSerializer,
    responses={
        200: TelegramAuthResponseSerializer,
        400: "Ошибка валидации данных",
        401: "Неверные данные аутентификации"
    },
    tags=['Authentication']
)
@api_view(['POST'])
@permission_classes([AllowAny])
def telegram_auth(request):
    """
    Аутентификация пользователя через Telegram WebApp
    
    Принимает initData от Telegram WebApp, валидирует подпись,
    создает или получает пользователя и возвращает JWT токены.
    """
    
    serializer = TelegramAuthSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {"error": "Некорректные данные", "details": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    init_data = request.data.get('init_data')
    if not init_data:
        return Response(
            {"error": "initData отсутствует"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Получаем токен бота
        try:
            bot_token = get_bot_token()
        except ValueError as token_error:
            logger.error(f"Ошибка конфигурации BOT_TOKEN: {token_error}")
            return Response(
                {"error": "Сервер не настроен", "details": "BOT_TOKEN не установлен в настройках сервера"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Валидируем данные Telegram (с поддержкой тестовых данных в DEBUG режиме)
        if settings.DEBUG and init_data.startswith('query_id=test'):
            # Тестовые данные для разработки
            logger.info("Используются тестовые Telegram данные в DEBUG режиме")
            telegram_data = {
                'user': {
                    'id': 123456789,
                    'first_name': 'Test',
                    'last_name': 'User',
                    'username': 'testuser',
                    'language_code': 'ru'
                },
                'auth_date': 1640995200
            }
        else:
            # Обычная валидация
            telegram_data = validate_telegram_init_data(init_data, bot_token)
        
        # Получаем или создаем пользователя
        user = get_or_create_user_from_telegram(telegram_data)
        is_new_user = not user.date_joined or user.date_joined == user.last_login
        
        # Создаем JWT токены
        tokens = create_jwt_tokens_for_user(user)
        
        # Форматируем данные пользователя
        user_data = format_user_data_for_response(user)
        
        # Определяем, нужен ли onboarding
        onboarding_required = not user.onboarding_completed
        
        logger.info(f"Успешная аутентификация пользователя {user.telegram_id} ({user.username})")
        
        response_data = {
            "message": "Аутентификация прошла успешно",
            "user": user_data,
            "tokens": tokens,
            "is_new_user": is_new_user,
            "onboarding_required": onboarding_required
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except ValueError as e:
        logger.warning(f"Ошибка валидации Telegram данных: {e}")
        return Response(
            {"error": "Неверные данные аутентификации", "details": str(e)},
            status=status.HTTP_401_UNAUTHORIZED
        )
    except Exception as e:
        logger.error(f"Ошибка аутентификации: {e}")
        return Response(
            {"error": "Внутренняя ошибка сервера"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@swagger_auto_schema(
    method='post',
    operation_description="Обновление JWT токенов",
    request_body=TokenRefreshSerializer,
    responses={
        200: TokenRefreshResponseSerializer,
        400: "Ошибка валидации",
        401: "Невалидный refresh токен"
    },
    tags=['Authentication']
)
@api_view(['POST'])
@permission_classes([AllowAny])
def token_refresh(request):
    """
    Обновление JWT токенов по refresh токену
    """
    
    serializer = TokenRefreshSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {"error": "Некорректные данные", "details": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return Response(
            {"error": "Refresh токен отсутствует"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Валидируем и обновляем токен
        refresh = RefreshToken(refresh_token)
        new_access_token = str(refresh.access_token)
        
        # Получаем новый refresh токен
        refresh.set_jti()
        refresh.set_exp()
        new_refresh_token = str(refresh)
        
        response_data = {
            "access": new_access_token,
            "refresh": new_refresh_token
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except TokenError as e:
        logger.warning(f"Ошибка обновления токена: {e}")
        return Response(
            {"error": "Невалидный refresh токен"},
            status=status.HTTP_401_UNAUTHORIZED
        )
    except Exception as e:
        logger.error(f"Ошибка обновления токена: {e}")
        return Response(
            {"error": "Внутренняя ошибка сервера"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@swagger_auto_schema(
    method='get',
    operation_description="Получение данных текущего пользователя",
    responses={
        200: UserMeSerializer,
        401: "Требуется аутентификация"
    },
    tags=['Authentication']
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """
    Получение данных текущего аутентифицированного пользователя
    """
    
    try:
        user = request.user
        user_data = format_user_data_for_response(user)
        
        return Response(user_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Ошибка получения данных пользователя: {e}")
        return Response(
            {"error": "Внутренняя ошибка сервера"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@swagger_auto_schema(
    method='post',
    operation_description="Выход из системы (аннулирование refresh токена)",
    request_body=TokenRefreshSerializer,
    responses={
        200: "Успешный выход",
        400: "Ошибка валидации"
    },
    tags=['Authentication']
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    Выход из системы - аннулирование refresh токена
    """
    
    serializer = TokenRefreshSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {"error": "Некорректные данные", "details": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return Response(
            {"error": "Refresh токен отсутствует"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
        
        logger.info(f"Пользователь {request.user.username} вышел из системы")
        
        return Response(
            {"message": "Успешный выход из системы"},
            status=status.HTTP_200_OK
        )
        
    except TokenError as e:
        logger.warning(f"Ошибка выхода: {e}")
        return Response(
            {"error": "Невалидный токен"},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Ошибка выхода: {e}")
        return Response(
            {"error": "Внутренняя ошибка сервера"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        ) 