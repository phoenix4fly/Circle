from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

def upload_to(instance, filename):
    return f"media/{instance.uploaded_by.id}/{filename}"

class Media(models.Model):
    MEDIA_TYPE_CHOICES = [
        ("image", "Image"),
        ("video", "Video"),
        ("file", "File"),
    ]

    file = models.FileField(upload_to=upload_to)
    media_type = models.CharField(
        max_length=20,
        choices=MEDIA_TYPE_CHOICES,
        default="image",
        help_text="Тип медиафайла"
    )
    title = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)

    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="uploaded_media",
        help_text="Кто загрузил файл"
    )

    is_public = models.BooleanField(default=True, help_text="Доступно ли публично")
    tags = models.CharField(max_length=255, blank=True, help_text="Ключевые слова через запятую")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Media"
        verbose_name_plural = "Media Files"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title or self.file.name}"