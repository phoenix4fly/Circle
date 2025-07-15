# apps/core/models.py

from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class SystemConfig(models.Model):
    """
    Глобальная конфигурация системы — храним любые ключ-значения
    Например: комиссия по умолчанию, контакты поддержки
    """
    key = models.CharField(max_length=100, unique=True, help_text="Уникальный ключ")
    value = models.TextField(blank=True, help_text="Значение")

    description = models.TextField(blank=True, help_text="Описание назначения")

    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "System Configuration"
        verbose_name_plural = "System Configurations"
        ordering = ['key']

    def __str__(self):
        return f"{self.key}"


class SystemLogEntry(models.Model):
    """
    Запись системного лога — для аудита и отладки
    """
    timestamp = models.DateTimeField(auto_now_add=True)
    level = models.CharField(
        max_length=20,
        choices=[
            ("INFO", "Info"),
            ("WARNING", "Warning"),
            ("ERROR", "Error"),
            ("DEBUG", "Debug")
        ],
        default="INFO"
    )
    source = models.CharField(max_length=100, help_text="Источник события")
    message = models.TextField()
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)

    extra_data = models.JSONField(blank=True, null=True, help_text="Дополнительные данные")

    class Meta:
        verbose_name = "System Log Entry"
        verbose_name_plural = "System Log Entries"
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.level}] {self.source} @ {self.timestamp}"