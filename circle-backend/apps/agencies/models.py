from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class TravelAgency(models.Model):
    """
    Туристическое агентство-партнёр
    """
    name = models.CharField(max_length=255, unique=True, help_text="Название агентства")
    description = models.TextField(blank=True, help_text="Описание, информация об агентстве")
    is_active = models.BooleanField(default=True, help_text="Может ли публиковать туры")
    
    contact_person = models.CharField(max_length=255, blank=True, help_text="Имя контактного лица")
    email = models.EmailField(blank=True)
    phone_number = models.CharField(max_length=50, blank=True)
    address = models.TextField(blank=True)

    logo = models.ImageField(upload_to='agency_logos/', blank=True, null=True)

    # Рейтинг и оценки
    average_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0.00), MaxValueValidator(5.00)],
        help_text="Средняя оценка агентства от пользователей (0.00 - 5.00)"
    )
    total_reviews = models.PositiveIntegerField(
        default=0,
        help_text="Общее количество отзывов"
    )

    # платежные реквизиты
    commission_percent = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=5.00, 
        help_text="Процент комиссии, которую удерживает платформа"
    )

    payme_merchant_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Payme Merchant ID для split-интеграции (на будущее)"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Travel Agency"
        verbose_name_plural = "Travel Agencies"
        ordering = ['-average_rating', 'name']

    def __str__(self):
        return self.name

    def update_rating(self):
        """
        Пересчитывает среднюю оценку на основе отзывов
        """
        reviews = self.reviews.filter(is_active=True)
        if reviews.exists():
            self.average_rating = reviews.aggregate(
                avg_rating=models.Avg('rating')
            )['avg_rating'] or 0.00
            self.total_reviews = reviews.count()
        else:
            self.average_rating = 0.00
            self.total_reviews = 0
        self.save(update_fields=['average_rating', 'total_reviews'])


class AgencyReview(models.Model):
    """
    Отзывы пользователей о турагентствах
    """
    agency = models.ForeignKey(
        TravelAgency,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='agency_reviews'
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Оценка от 1 до 5"
    )
    comment = models.TextField(
        blank=True,
        help_text="Текст отзыва"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Показывать ли отзыв"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Agency Review"
        verbose_name_plural = "Agency Reviews"
        unique_together = ('agency', 'user')  # Один отзыв на агентство от пользователя
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} → {self.agency.name} ({self.rating}★)"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Автоматически пересчитываем рейтинг агентства
        self.agency.update_rating()

    def delete(self, *args, **kwargs):
        agency = self.agency
        super().delete(*args, **kwargs)
        # Пересчитываем после удаления
        agency.update_rating()