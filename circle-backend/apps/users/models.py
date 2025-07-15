from django.contrib.auth.models import AbstractUser
from django.db import models


class Sphere(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Specialization(models.Model):
    sphere = models.ForeignKey(Sphere, on_delete=models.CASCADE, related_name="specializations")
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class User(AbstractUser):
    avatar = models.ImageField(
        upload_to="avatars/",
        blank=True,
        null=True,
        help_text="Фото профиля. Может быть загружено из Telegram или самим пользователем."
    )
    sphere = models.ForeignKey(
        Sphere,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Основная сфера деятельности пользователя."
    )
    specialization = models.ForeignKey(
        Specialization,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Специализация внутри сферы."
    )
    bio = models.TextField(
        blank=True,
        help_text="Биография или информация о себе."
    )
    interests = models.TextField(
        blank=True,
        help_text="Интересы и хобби."
    )
    phone_number = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Номер телефона для связи (запрашивается в WebApp)"
    )
    telegram_id = models.BigIntegerField(
        unique=True,
        null=True,
        blank=True,
        help_text="Уникальный Telegram ID для отправки сообщений через бот."
    )
    last_online = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Время последней активности пользователя."
    )

    # Connections / Friends
    connections = models.ManyToManyField(
        "self",
        symmetrical=True,
        blank=True,
        related_name="connected_to",
        help_text="Другие пользователи, с которыми установлено соединение."
    )

    def __str__(self):
        return self.username or f"User {self.telegram_id}"