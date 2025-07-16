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


# Новые модели для предпочтений путешествий
class TravelStyle(models.Model):
    """Стили отдыха"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text="Название иконки")
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Travel Style"
        verbose_name_plural = "Travel Styles"
        ordering = ['name']

    def __str__(self):
        return self.name


class TravelLocation(models.Model):
    """Локации для путешествий"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text="Название иконки")
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Travel Location"
        verbose_name_plural = "Travel Locations"
        ordering = ['name']

    def __str__(self):
        return self.name


class TripDuration(models.Model):
    """Форматы поездок по длительности"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text="Название иконки")
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Trip Duration"
        verbose_name_plural = "Trip Durations"
        ordering = ['name']

    def __str__(self):
        return self.name


class User(AbstractUser):
    GENDER_CHOICES = [
        ('M', 'Мужчина'),
        ('F', 'Женщина'),
        ('O', 'Предпочитаю не указывать'),
    ]

    avatar = models.ImageField(
        upload_to="avatars/",
        blank=True,
        null=True,
        help_text="Фото профиля. Может быть загружено из Telegram или самим пользователем."
    )
    gender = models.CharField(
        max_length=1,
        choices=GENDER_CHOICES,
        blank=True,
        null=True,
        help_text="Пол пользователя для персонализации контента и аналитики"
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
        help_text="Время последней активности пользователя"
    )
    
    # Новые поля для предпочтений путешествий
    preferred_travel_styles = models.ManyToManyField(
        TravelStyle,
        blank=True,
        related_name="users",
        help_text="Предпочитаемые стили отдыха"
    )
    preferred_travel_locations = models.ManyToManyField(
        TravelLocation,
        blank=True,
        related_name="users",
        help_text="Предпочитаемые локации"
    )
    preferred_trip_durations = models.ManyToManyField(
        TripDuration,
        blank=True,
        related_name="users",
        help_text="Предпочитаемые форматы поездок"
    )
    
    # Поля для отслеживания процесса onboarding
    onboarding_completed = models.BooleanField(
        default=False,
        help_text="Завершен ли процесс первичной настройки профиля"
    )
    sphere_selected = models.BooleanField(
        default=False,
        help_text="Выбрана ли сфера деятельности"
    )
    preferences_selected = models.BooleanField(
        default=False,
        help_text="Выбраны ли предпочтения путешествий"
    )

    # Connections / Friends
    connections = models.ManyToManyField(
        "self",
        symmetrical=True,
        blank=True,
        help_text="Пользователи, с которыми этот пользователь связан (через совместные поездки)"
    )

    def __str__(self):
        return self.full_name or self.username

    def get_gender_display_short(self):
        """Короткое отображение пола для UI"""
        gender_map = {'M': '♂', 'F': '♀', 'O': '○'}
        return gender_map.get(self.gender, '')

    @property
    def full_name(self):
        """Полное имя пользователя"""
        return f"{self.first_name} {self.last_name}".strip() or self.username

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"