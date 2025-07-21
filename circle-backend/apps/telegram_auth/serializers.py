from rest_framework import serializers
from typing import Dict, Any


class TelegramAuthSerializer(serializers.Serializer):
    """
    Сериализатор для аутентификации через Telegram WebApp
    """
    init_data = serializers.CharField(
        help_text="Строка initData от Telegram WebApp",
        write_only=True,
        allow_blank=False,
        max_length=4096  # Telegram limit
    )

    def validate_init_data(self, value: str) -> str:
        """
        Валидация initData
        """
        if not value or not value.strip():
            raise serializers.ValidationError("initData не может быть пустым")
        
        return value.strip()


class TelegramAuthResponseSerializer(serializers.Serializer):
    """
    Сериализатор ответа при успешной аутентификации
    """
    message = serializers.CharField(
        default="Аутентификация прошла успешно",
        help_text="Сообщение о результате"
    )
    
    user = serializers.DictField(
        help_text="Данные пользователя"
    )
    
    tokens = serializers.DictField(
        help_text="JWT токены (access и refresh)"
    )
    
    is_new_user = serializers.BooleanField(
        default=False,
        help_text="Создан ли новый пользователь"
    )
    
    onboarding_required = serializers.BooleanField(
        default=False,
        help_text="Требуется ли прохождение onboarding"
    )


class UserMeSerializer(serializers.Serializer):
    """
    Сериализатор для получения данных текущего пользователя
    """
    id = serializers.IntegerField()
    telegram_id = serializers.IntegerField()
    username = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField(allow_null=True)
    phone_number = serializers.CharField(allow_null=True)
    avatar = serializers.URLField(allow_null=True)
    bio = serializers.CharField(allow_null=True)
    interests = serializers.CharField(allow_null=True)
    sphere = serializers.DictField(allow_null=True)
    specialization = serializers.DictField(allow_null=True)
    onboarding_completed = serializers.BooleanField()
    sphere_selected = serializers.BooleanField()
    preferences_selected = serializers.BooleanField()
    last_online = serializers.CharField(allow_null=True)


class TokenRefreshSerializer(serializers.Serializer):
    """
    Сериализатор для обновления токенов
    """
    refresh = serializers.CharField(
        help_text="Refresh токен",
        write_only=True
    )

    def validate_refresh(self, value: str) -> str:
        """
        Валидация refresh токена
        """
        if not value or not value.strip():
            raise serializers.ValidationError("Refresh токен не может быть пустым")
        
        return value.strip()


class TokenRefreshResponseSerializer(serializers.Serializer):
    """
    Сериализатор ответа при обновлении токенов
    """
    access = serializers.CharField(
        help_text="Новый access токен"
    )
    
    refresh = serializers.CharField(
        help_text="Новый refresh токен"
    ) 