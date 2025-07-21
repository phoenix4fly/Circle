import hashlib
import hmac
import json
import time
from typing import Dict, Optional, Any, TYPE_CHECKING

from urllib.parse import parse_qsl, unquote

from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.exceptions import ObjectDoesNotExist

if TYPE_CHECKING:
    from apps.users.models import User


def validate_telegram_init_data(init_data: str, bot_token: str) -> Dict[str, Any]:
    """
    Валидация initData от Telegram WebApp
    
    Args:
        init_data: строка initData от Telegram WebApp
        bot_token: токен Telegram бота
        
    Returns:
        dict: распарсенные и проверенные данные пользователя
        
    Raises:
        ValueError: если данные невалидны
    """
    
    # Парсим query string
    try:
        parsed_data = dict(parse_qsl(init_data))
    except Exception:
        raise ValueError("Некорректный формат initData")
    
    # Проверяем наличие необходимых полей
    if 'hash' not in parsed_data:
        raise ValueError("Отсутствует hash в initData")
    
    received_hash = parsed_data.pop('hash')
    
    # Проверяем время (auth_date не должно быть старше 24 часов)
    if 'auth_date' in parsed_data:
        try:
            auth_date = int(parsed_data['auth_date'])
            current_time = int(time.time())
            # 24 часа = 86400 секунд
            if current_time - auth_date > 86400:
                raise ValueError("initData слишком старые (больше 24 часов)")
        except (ValueError, TypeError):
            raise ValueError("Некорректный auth_date")
    
    # Создаем строку для проверки подписи
    data_check_string = '\n'.join([
        f"{key}={value}" for key, value in sorted(parsed_data.items())
    ])
    
    # Вычисляем секретный ключ
    secret_key = hmac.new(
        "WebAppData".encode(),
        bot_token.encode(),
        hashlib.sha256
    ).digest()
    
    # Вычисляем хеш для проверки
    calculated_hash = hmac.new(
        secret_key,
        data_check_string.encode(),
        hashlib.sha256
    ).hexdigest()
    
    # Проверяем подпись
    if not hmac.compare_digest(calculated_hash, received_hash):
        raise ValueError("Неверная подпись initData")
    
    # Парсим данные пользователя
    user_data = {}
    if 'user' in parsed_data:
        try:
            user_data = json.loads(unquote(parsed_data['user']))
        except (json.JSONDecodeError, TypeError):
            raise ValueError("Некорректные данные пользователя")
    
    return {
        'user': user_data,
        'auth_date': parsed_data.get('auth_date'),
        'query_id': parsed_data.get('query_id'),
        'start_param': parsed_data.get('start_param'),
    }


def get_or_create_user_from_telegram(telegram_data: Dict[str, Any]):
    """
    Получает или создает пользователя на основе данных Telegram
    
    Args:
        telegram_data: валидированные данные от Telegram
        
    Returns:
        User: пользователь Django
    """
    from apps.users.models import User
    
    user_info = telegram_data.get('user', {})
    telegram_id = user_info.get('id')
    
    if not telegram_id:
        raise ValueError("Отсутствует telegram_id")
    
    # Пытаемся найти существующего пользователя
    try:
        user = User.objects.get(telegram_id=telegram_id)
        
        # Обновляем данные пользователя, если они изменились
        updated = False
        
        if user_info.get('first_name') and user.first_name != user_info.get('first_name'):
            user.first_name = user_info.get('first_name', '')[:150]  # Django limit
            updated = True
            
        if user_info.get('last_name') and user.last_name != user_info.get('last_name'):
            user.last_name = user_info.get('last_name', '')[:150]
            updated = True
            
        if user_info.get('username') and user.username != user_info.get('username'):
            # Проверяем уникальность username
            if not User.objects.filter(username=user_info.get('username')).exclude(id=user.id).exists():
                user.username = user_info.get('username')
                updated = True
        
        if updated:
            user.save()
            
        return user
        
    except ObjectDoesNotExist:
        # Создаем нового пользователя
        username = user_info.get('username') or f"tg_{telegram_id}"
        
        # Убеждаемся, что username уникален
        counter = 1
        original_username = username
        while User.objects.filter(username=username).exists():
            username = f"{original_username}_{counter}"
            counter += 1
        
        user = User.objects.create(
            telegram_id=telegram_id,
            username=username,
            first_name=user_info.get('first_name', '')[:150],
            last_name=user_info.get('last_name', '')[:150],
            is_active=True,
        )
        
        return user


def create_jwt_tokens_for_user(user) -> Dict[str, str]:
    """
    Создает JWT токены для пользователя
    
    Args:
        user: пользователь Django
        
    Returns:
        dict: access и refresh токены
    """
    refresh = RefreshToken.for_user(user)
    
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }


def get_bot_token() -> str:
    """
    Получает токен Telegram бота из настроек
    
    Returns:
        str: токен бота
        
    Raises:
        ValueError: если токен не настроен
    """
    bot_token = getattr(settings, 'BOT_TOKEN', None)
    if not bot_token:
        raise ValueError("BOT_TOKEN не настроен в settings")
    
    return bot_token


def format_user_data_for_response(user) -> Dict[str, Any]:
    """
    Форматирует данные пользователя для API ответа
    
    Args:
        user: пользователь Django
        
    Returns:
        dict: отформатированные данные пользователя
    """
    return {
        'id': user.id,
        'telegram_id': user.telegram_id,
        'username': user.username,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'email': user.email,
        'phone_number': user.phone_number,
        'avatar': user.avatar.url if user.avatar else None,
        'bio': user.bio,
        'interests': user.interests,
        'sphere': {
            'id': user.sphere.id,
            'name': user.sphere.name,
            'description': user.sphere.description,
        } if user.sphere else None,
        'specialization': {
            'id': user.specialization.id,
            'name': user.specialization.name,
            'description': user.specialization.description,
        } if user.specialization else None,
        'onboarding_completed': user.onboarding_completed,
        'sphere_selected': user.sphere_selected,
        'preferences_selected': user.preferences_selected,
        'last_online': user.last_online.isoformat() if user.last_online else None,
    } 